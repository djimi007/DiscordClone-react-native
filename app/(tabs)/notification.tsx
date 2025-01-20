import { SENDER_ID, RECEIVER_ID, serverUrl } from "@/utils/constants";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Switch,
} from "react-native";
import { io, Socket } from "socket.io-client";

interface Message {
  message: string;
  senderId: string;
  reciverId: string;
}

const ChatScreen = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const flatListRef = useRef<FlatList<Message> | null>(null);

  const [isEnabled, setIsEnabled] = useState(false);

  const senderId = isEnabled ? SENDER_ID : RECEIVER_ID;
  const receiverId = isEnabled ? RECEIVER_ID : SENDER_ID;

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  useEffect(() => {
    const newSocket = io(serverUrl, {
      query: {
        senderId,
        receiverId,
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setSocket(newSocket);
    });

    newSocket.on("All-Messages", (data) => {
      setMessages(data);
    });

    newSocket.on("receiveMessage", (data: Message) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isEnabled]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      senderId,
      reciverId: receiverId,
      message: inputMessage,
    };

    socket?.emit("sendMessage", messageData);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        senderId,
        message: inputMessage,
        reciverId: receiverId,
      },
    ]);
    setInputMessage("");
  };

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === senderId
          ? styles.sentMessage
          : styles.receivedMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          onKeyPress={(event) => {
            if (event.nativeEvent.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ChatScreen;
