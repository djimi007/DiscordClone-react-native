import { View, Text, Pressable, StyleSheet } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { wp } from "@/utils/dimonsion";
import Indecator from "./Indecator";

interface Props {
  currentIndex: number;
  setCurrentIndex: (number: number) => void;
  index: number;
  name: keyof typeof AntDesign.glyphMap;
}

const CustomIcon = ({
  iconName,
  onPress,
}: {
  iconName: keyof typeof AntDesign.glyphMap;
  onPress: () => void;
}) => {
  return (
    <AntDesign
      style={styles.icon}
      name={iconName}
      size={wp(9)}
      onPress={onPress}
    />
  );
};

const FullIndecator = ({
  name,
  index,
  currentIndex,
  setCurrentIndex,
}: Props) => {
  return (
    <Pressable
      style={{ flexDirection: "row", gap: wp(1), alignItems: "center" }}
    >
      {currentIndex === index && <Indecator />}
      <CustomIcon
        iconName={name}
        onPress={() => {
          setCurrentIndex(index);
        }}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  icon: {
    backgroundColor: "#a855f7",
    padding: "10%",
    borderRadius: wp(3),
  },
});
export default FullIndecator;
