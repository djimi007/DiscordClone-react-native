import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Switch,
  View,
  type ViewStyle,
} from "react-native";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
} from "react-native-webrtc";
import { io, Socket } from "socket.io-client";
import { RECEIVER_ID, SENDER_ID, serverUrl } from "@/utils/constants";

type PeerConnectionsType = Record<string, RTCPeerConnection>;

interface SocketEvents {
  broadcasterJoined: {
    senderId: string;
    socketId: string;
  };
  watcherJoined: {
    watcherId: string;
    socketId: string;
  };
  offer: {
    peerId: string;
    socketId: string;
    offer: RTCSessionDescriptionInit;
  };
  answer: {
    peerId: string;
    answer: RTCSessionDescriptionInit;
  };
  candidate: {
    peerId: string;
    candidate: RTCIceCandidateInit;
  };
  disconnectPeer: {
    peerId: string;
  };
}

const RTCConfiguration: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
  iceTransportPolicy: "all",
  iceCandidatePoolSize: 10,
};

export const VideoPage = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnections = useRef<PeerConnectionsType>({});
  const senderId = isEnabled ? SENDER_ID : RECEIVER_ID;
  const receiverId = isEnabled ? RECEIVER_ID : SENDER_ID;

  // Setup socket connection
  useEffect(() => {
    const newSocket = io(serverUrl, {
      query: { userId: senderId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
      Alert.alert("Connection Error", "Failed to connect to server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [senderId]);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    const handleSocketEvents = () => {
      socket.on(
        "broadcasterJoined",
        async ({ senderId, socketId }: SocketEvents["broadcasterJoined"]) => {
          console.log("Broadcaster joined:", senderId, socketId);
          await createPeerConnection(senderId, socketId);
        }
      );

      socket.on(
        "watcherJoined",
        async ({ watcherId, socketId }: SocketEvents["watcherJoined"]) => {
          console.log("Watcher joined:", watcherId, socketId);
          const pc = await createPeerConnection(watcherId, socketId);
          if (isEnabled && localStream && pc) {
            console.log("Creating offer for watcher");
            createOffer(watcherId);
          }
        }
      );

      socket.on(
        "offer",
        async ({ peerId, socketId, offer }: SocketEvents["offer"]) => {
          console.log("Received offer from:", peerId, socketId);

          // Ensure the offer has a valid SDP
          if (!offer.sdp) {
            console.error("Received offer with undefined SDP");
            return;
          }

          const pc =
            peerConnections.current[peerId] ||
            (await createPeerConnection(peerId, socketId));

          if (pc) {
            try {
              // Create a new RTCSessionDescription with the required SDP
              const sessionDescription = new RTCSessionDescription({
                type: offer.type,
                sdp: offer.sdp, // Ensure sdp is defined
              });

              await pc.setRemoteDescription(sessionDescription);
              await createAnswer(peerId);
            } catch (err) {
              console.error("Error handling offer:", err);
            }
          }
        }
      );
      socket.on(
        "answer",
        async ({ peerId, answer }: SocketEvents["answer"]) => {
          console.log("Received answer from:", peerId);

          // Ensure the answer has a valid SDP
          if (!answer.sdp) {
            console.error("Received answer with undefined SDP");
            return;
          }

          const pc = peerConnections.current[peerId];
          if (pc) {
            try {
              // Create a new RTCSessionDescription with the required SDP
              const sessionDescription = new RTCSessionDescription({
                type: answer.type,
                sdp: answer.sdp, // Ensure sdp is defined
              });

              await pc.setRemoteDescription(sessionDescription);
            } catch (err) {
              console.error("Error setting remote description:", err);
            }
          }
        }
      );

      socket.on(
        "candidate",
        async ({ peerId, candidate }: SocketEvents["candidate"]) => {
          console.log("Received ICE candidate from:", peerId);
          const pc = peerConnections.current[peerId];
          if (pc) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.error("Error adding ICE candidate:", err);
            }
          }
        }
      );

      socket.on(
        "disconnectPeer",
        ({ peerId }: SocketEvents["disconnectPeer"]) => {
          handleDisconnect();
        }
      );
    };

    handleSocketEvents();

    return () => {
      socket.off("broadcasterJoined");
      socket.off("watcherJoined");
      socket.off("offer");
      socket.off("answer");
      socket.off("candidate");
      socket.off("disconnectPeer");
    };
  }, [socket, isEnabled, localStream]);

  // Create a peer connection
  const createPeerConnection = async (
    peerId: string,
    socketId: string
  ): Promise<RTCPeerConnection | null> => {
    try {
      const pc = new RTCPeerConnection(RTCConfiguration);

      pc.addEventListener("icecandidate", ({ candidate }) => {
        if (candidate && socket?.connected) {
          console.log("Sending ICE candidate to:", peerId);
          socket.emit("candidate", {
            peerId,
            candidate,
          });
        }
      });

      pc.addEventListener("iceconnectionstatechange", () => {
        console.log(`ICE connection state (${peerId}):`, pc.iceConnectionState);
        if (pc.iceConnectionState === "failed") {
          pc.restartIce();
        }
      });

      pc.addEventListener("signalingstatechange", () => {
        console.log(`Connection state (${peerId}):`, pc.connectionState);
        if (pc.connectionState === "failed") {
          handleDisconnect();
        }
      });

      pc.addEventListener("track", (event) => {
        console.log("Received remote track");
        if (event.streams?.[0]) {
          setRemoteStream(event.streams[0]);
        }
      });

      if (localStream) {
        console.log("Adding local stream tracks to peer connection");
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      peerConnections.current[peerId] = pc;
      return pc;
    } catch (err) {
      console.error("Error creating peer connection:", err);
      return null;
    }
  };

  // Setup local media stream
  const setupLocalStream = async (): Promise<MediaStream | null> => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: "user",
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { ideal: 30 },
        },
      });
      console.log("Local stream created");
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      Alert.alert("Error", "Failed to access camera and microphone");
      return null;
    }
  };

  const createOffer = async (peerId: string) => {
    const pc = peerConnections.current[peerId];
    if (!pc || !socket?.connected) return;

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      // Ensure the offer has a valid SDP
      if (!offer.sdp) {
        console.error("Created offer with undefined SDP");
        return;
      }

      await pc.setLocalDescription(offer);

      console.log("Sending offer to:", peerId);
      socket.emit("offer", {
        peerId,
        offer: {
          type: offer.type,
          sdp: offer.sdp, // Ensure sdp is defined
        },
      });
    } catch (err) {
      console.error("Error creating offer:", err);
      Alert.alert("Error", "Failed to create call offer");
    }
  };

  const createAnswer = async (peerId: string) => {
    const pc = peerConnections.current[peerId];
    if (!pc || !socket?.connected) return;

    try {
      const answer = await pc.createAnswer();

      // Ensure the answer has a valid SDP
      if (!answer.sdp) {
        console.error("Created answer with undefined SDP");
        return;
      }

      await pc.setLocalDescription(answer);

      console.log("Sending answer to:", peerId);
      socket.emit("answer", {
        peerId,
        answer: {
          type: answer.type,
          sdp: answer.sdp, // Ensure sdp is defined
        },
      });
    } catch (err) {
      console.error("Error creating answer:", err);
      Alert.alert("Error", "Failed to answer call");
    }
  };
  // Cleanup connections and streams
  const cleanupConnections = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        localStream.removeTrack(track);
      });
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => {
        track.stop();
        remoteStream.removeTrack(track);
      });
      setRemoteStream(null);
    }
    Object.values(peerConnections.current).forEach((pc) => {
      pc.close();
    });
    peerConnections.current = {};
    setIsCalling(false);
  };

  // Handle disconnection
  const handleDisconnect = () => {
    cleanupConnections();
  };

  // Toggle switch between sender and receiver
  const toggleSwitch = () => {
    handleDisconnect();
    setIsEnabled((prev) => !prev);
  };

  // Start a call
  const startCall = async () => {
    if (!socket?.connected) {
      Alert.alert("Error", "Not connected to server");
      return;
    }

    const stream = await setupLocalStream();
    if (!stream) return;

    setIsCalling(true);
    if (isEnabled) {
      console.log("Emitting broadcaster event");
      socket.emit("broadcaster", { senderId, receiverId });
    } else {
      console.log("Emitting watcher event");
      socket.emit("watcher", { senderId, receiverId });
    }
  };

  // End a call
  const endCall = () => {
    if (socket?.connected) {
      socket.emit("disconnectPeer", { peerId: receiverId });
    }
    handleDisconnect();
  };

  return (
    <View style={styles.container}>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
        onValueChange={toggleSwitch}
        value={isEnabled}
        style={styles.switch}
      />

      <View style={styles.videoContainer}>
        {localStream && (
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.videoStream}
            objectFit="cover"
            mirror={true}
            zOrder={0}
          />
        )}
        {remoteStream && (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.videoStream}
            objectFit="cover"
            zOrder={1}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        {!isCalling ? (
          <Button
            title={isEnabled ? "Start Broadcasting" : "Join Call"}
            onPress={startCall}
          />
        ) : (
          <Button
            title="End Call"
            onPress={endCall}
            color={Platform.select({ ios: "#FF3B30", android: "red" })}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  } as ViewStyle,
  switch: {
    alignSelf: "flex-start",
    marginBottom: 20,
  } as ViewStyle,
  videoContainer: {
    flex: 1,
    marginVertical: 20,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  } as ViewStyle,
  videoStream: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  } as ViewStyle,
  buttonContainer: {
    marginBottom: Platform.select({ ios: 40, android: 20 }),
  } as ViewStyle,
});

export default VideoPage;
