import { hp, wp } from "@/utils/dimonsion";
import { MotiView } from "moti/build";
import { StyleSheet, ViewStyle } from "react-native";

const styles = StyleSheet.create({
  indicator: {
    width: wp(1),
    backgroundColor: "white",
    borderRadius: 2,
  },
});

// Define the props interface
interface IndecatorProps {
  style?: ViewStyle; // Optional style prop
  [key: string]: any; // Allow other props
}

const Indecator: React.FC<IndecatorProps> = ({ style, ...props }) => {
  return (
    <MotiView
      from={{ height: 0 }}
      animate={{ height: hp(6) }}
      transition={{ type: "timing", duration: 400 }}
      style={[styles.indicator, style]}
      {...props}
    />
  );
};

export default Indecator;
