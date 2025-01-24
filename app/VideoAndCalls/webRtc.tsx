import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { serverUrl } from "@/utils/constants";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
} from "react-native-webrtc";
import { io, Socket } from "socket.io-client";

const VideoChat = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidate[]>>(
    new Map()
  );

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
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
      peers.forEach((peerId) => {
        if (peerId !== socket.id) createPeerConnection(peerId, false);
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

  const createPeerConnection = async (peerId: string, isInitiator: boolean) => {
    if (peersRef.current.has(peerId)) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    localStream
      ?.getTracks()
      .forEach((track) => pc.addTrack(track, localStream));
    setupPeerConnectionHandlers(pc, peerId);

    if (isInitiator) {
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        socketRef.current?.emit("offer", peerId, offer);
      } catch (err) {
        console.error("Error creating offer:", err);
        pc.close();
      }
    }

    peersRef.current.set(peerId, pc);
  };

  const handleOffer = async (peerId: string, offer: RTCSessionDescription) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    localStream
      ?.getTracks()
      .forEach((track) => pc.addTrack(track, localStream));
    setupPeerConnectionHandlers(pc, peerId);

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
    const pc = peersRef.current.get(peerId);
    if (pc?.remoteDescription) {
      pc.addIceCandidate(candidate).catch((err) =>
        console.error("Error adding ICE candidate:", err)
      );
    } else {
      const candidates = pendingCandidatesRef.current.get(peerId) || [];
      candidates.push(candidate);
      pendingCandidatesRef.current.set(peerId, candidates);
    }
  };

  const removePeer = (peerId: string) => {
    const pc = peersRef.current.get(peerId);
    if (pc) {
      pc.close();
      peersRef.current.delete(peerId);
      pendingCandidatesRef.current.delete(peerId);
      setRemoteStreams((prev) => {
        const newMap = new Map(prev);
        newMap.delete(peerId);
        return newMap;
      });
    }
  };

  const addIceCandidates = async (pc: RTCPeerConnection, peerId: string) => {
    const candidates = pendingCandidatesRef.current.get(peerId) || [];
    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (err) {
        console.error("Error adding pending ICE candidate:", err);
      }
    }
    pendingCandidatesRef.current.delete(peerId);
  };

  const handleAnswer = async (
    peerId: string,
    answer: RTCSessionDescription
  ) => {
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

  const setupPeerConnectionHandlers = (
    pc: RTCPeerConnection,
    peerId: string
  ) => {
    const remoteStream = new MediaStream();
    const addedTracks = new Set();

    pc.addEventListener("track", (event) => {
      const track = event.track;
      if (!track) return;
      if (!addedTracks.has(track?.id)) {
        remoteStream.addTrack(track!);
        addedTracks.add(track?.id);
        setRemoteStreams((prev) => new Map(prev).set(peerId, remoteStream));
      }
    });
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
      {Array.from(remoteStreams).map(([peerId, stream]) => (
        <RTCView
          key={peerId}
          style={styles.remoteVideo}
          streamURL={stream.toURL()}
          objectFit="contain"
          zOrder={1}
          mirror={false}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
  },
  localVideo: {
    width: 120,
    height: 160,
    margin: 4,
    backgroundColor: "#000",
  },
  remoteVideo: {
    width: "48%",
    height: 300,
    margin: 4,
    backgroundColor: "#000",
  },
});

export default VideoChat;
