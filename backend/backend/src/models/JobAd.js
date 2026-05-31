const mongoose = require("mongoose");

const jobAdSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  title: { type: String, required: true },
  company: { type: String, default: "" },
  location: { type: String, default: "" },
  country: { type: String, default: "India" },
  type: { type: String, default: "Full Time" },
  salary: { type: String, default: "" },
  experience: { type: String, default: "" },
  description: { type: String, default: "" },
  contactEmail: { type: String, default: "" },
  contactPhone: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("JobAd", jobAdSchema);
