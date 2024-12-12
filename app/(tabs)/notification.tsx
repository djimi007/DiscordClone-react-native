import React, { useState, useEffect, useRef, useId } from "react";
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
  const serverUrl = `http://192.168.1.5:3000`;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const currentUserId = "66dc82808ced9967a119a9e6";
  const receiverId = "675ae78ecfe770f56a7ab0e4";

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  useEffect(() => {
    // Create socket connection
    const newSocket = io(serverUrl, {
      query: {
        senderId: isEnabled ? currentUserId : receiverId,
        receiverId: isEnabled ? receiverId : currentUserId,
      },
    });

    // Connect to socket
    newSocket.on("connect", () => {
      console.log("Socket connected");
      setSocket(newSocket);
    });

    // Listen for received messages
    newSocket.on("receiveMessage", (data: Message) => {
      console.log("Received message:", data);
      setMessages((prevMessages) => [data, ...prevMessages]);
    });

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isEnabled]);

  // Send message function
  const sendMessage = () => {
    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      senderId: isEnabled ? currentUserId : receiverId,
      reciverId: isEnabled ? receiverId : currentUserId,
      message: inputMessage,
    };

    // Emit message to server
    socket?.emit("sendMessage", messageData);

    // Add message to local state
    setMessages((prevMessages) => [
      {
        senderId: isEnabled ? currentUserId : receiverId,
        message: inputMessage,
        reciverId: !isEnabled ? currentUserId : receiverId,
      },
      ...prevMessages,
    ]);

    // Clear input
    setInputMessage("");
  };

  // Render individual message
  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === (isEnabled ? currentUserId : receiverId)
          ? styles.sentMessage
          : styles.receivedMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Messages List */}
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
        inverted
      />

      {/* Message Input */}
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
