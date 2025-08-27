import React, { useState, useEffect } from "react";

export const Chat = ({ socket, username, roomId }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);

  const sendMessage = () => {
    if (currentMessage.trim() !== "" && messagesLoaded) {
      const messageData = {
        author: username,
        message: currentMessage,
        time: new Date().getHours().toString().padStart(2,"0") + ":" +
              new Date().getMinutes().toString().padStart(2,"0"),
        room: roomId
      };
      socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("load_previous_messages", (messages) => {
      setMessageList(messages);
      setMessagesLoaded(true); // enable chat input
    });

    const handleReceive = (msg) => setMessageList((list) => [...list, msg]);
    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("load_previous_messages");
    };
  }, [socket]);

  return (
    <div className="chat_container">
      <h1 className="welcome">Welcome {username}</h1>
      <div className="chat_box">
        {messageList.map((msg, index) => (
          <div key={index} className={`message ${msg.author === username ? "you" : "other"}`}>
            <div className="message_content"><p>{msg.message}</p></div>
            <div className="message_meta">
              <p id="time">{msg.time}</p>
              <p id="author">{msg.author}</p>
            </div>
          </div>
        ))}

        <div className="chat_body">
          <input
            type="text"
            placeholder={messagesLoaded ? "Enter your message" : "Loading..."}
            value={currentMessage}
            disabled={!messagesLoaded}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} disabled={!messagesLoaded}>&#9658;</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
