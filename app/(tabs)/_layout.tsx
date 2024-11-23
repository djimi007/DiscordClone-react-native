import { Tabs } from "expo-router";
import React from "react";

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "tab1",
};

const Layout = () => {
  return <Tabs />;
};

export default Layout;
