const mongoose = require("mongoose");

const adminSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },

  featuredPrice: {
    India: {
      type: Number,
      default: 499,
    },
    Norway: {
      type: Number,
      default: 99,
    },
  },

  messages: [
    {
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  announcements: [
    {
      title: String,
      text: String,
      imageUrl: String,
      durationDays: Number,
      expiresAt: Date,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("AdminSetting", adminSettingSchema);
