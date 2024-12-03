import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { hp, wp } from "@/utils/dimonsion";
import { Colors } from "@/constants/Colors";
import LeftTabs from "@/components/Home/LeftSide/LeftTab";
import ServerContent from "@/components/Home/PageContent//ServerContent";

const Page = () => {
  return (
    <View className="flex-row flex-1 bg-zinc-950">
      {/* create servers icons and chat in the right */}

      <View>
        <LeftTabs />
      </View>

      {/* second part display content of serevr   */}
      <View style={styles.serverChats}>
        <ServerContent />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  serverChats: {
    width: wp(75),
  },
});

export default Page;
