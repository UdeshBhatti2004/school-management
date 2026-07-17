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
      validate: {
        validator(value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Please enter a valid email address.",
      },
    },
    phone: {
  type: String,
  required: [true, "School phone number is required"],
  trim: true,
  validate: {
    validator: function (value) {
      return /^[6-9]\d{9}$/.test(value);
    },
    message: "Please enter a valid 10-digit phone number.",
  },
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

trialEndsAt: {
    type: Date,
    default: null,
},

  },
  {
    timestamps: true,
  }
);

const School = mongoose.model("School", schoolSchema);

export default School;