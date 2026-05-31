const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  state: {
    type: String,
    default: "",
  },

  city: {
    type: String,
    default: "",
  },

  country: {
    type: String,
    default: "India",
  },

  category: {
    type: String,
    default: "General",
  },

  company: {
    type: String,
    default: "",
  },

  email: {
    type: String,
    default: "",
  },

  mobile: {
    type: String,
    default: "",
  },

  whatsapp: {
    type: String,
    default: "",
  },

  adType: {
    type: String,
    default: "Standard",
  },

  paymentProvider: {
    type: String,
    default: "",
  },

  paymentStatus: {
    type: String,
    default: "not_required",
  },

  price: {
    type: Number,
    default: 0,
  },

  currency: {
    type: String,
    default: "INR",
  },

  featured: {
    type: Boolean,
    default: false,
  },

  startDate: {
    type: Date,
    default: null,
  },

  endDate: {
    type: Date,
    default: null,
  },

  reportCount: {
    type: Number,
    default: 0,
  },

  reports: [
    {
      reason: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  image: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }

});

module.exports = mongoose.model(
  "Post",
  postSchema
);
