import { Colors } from "@/constants/Colors";
import { channels } from "@/fake_data/data";
import { hp, wp } from "@/utils/dimonsion";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import ChannelView from "./chnnelView";
// import { ws } from "@/constants/utils";

import { io } from "socket.io-client";

const ServerContent = () => {
  return (
    <View style={styles.container}>
      {/* Header  */}
      <View style={styles.header}>
        {/* Server Name */}
        <Text style={styles.serverName}>Messages</Text>

        {/* search add and schulader  */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={22} color={"white"} />
            <Text style={styles.searchText}>Search</Text>
          </View>
          <Ionicons
            style={styles.addIcon}
            name="person-add"
            size={16}
            color={"white"}
          />
        </View>
      </View>
      {/* Custom Servers and Chat  */}
      <View style={styles.separator} />
      <ScrollView
        style={styles.pressableContainer}
        contentContainerStyle={{ gap: wp(1) }}
      >
        {channels.map((e, i) => {
          return <ChannelView channelName={e.channelName} key={i} />;
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 30, // Adjusted for rounded corners
    backgroundColor: Colors.dark.background, // Equivalent to bg-zinc-700
  },
  header: {
    gap: 24, // Adjusted for spacing
  },
  serverName: {
    color: "#f8fafc", // Equivalent to color-slate-100
    fontWeight: "800", // Equivalent to font-extrabold
    fontSize: 24, // Equivalent to text-2xl
    marginLeft: 8, // Equivalent to ml-2
  },
  searchContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12, // Equivalent to gap-3
    paddingHorizontal: 12, // Equivalent to px-3
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16, // Equivalent to gap-4
    flex: 1,
    backgroundColor: "#3f3f46",
    borderRadius: 9999, // Full rounded
    height: 40, // Equivalent to h-10
    width: "75%", // Equivalent to w-[75%]
  },
  searchText: {
    fontSize: 18, // Equivalent to text-lg
    color: "#d1d5db", // Equivalent to color-zinc-300
  },
  addIcon: {
    padding: 12, // Equivalent to p-3
    backgroundColor: "#3f3f46",
    borderRadius: 9999, // Full rounded
  },
  separator: {
    width: "100%",
    backgroundColor: Colors.dark.background, // Equivalent to bg-zinc-700
    marginTop: 8, // Equivalent to mt-2
    height: 1, // Equivalent to h-[0.1%]
  },
  pressableContainer: {
    paddingTop: 8,
  },
  pressableView: {
    marginHorizontal: wp(1.5),
    justifyContent: "space-between",
    paddingHorizontal: wp(3),
    paddingVertical: wp(1),
    backgroundColor: "#3f3f46",
    borderRadius: wp(2),
  },
  pressableText: {
    color: "#f8fafc", // Equivalent to color-slate-100
    fontSize: 16, // Equivalent to text-base
  },
  channelBox: {
    flexDirection: "row",
    marginHorizontal: wp(1.5),
    justifyContent: "space-between",
    paddingHorizontal: wp(3),
    paddingVertical: wp(1),
    backgroundColor: "#3f3f46",
    borderRadius: wp(2),
  },
});
export default ServerContent;
