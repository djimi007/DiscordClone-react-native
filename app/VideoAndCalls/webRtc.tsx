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
          audio: true, // Enabled audio for better connectivity checks
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

    socket.on("connect", () => {
      socket.emit("joinRoom", "123");
      console.log("Socket connected with ID:", socket.id);
    });

    socket.on("newPeer", (peerId) => {
      if (peerId !== socket.id) createPeerConnection(peerId, true);
    });

    socket.on("existingPeers", (peers: string[]) => {
      peers.forEach((peerId) => {
        if (peerId !== socket.id && !peersRef.current.has(peerId)) {
          createPeerConnection(peerId, peers.length === 0);
        }
      });
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

  const createPeerConnection = (peerId: string, isInitiator: boolean) => {
    if (peersRef.current.has(peerId)) return;

    const pc = new RTCPeerConnection(configuration);

    // ICE Candidate Handling
    pc.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate);
        socketRef.current?.emit("candidate", peerId, event.candidate);
      }
    });

    // Track remote stream
    pc.addEventListener("track", (event) => {
      const stream = event.streams[0];
      console.log("Received remote track:", stream.id);
      setRemoteStream(stream);
    });

    // ICE Connection State Handling
    pc.addEventListener("iceconnectionstatechange", () => {
      console.log(`ICE state for ${peerId}:`, pc.iceConnectionState);
      if (pc.iceConnectionState === "failed") {
        console.log("Attempting ICE restart...");
        pc.restartIce();
      }
    });

    // Add local stream to connection
    localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    peersRef.current.set(peerId, pc);

    if (isInitiator) {
      createAndSendOffer(pc, peerId);
    }
  };

  const createAndSendOffer = async (pc: RTCPeerConnection, peerId: string) => {
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("offer", peerId, pc.localDescription);
    } catch (err) {
      console.error("Offer error:", err);
      setTimeout(() => createAndSendOffer(pc, peerId), 1000);
    }
  };

  const handleOffer = async (peerId: string, offer: RTCSessionDescription) => {
    const pc = peersRef.current.get(peerId) || new RTCPeerConnection(configuration);

    try {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.emit("answer", peerId, answer);

      // Add pending candidates after setting remote description
      const pending = pendingCandidatesRef.current.get(peerId) || [];
      while (pending.length > 0) {
        const candidate = pending.shift();
        if (candidate) await pc.addIceCandidate(candidate);
      }
    } catch (err) {
      console.error("Offer handling error:", err);
    }
  };

  const handleAnswer = async (peerId: string, answer: RTCSessionDescription) => {
    const pc = peersRef.current.get(peerId);
    if (!pc) return;

    try {
      await pc.setRemoteDescription(answer);
    } catch (err) {
      console.error("Answer handling error:", err);
    }
  };

  const handleCandidate = (peerId: string, candidate: RTCIceCandidate) => {
    const pc = peersRef.current.get(peerId);
    if (pc && pc.remoteDescription) {
      pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
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

// Keep the same styles as before
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
