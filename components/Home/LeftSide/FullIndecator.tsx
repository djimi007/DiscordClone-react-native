import { View, Text, Pressable } from "react-native";
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

const iconStyle = "bg-purple-500 p-[10%] rounded-xl";

const CustomIcon = ({
  iconName,
  onPress,
}: {
  iconName: keyof typeof AntDesign.glyphMap;
  onPress: () => void;
}) => {
  return (
    <AntDesign
      className={iconStyle}
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

export default FullIndecator;
