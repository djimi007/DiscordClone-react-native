export const serverUrl = `http://192.168.1.7:3000`;
export const SENDER_ID = "66dc82808ced9967a119a9e6";
export const RECEIVER_ID = "675ae78ecfe770f56a7ab0e4";
export const configuration = {
  iceServers: [
    {
      urls: "turn:relay1.expressturn.com:3478",
      username: "efFMNDQVYC5YXFGWB6",
      credential: "HOo4ksWuStDf0Eae",
    },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};
