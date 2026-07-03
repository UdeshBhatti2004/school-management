import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("classRoom");

    if (!user) {
      return next(new Error("User not found."));
    }

    socket.user = user;

    next();
  } catch (err) {
    next(new Error("Invalid token."));
  }
};