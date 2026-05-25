const mongoose = require("mongoose");

const userSchema =
  new mongoose.Schema({

    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    mobile: {
      type: String,
      default: "",
    },

    accountType: {
      type: String,
      default: "user",
    },

    password: {
      type: String,
      required: true,
    },

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

module.exports =
  mongoose.model(
    "User",
    userSchema
  );
