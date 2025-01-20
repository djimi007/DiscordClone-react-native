import { RECEIVER_ID, SENDER_ID, serverUrl } from "@/utils/constants";
import React, { useEffect, useRef, useState } from "react";
import { Button, View, StyleSheet, Switch } from "react-native";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
} from "react-native-webrtc";
import { isEnabled } from "react-native/Libraries/Performance/Systrace";
import { io, Socket } from "socket.io-client";

interface RTCPeerConnectionIceEvent {
  candidate: RTCIceCandidate | null;
}

interface EventHandlers {
  watcher: (data: { watcherId: string }) => void;
  candidate: (data: { peerId: string; candidate: RTCIceCandidateInit }) => void;
  offer: (data: { peerId: string; offer: RTCSessionDescription }) => void;
  answer: (data: { peerId: string; answer: RTCSessionDescription }) => void;
  disconnectPeer: (data: { peerId: string }) => void;
}

function generateRandomId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const VideoPage = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  const senderId = isEnabled ? SENDER_ID : RECEIVER_ID;
  const receiverId = isEnabled ? RECEIVER_ID : SENDER_ID;

  const userId = React.useMemo(() => generateRandomId(), []);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnections = useRef(new Map<string, RTCPeerConnection>());

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  useEffect(() => {
    const newSocket = io(serverUrl, { query: { userId } });
    setSocket(newSocket);

    const eventHandlers: EventHandlers = {
      watcher: handleWatcher,
      candidate: handleCandidate,
      offer: handleOffer,
      answer: handleAnswer,
      disconnectPeer: handleDisconnectPeer,
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      newSocket.on(event as keyof EventHandlers, handler);
    });

    return () => {
      Object.keys(eventHandlers).forEach((event) => {
        newSocket.off(event as keyof EventHandlers);
      });
      newSocket.disconnect();
      peerConnections.current.forEach((conn) => conn.close());
      peerConnections.current.clear();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function setupStream() {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: "user" },
        });
        if (mounted) {
          setLocalStream(stream);
          if (socket) {
            socket.emit("broadcaster");
          }
        }
      } catch (error) {
        console.error("Error getting local media stream:", error);
      }
    }

    setupStream();

    return () => {
      mounted = false;
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleWatcher = ({ watcherId }: { watcherId: string }) => {
    const connection = new RTCPeerConnection(config);
    peerConnections.current.set(watcherId, connection);
    localStream?.getTracks().forEach((track) => {
      connection.addTrack(track, localStream as MediaStream);
    });
    connection.addEventListener(
      "icecandidate",
      (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          socket?.emit("candidate", {
            peerId: watcherId,
            candidate: event.candidate,
          });
        }
      }
    );
    (async () => {
      try {
        const offer = await connection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await connection.setLocalDescription(offer);
        socket?.emit("offer", {
          peerId: watcherId,
          offer: connection.localDescription,
        });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    })();
  };

  const handleCandidate = ({
    peerId,
    candidate,
  }: {
    peerId: string;
    candidate: RTCIceCandidateInit;
  }) => {
    const pc = peerConnections.current.get(peerId);
    if (pc) {
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const handleOffer = ({
    peerId,
    offer,
  }: {
    peerId: string;
    offer: RTCSessionDescription;
  }) => {
    const connection = new RTCPeerConnection(config);
    peerConnections.current.set(peerId, connection);
    connection.setRemoteDescription(new RTCSessionDescription(offer));

    connection.addEventListener("track", (event) => {
      if (event.track && event.streams?.[0]) {
        setRemoteStream(event.streams[0]);
      }
    });

    (async () => {
      try {
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        socket?.emit("answer", { peerId, answer: connection.localDescription });
      } catch (error) {
        console.error("Error creating answer:", error);
      }
    })();
  };
  const handleAnswer = ({
    peerId,
    answer,
  }: {
    peerId: string;
    answer: RTCSessionDescription;
  }) => {
    const pc = peerConnections.current.get(peerId);
    if (pc && answer.sdp) {
      pc.setRemoteDescription(
        new RTCSessionDescription({
          type: answer.type,
          sdp: answer.sdp,
        })
      );
    }
  };

  const handleDisconnectPeer = ({ peerId }: { peerId: string }) => {
    const pc = peerConnections.current.get(peerId);
    if (pc) {
      pc.close();
    }
    peerConnections.current.delete(peerId);
    setRemoteStream(null);
  };

  const startBroadcast = () => {
    if (socket) {
      socket.emit("broadcaster");
    }
  };

  const joinBroadcast = (broadcasterId: string) => {
    if (socket) {
      socket.emit("watcher", { broadcasterId });
    }
  };

  const endCall = (peerId: string) => {
    if (socket) {
      socket.emit("disconnectPeer", { peerId });
    }
    const pc = peerConnections.current.get(peerId);
    if (pc) {
      pc.close();
    }
    peerConnections.current.delete(peerId);
    setRemoteStream(null);
  };

  return (
    <View style={styles.container}>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
      {!!localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={{ width: 200, height: 200, marginVertical: 10 }}
          mirror={true}
        />
      )}
      {!!remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{ width: 200, height: 200, marginVertical: 10 }}
        />
      )}
      <Button title="Start Broadcast" onPress={startBroadcast} />
      <Button
        title="Join Broadcast"
        onPress={() => joinBroadcast("broadcasterUserId")}
      />
      <Button title="End Call" onPress={() => endCall("peerUserId")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
});
export default VideoPage;
