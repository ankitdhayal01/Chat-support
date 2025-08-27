import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true },
  users: [String]  // max 2
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);
export default Room;
