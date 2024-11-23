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
import { Image, ImageBackground } from "expo-image";
import { wp, hp } from "@/utils/dimonsion";
import { ScrollView } from "react-native-gesture-handler";
import { router } from "expo-router";
import { useAuth } from "@/states/userState";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setToken = useAuth((state) => state.setToken);

  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;

  const useLogin = async () => {
    try {
      const result = await fetch(`${baseUrl}/user`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (result.status === 200) {
        const data = await result.json();
        setToken(data.token);
        router.replace("/(tabs)/");
        return;
      }

      setEmail("");
      setPassword("");
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior based on platform
    >
      <ScrollView style={{ flex: 1 }}>
        <ImageBackground
          source="https://mrwallpaper.com/images/hd/english-lavender-on-light-purple-background-0ejk4r6kloeue35q.jpg"
          style={{ height: hp(110), width: wp(100), alignSelf: "center" }}
          contentFit="cover"
        >
          <Text
            style={{
              alignSelf: "center",
              fontWeight: "600",
              fontSize: wp(7),
              top: hp(15),
              fontFamily: "serif",
            }}
          >
            Login{" "}
          </Text>
          <View style={{ flex: 1, alignItems: "center", rowGap: hp(3), top: hp(45) }}>
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
            <View style={{ flexDirection: "row", columnGap: wp(6) }}>
              <Pressable style={styles.pressable} onPress={useLogin}>
                <Text style={styles.textStyle}>Login</Text>
              </Pressable>
              <Pressable style={styles.pressable}>
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

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
