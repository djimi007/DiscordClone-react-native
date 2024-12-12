import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { wp } from "@/utils/dimonsion";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { messages } from "@/fake_data/data";
import MessageField from "./messageField";

interface Props {
  channelName: string;
}

const ChannelView = ({ channelName }: Props) => {
  const [arrow, setArrow] = useState<boolean>(false);
  const height = useSharedValue(0);

  const toggleHeight = () => {
    height.value = withTiming(arrow ? 0 : 100); // Toggle height
    setArrow(!arrow);
  };

  // Create an animated style for the ScrollView
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
      overflow: "hidden",
    };
  });

  return (
    <>
      <Pressable style={styles.pressableView} onPress={toggleHeight}>
        <View style={styles.channelBox}>
          <Text style={styles.pressableText}>{channelName}</Text>
          <Ionicons
            name={arrow ? "arrow-down" : "arrow-back"}
            size={20}
            color={"white"}
          />
        </View>
      </Pressable>
      <Animated.ScrollView
        style={animatedStyle} // Use the animated style here
        showsVerticalScrollIndicator={false}
      >
        {messages.map((e, i) => (
          <MessageField
            messageSenderId={e.senderId}
            content={e.message}
            type="Text"
            key={i}
          />
        ))}
      </Animated.ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  pressableView: {
    marginHorizontal: wp(1.5),
    justifyContent: "space-between",
    paddingHorizontal: wp(3),
    paddingVertical: wp(1),
    backgroundColor: "#3f3f46",
    borderRadius: wp(2),
  },
  pressableText: {
    color: "#f8fafc",
    fontSize: 16,
  },
  channelBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: wp(1),
  },
});

export default ChannelView;
