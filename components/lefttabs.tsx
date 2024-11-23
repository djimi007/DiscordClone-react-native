import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { AntDesign, EvilIcons } from "@expo/vector-icons";
import Servers from "./Servers";
import { wp } from "@/utils/dimonsion";

const LeftTabs = () => {
  return (
    <View style={{ flex: 1 }}>
      <Pressable style={{ backgroundColor: "blue", alignSelf: "baseline" }}>
        <AntDesign name="message1" size={wp(15)} color="black" />
      </Pressable>
      <FlatList
        data={[]}
        renderItem={() => {
          return <Servers />;
        }}
      />
      <Pressable style={{ backgroundColor: "blue", alignSelf: "baseline" }}>
        <AntDesign name="adduser" size={wp(15)} color="black" />
      </Pressable>
      <Pressable style={{ backgroundColor: "blue", alignSelf: "baseline" }}>
        <AntDesign name="QQ" size={wp(15)} color="black" />
      </Pressable>
    </View>
  );
};

export default LeftTabs;

const styles = StyleSheet.create({});
