import React from "react";
import { Platform, View } from "react-native";
import { RTCView } from "react-native-webrtc";
import type { MediaStream as NativeMediaStream } from "react-native-webrtc";

interface VideoStreamProps {
  stream: NativeMediaStream | null;
  isMirrored?: boolean;
}

export function VideoStream({ stream, isMirrored }: VideoStreamProps) {
  if (!stream) return null;

  if (Platform.OS === "web") {
    return (
      <video
        ref={(ref: HTMLVideoElement | null) => {
          if (ref) ref.srcObject = stream as unknown as globalThis.MediaStream;
        }}
        autoPlay
        playsInline
        style={{
          width: 200,
          height: 200,
          transform: isMirrored ? "scaleX(-1)" : undefined,
        }}
      />
    );
  }

  return (
    <RTCView
      streamURL={stream.toURL()}
      style={{ width: 200, height: 200, marginVertical: 10 }}
      mirror={isMirrored}
    />
  );
}
