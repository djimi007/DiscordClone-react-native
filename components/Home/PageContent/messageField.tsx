import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { wp } from "@/utils/dimonsion";

interface Channel {
  type: "Audio" | "Text";
  content: string;
  messageSenderId: string;
}

const MessageField = memo(
  ({ type = "Text", content, messageSenderId }: Channel) => {
    return (
      <Pressable
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBlockColor: "black",
          borderBottomWidth: 0.21,
          marginHorizontal: wp(5),
        }}
      >
        <Text style={{ color: "grey" }}>{content}</Text>
        <Ionicons name="add-circle" size={20} color={"white"} />
      </Pressable>
    );
  }
);

export default memo(MessageField);

const styles = StyleSheet.create({});
