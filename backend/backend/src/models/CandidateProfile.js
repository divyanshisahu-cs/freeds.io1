const mongoose = require("mongoose");

const candidateProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  name: { type: String, required: true },
  role: { type: String, default: "" },
  location: { type: String, default: "" },
  country: { type: String, default: "India" },
  experience: { type: String, default: "" },
  expectedSalary: { type: String, default: "" },
  availability: { type: String, default: "" },
  skills: { type: String, default: "" },
  summary: { type: String, default: "" },
  contactEmail: { type: String, default: "" },
  contactPhone: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CandidateProfile", candidateProfileSchema);
