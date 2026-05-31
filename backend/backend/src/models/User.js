const mongoose = require("mongoose");

const userSchema =
  new mongoose.Schema({

    username: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined,
    },

    mobile: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined,
    },

    // phoneNumber is an alias for mobile (requested field name)
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined,
    },

    accountType: {
      type: String,
      default: "user",
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "user",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    mobileVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: "",
    },

    emailOtp: {
      type: String,
      default: "",
    },

    emailOtpExpiry: {
      type: Date,
      default: null,
    },

    mobileOtp: {
      type: String,
      default: "",
    },

    mobileOtpExpiry: {
      type: Date,
      default: null,
    },

    profile: {
      fullName: { type: String, default: "" },
      photo: { type: String, default: "" },
      contactNumber: { type: String, default: "" },
      whatsappNumber: { type: String, default: "" },
      country: { type: String, default: "India" },
      state: { type: String, default: "" },
      city: { type: String, default: "" },
      location: { type: String, default: "" },
      bio: { type: String, default: "" },
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    blockedUntil: {
      type: Date,
      default: null,
    },

    blockReason: {
      type: String,
      default: "",
    },

    blockedBy: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

  });

// isVerified is an alias for emailVerified (requested field name)
userSchema.virtual("isVerified").get(function () {
  return this.emailVerified;
});

// isPhoneVerified is an alias for mobileVerified (requested field name)
userSchema.virtual("isPhoneVerified").get(function () {
  return this.mobileVerified;
});

module.exports =
  mongoose.model(
    "User",
    userSchema
  );
