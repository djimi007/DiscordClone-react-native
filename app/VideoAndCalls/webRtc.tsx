import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { configuration, serverUrl } from "@/utils/constants";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
} from "react-native-webrtc";
import { io, Socket } from "socket.io-client";
import { hp, wp } from "@/utils/dimonsion";

const VideoChat = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidate[]>>(new Map());

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 },
          },
        });

        setLocalStream(stream);
      } catch (error) {
        console.error("Media error:", error);
      }
    };
    initMedia();
  }, []);

  useEffect(() => {
    if (!localStream) return;

    const socket = io(serverUrl);
    socketRef.current = socket;

    socket.emit("joinRoom", "123");

    socket.on("newPeer", (peerId) => {
      if (peerId !== socket.id) createPeerConnection(peerId, true);
    });

    socket.on("existingPeers", (peers: string[]) => {
      if (peers.length < 2) {
        peers.forEach((peerId) => {
          if (peerId !== socket.id) createPeerConnection(peerId, false);
        });
      } else {
        console.warn("Room is full. Cannot join.");
      }
    });

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("candidate", handleCandidate);
    socket.on("removePeer", removePeer);

    return () => {
      socket.disconnect();
      peersRef.current.forEach((pc) => pc.close());
      localStream?.getTracks().forEach((track) => track.stop());
      pendingCandidatesRef.current.clear();
    };
  }, [localStream]);

  const createPeerConnection = async (peerId: string, isInitiator: boolean) => {
    if (peersRef.current.has(peerId)) return;

    const pc = new RTCPeerConnection(configuration);

    pc.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        console.log("ICE Candidate Details:", event.candidate);
        socketRef.current?.emit("candidate", peerId, event.candidate);
      }
    });

    pc.addEventListener("icecandidateerror", (event) => {
      console.error("ICE Candidate Error:", event);
    });

    pc.addEventListener("iceconnectionstatechange", () => {
      console.log("Detailed ICE State:", {
        state: pc.iceConnectionState,
        signalingState: pc.signalingState,
        connectionState: pc.connectionState,
      });
    });
    localStream && localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    setupPeerConnectionHandlers(pc);

    if (isInitiator) {
      const createOfferWithRetry = async () => {
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);
          socketRef.current?.emit("offer", peerId, pc.localDescription);
        } catch (err) {
          console.error("Offer creation failed, retrying...", err);
          setTimeout(createOfferWithRetry, 1000);
        }
      };
      createOfferWithRetry();
    }

    peersRef.current.set(peerId, pc);
  };

  const handleOffer = async (peerId: string, offer: RTCSessionDescription) => {
    const pc = new RTCPeerConnection(configuration);
    localStream?.getTracks().forEach((track) => pc.addTrack(track, localStream));

    setupPeerConnectionHandlers(pc);

    try {
      await pc.setRemoteDescription(offer);
      await addIceCandidates(pc, peerId);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.emit("answer", peerId, answer);
      peersRef.current.set(peerId, pc);
    } catch (err) {
      console.error("Error handling offer:", err);
      pc.close();
    }
  };
  const handleCandidate = (peerId: string, candidate: RTCIceCandidate) => {
    if (!candidate || !candidate.candidate) {
      console.error("Invalid candidate received:", candidate);
      return;
    }
    const pc = peersRef.current.get(peerId);
    if (pc && pc.remoteDescription) {
      pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((err) =>
        console.error("Error adding ICE candidate:", err)
      );
    } else {
      const pending = pendingCandidatesRef.current.get(peerId) || [];
      pending.push(candidate);
      pendingCandidatesRef.current.set(peerId, pending);
    }
  };

  const removePeer = (peerId: string) => {
    const pc = peersRef.current.get(peerId);
    if (pc) {
      pc.close();
      peersRef.current.delete(peerId);
      pendingCandidatesRef.current.delete(peerId);
      setRemoteStream(null);
    }
  };

  const addIceCandidates = async (pc: RTCPeerConnection, peerId: string) => {
    const candidates = pendingCandidatesRef.current.get(peerId) || [];
    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding pending ICE candidate:", err);
      }
    }
    pendingCandidatesRef.current.delete(peerId);
  };

  const handleAnswer = async (peerId: string, answer: RTCSessionDescription) => {
    const pc = peersRef.current.get(peerId);
    if (!pc) return;

    try {
      if (pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(answer);
        await addIceCandidates(pc, peerId);
      }
    } catch (err) {
      console.error("Answer handling error:", err);
    }
  };

  const setupPeerConnectionHandlers = (pc: RTCPeerConnection) => {
    pc.addEventListener("track", (event) => {
      const track = event.track;
      if (track) {
        const stream = event.streams[0];
        console.log("Remote track received:", track.kind);
        setRemoteStream(stream);
      }
    });

    pc.addEventListener("iceconnectionstatechange", () => {
      console.log("ICE Connection State:", pc.iceConnectionState);
      switch (pc.iceConnectionState) {
        case "new":
          console.log("ICE connection is new.");
          break;
        case "checking":
          console.log("ICE connection is checking.");
          break;
        case "connected":
          console.log("ICE connection established successfully.");
          break;
        case "completed":
          console.log("ICE connection completed.");
          break;
        case "failed":
          console.error("ICE connection failed.");
          pc.restartIce();

          break;
        case "disconnected":
          console.warn("ICE connection disconnected.");
          break;
        case "closed":
          console.log("ICE connection closed.");
          break;
        default:
          console.log("ICE connection state:", pc.iceConnectionState);
      }
    });
    pc.addEventListener("iceconnectionstatechange", () => {
      if (pc.iceConnectionState === "failed") {
        // Initiate ICE restart
        pc.restartIce();
      }
    });
    pc.addEventListener("connectionstatechange", () => {
      console.log("Peer Connection State:", pc.connectionState);
    });
  };

  useEffect(() => {
    console.log(remoteStream?.toURL());
  }, [remoteStream]);
  return (
    <View style={styles.container}>
      {localStream && (
        <RTCView
          style={styles.localVideo}
          streamURL={localStream.toURL()}
          mirror={true}
          objectFit="cover"
        />
      )}
      {remoteStream ? (
        <RTCView style={styles.remoteVideo} streamURL={remoteStream.toURL()} objectFit="cover" />
      ) : (
        <View style={styles.placeholderView}>
          <Text>Waiting for remote video...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  localVideo: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 120,
    height: 160,
    zIndex: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: "#000",
  },
  placeholderView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});

export default VideoChat;
