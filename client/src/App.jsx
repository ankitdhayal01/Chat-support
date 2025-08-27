import React, { useState } from "react";
import io from "socket.io-client";
import Chat from "./chat.jsx";

const socket = io.connect("http://localhost:8080");

const App = () => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  const joinChat = () => {
    if (username && roomId) {
      socket.emit("join_chat", { username, room: roomId });
      setIsJoined(true);
    }
  };

  return (
    <div>
      {!isJoined ? (
        <div className="join_chat">
          <h1>Start Chat</h1>
          <input placeholder="Enter your name" value={username} onChange={e => setUsername(e.target.value)} />
          <input placeholder="Enter room id" value={roomId} onChange={e => setRoomId(e.target.value)} />
          <button onClick={joinChat}>Join</button>
        </div>
      ) : (
        <Chat socket={socket} username={username} roomId={roomId} />
      )}
    </div>
  );
};

export default App;
