import { wp } from "@/utils/dimonsion";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Indecator from "./Indecator";

interface Props {
  iconUrl: string | undefined;
  currentIndex: number;
  setCurrentIndex: (number: number) => void;
  index: number;
}

const defaultImage =
  "https://static.vecteezy.com/system/resources/previews/006/892/625/non_2x/discord-logo-icon-editorial-free-vector.jpg";

const Server = ({ iconUrl, currentIndex, setCurrentIndex, index }: Props) => {
  return (
    <Pressable style={styles.pressabel} onPress={() => setCurrentIndex(index)}>
      {currentIndex === index && <Indecator />}

      <Image
        source={{
          uri: iconUrl || defaultImage,
        }}
        style={styles.image}
        onLoad={(event) => {
          event.source.url = defaultImage;
        }}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1),
  },
  image: {
    height: wp(15),
    width: wp(15),
    borderRadius: wp(15),
  },
  animatedview: {
    width: wp(1),
    backgroundColor: "white",
    borderRadius: 2,
  },
});

export default Server;
