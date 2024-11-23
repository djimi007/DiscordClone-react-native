import { Dimensions } from "react-native";

const { height, width } = Dimensions.get("window");

export const hp = (number: number) => {
  return (number * height) / 100;
};

export const wp = (number: number) => {
  return (number * width) / 100;
};
