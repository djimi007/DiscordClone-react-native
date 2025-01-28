import { serverUrl } from "@/utils/constants";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { RTCView, mediaDevices, MediaStream } from "react-native-webrtc"; // Import mediaDevices
import { io, Socket } from "socket.io-client";

type OfferProp = {
  offererUserName: string;
  offer: OfferProp;
  offerIceCandidates: [];
  answererUserName: string;
  answer: OfferProp | null;
  answererIceCandidates: [];
};

const App = () => {
  const [userName] = useState(`Rob-${Math.floor(Math.random() * 100000)}`);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(
    new MediaStream()
  );
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [didIOffer, setDidIOffer] = useState(false);
  const [offers, setOffers] = useState<OfferProp[]>([]); // State to hold incoming offers
  const localVideoRef = useRef<typeof RTCView>(null);
  const remoteVideoRef = useRef<typeof RTCView>(null);
  const socketRef = useRef<Socket | null>(null); // Ref to hold socket connection

  const peerConfiguration = {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
      },
    ],
  };

  useEffect(() => {
    socketRef.current = io(serverUrl, {
      auth: {
        userName,
        password: "x",
      },
    });

    socketRef.current.on("availableOffers", (offers) => {
      // console.log(offers);
      setOffers(offers); // Update state with available offers
    });

    socketRef.current.on("newOfferAwaiting", (offers) => {
      // console.log(offers);
      setOffers((prevOffers) => [...prevOffers, ...offers]); // Append new offers
    });

    socketRef.current.on("answerResponse", async (offerObj) => {
      console.log("hadi men answerResponse", offerObj);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(offerObj.answer);
      }
    });

    socketRef.current.on("receivedIceCandidateFromServer", (iceCandidate) => {
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userName, peerConnection]);

  const fetchUserMedia = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        video: true,
        audio: true, // Enable audio if needed
      });
      setLocalStream(stream);
    } catch (err) {
      console.log(err);
    }
  };

  const createPeerConnection = async (offerObj = null) => {
    const pc = new RTCPeerConnection(peerConfiguration);
    setPeerConnection(pc);

    localStream &&
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

    pc.addEventListener("icecandidate", (e) => {
      if (e.candidate) {
        socketRef.current?.emit("sendIceCandidateToSignalingServer", {
          iceCandidate: e.candidate,
          iceUserName: userName,
          didIOffer,
        });
      }
    });

    pc.addEventListener("track", (e) => {
      const stream = e.streams[0];
      if (stream) setRemoteStream(stream);
    });

    if (offerObj) {
      try {
        console.log("Setting remote description with offer:", offerObj.offer);
        await pc.setRemoteDescription(
          new RTCSessionDescription(offerObj.offer)
        );
      } catch (error) {
        console.log("Error setting remote description:", error);
      }
    }
  };
  const call = async () => {
    try {
      await fetchUserMedia();
    } catch (error) {
      console.log(error);
    }
    try {
      await createPeerConnection();
    } catch (error) {
      console.log("error : men peerconnection ", error);
    }
    if (!peerConnection) {
      const pc = new RTCPeerConnection(peerConfiguration);
      setPeerConnection(pc);
    }
    try {
      const offer = await peerConnection?.createOffer();
      await peerConnection?.setLocalDescription(offer);
      setDidIOffer(true);
      // console.log("Emitting new offer:", offer); // Log the offer
      // Emit offer to signaling server
      socketRef.current?.emit("newOffer", offer);
    } catch (err) {
      console.log("Error creating offer:", err);
    }
  };

  const answerOffer = async (offerObj) => {
    console.log("Answering offer:", offerObj);
    try {
      await createPeerConnection(offerObj); // Ensure this sets the remote description correctly
    } catch (error) {
      console.log("Error in createPeerConnection:", error);
      return; // Exit the function if there's an error
    }

    // Check if the peerConnection is in the correct state
    if (
      peerConnection &&
      peerConnection.signalingState === "have-remote-offer"
    ) {
      try {
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        console.log("Emitting answer:", answer);
        socketRef.current?.emit("newAnswer", {
          offererUserName: offerObj.offererUserName,
          answer,
        });
      } catch (err) {
        console.log("Error creating answer:", err);
      }
    } else {
      console.log(
        "PeerConnection is not in the correct state to create an answer."
      );
    }
  };
  return (
    <View style={styles.container}>
      <Text>User: {userName}</Text>
      <View style={styles.videoContainer}>
        {localStream && (
          <RTCView
            ref={localVideoRef}
            style={styles.video}
            streamURL={localStream.toURL()} // Set the stream URL for local video
            mirror={true} // Mirror local video
          />
        )}
        {remoteStream && (
          <RTCView
            ref={remoteVideoRef}
            style={styles.video}
            streamURL={remoteStream.toURL()} // Set the stream URL for remote video
          />
        )}
      </View>
      <Button title="Call" onPress={call} />
      <ScrollView style={styles.offersContainer}>
        {offers.map((offer, index) => (
          <Button
            key={index}
            title={`Answer ${offer.offererUserName}`}
            onPress={() => answerOffer(offer)}
            color="green"
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  video: {
    width: 150,
    height: 150,
  },
  offersContainer: {
    marginTop: 20,
    width: "100%",
  },
});

export default App;
