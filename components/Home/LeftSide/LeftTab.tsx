import { servers } from "@/fake_data/data";
import { hp, wp } from "@/utils/dimonsion";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import FullIndecator from "./FullIndecator";
import Servers from "./Servers";
import { Colors } from "@/constants/Colors";

const LeftTabs = () => {
  const [data, setData] = useState(servers);

  useEffect(() => {
    setData(servers);
  }, [servers]);

  const [currentIndex, setCurrentIndex] = useState(-1);

  return (
    <View style={styles.servercontainer}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: "center",
          gap: wp(2),
        }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={data.length < 10 ? false : true}
      >
        <FullIndecator
          name="message1"
          index={-1}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
        {data.map((e, i) => {
          return (
            <Servers
              key={i}
              index={i}
              iconUrl={e.serverIcon}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
            />
          );
        })}

        <FullIndecator
          name="plus"
          index={-2}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
        <FullIndecator
          name="API"
          index={-3}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  servercontainer: {
    flex: 1,
    gap: wp(1),
    width: wp(25),
    alignItems: "center",
    paddingVertical: hp(1),
  },
});

export default LeftTabs;
