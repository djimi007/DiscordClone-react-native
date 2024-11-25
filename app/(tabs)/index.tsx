import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { wp } from "@/utils/dimonsion";
import { Colors } from "@/constants/Colors";

const Page = () => {
  return (
    <View style={styles.container}>
      {/* create servers icons and chat in the right */}
      <View style={styles.serversContainer}></View>

      {/* second part display content of serevr   */}
      <View></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  serversContainer: {
    flex: 1,
    width: wp(25),
    backgroundColor: Colors.dark.background,
  },
});

export default Page;
