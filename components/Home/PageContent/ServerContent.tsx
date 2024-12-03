import { EvilIcons, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

const ServerContent = () => {
  return (
    <View className="flex-1  rounded-tl-3xl bg-zinc-900">
      {/* Header  */}
      <View>
        {/* text and fancyIcon */}
        <View className="flex-row items-center gap-1">
          <Text className="color-slate-100 italic font-extrabold text-2xl ml-2">
            Messages
          </Text>
          <EvilIcons name="chart" size={24} color={"white"} />
          <EvilIcons name="user" size={24} color={"white"} />
        </View>

        {/* search add and schulader  */}
        <View className="items-center flex-row gap-5 px-5">
          <View className="flex-row  items-center justify-center gap-4 flex-1 bg-zinc-700 rounded-full h-10 w-[75%]">
            <Ionicons name="search" size={22} color={"white"} />
            <Text className="text-lg color-zinc-300">Search</Text>
          </View>
          <Ionicons
            className="p-3 bg-zinc-700 rounded-full"
            name="person-add"
            size={16}
            color={"white"}
          />
          <Ionicons
            className="p-3 bg-zinc-700 rounded-full"
            name="cafe-sharp"
            size={16}
            color={"white"}
          />
        </View>
      </View>

      <View></View>
    </View>
  );
};

export default ServerContent;
