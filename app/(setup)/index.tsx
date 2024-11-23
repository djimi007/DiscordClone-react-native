import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { ImageBackground } from "expo-image";
import { wp, hp } from "@/utils/dimonsion";
import { Redirect, router } from "expo-router";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;

  const useSignUp = async () => {
    try {
      const result = await fetch(`${baseUrl}/user`, {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("====================================");
      console.log(await result.json());
      console.log("====================================");

      setEmail("");
      setName("");
      setPassword("");
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  };

  return <Redirect href="/(tabs)/" />;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior based on platform
    >
      <View className="flex-1">
        <ImageBackground
          source="https://mrwallpaper.com/images/hd/english-lavender-on-light-purple-background-0ejk4r6kloeue35q.jpg"
          style={{ height: hp(110), width: wp(100) }}
          contentFit="cover"
        >
          <Text className="font-serif font-bold text-3xl self-center top-[15%]">Sign Up </Text>

          <View className="top-[31%]" style={{ flex: 1, alignItems: "center", rowGap: hp(3) }}>
            <TextInput
              cursorColor={"black"}
              style={styles.inputText}
              onChangeText={setName}
              placeholder="Name"
              value={name}
            />
            <TextInput
              cursorColor={"black"}
              style={styles.inputText}
              onChangeText={setEmail}
              placeholder="Email"
              value={email}
            />
            <TextInput
              cursorColor={"black"}
              style={styles.inputText}
              onChangeText={setPassword}
              placeholder="Password"
              value={password}
            />
            <Text className="color-black self-start ml-[5%]">
              I already have an account{" "}
              <Text
                onPress={() => router.replace("/LogIn")}
                className="font-bold underline color-blue-800"
              >
                Login
              </Text>
            </Text>

            <View style={{ flexDirection: "row", columnGap: wp(6) }}>
              <Pressable style={styles.pressable} onPress={useSignUp}>
                <Text style={styles.textStyle}>Sign Up</Text>
              </Pressable>
              <Pressable style={styles.pressable}>
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  pressable: {
    padding: wp(2),
    borderBlockColor: "black",
    borderWidth: 1,
    borderRadius: wp(2),
    backgroundColor: "black",
  },
  inputText: {
    width: wp(95),
    height: hp(7),
    padding: wp(3),
    borderRadius: wp(3),
    borderBlockColor: "black",
    borderWidth: 1,
  },
  textStyle: {
    fontSize: wp(5),
    color: "white",
  },
});
