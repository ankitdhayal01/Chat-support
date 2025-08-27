import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  author: String,
  message: String,
  time: String,
  room: String
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;
