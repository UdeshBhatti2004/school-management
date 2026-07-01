import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "School email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    principalName: {
      type: String,
      default: "",
    },

    academicYear: {
      type: String,
      default: "2026-27",
    },

    subscription: {
      type: String,
      enum: ["trial", "basic", "pro", "enterprise"],
      default: "trial",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const School = mongoose.model("School", schoolSchema);

export default School;