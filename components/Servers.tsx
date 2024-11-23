import { View, Text, Pressable } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";

interface Props {
  iconName: string;
  backgroundColor: string;
}

const Server = ({ iconName, backgroundColor }: Props) => {
  return (
    <Pressable style={{ backgroundColor: backgroundColor, alignSelf: "baseline" }}>
      <AntDesign name={iconName} size={50} color="black" />
    </Pressable>
  );
};

export default Server;
