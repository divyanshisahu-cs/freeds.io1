const express = require("express");
const JobAd = require("../models/JobAd");
const CandidateProfile = require("../models/CandidateProfile");
const { optionalAuth, requireAuth, requireVerifiedAuth } = require("../middleware/auth");

const router = express.Router();

const buildQuery = (req) => {
  const query = {};
  if (req.query.country) query.country = req.query.country;
  if (req.query.location) {
    query.location = { $regex: req.query.location, $options: "i" };
  }
  if (req.query.keyword) {
    query.$or = [
      { title: { $regex: req.query.keyword, $options: "i" } },
      { name: { $regex: req.query.keyword, $options: "i" } },
      { role: { $regex: req.query.keyword, $options: "i" } },
      { description: { $regex: req.query.keyword, $options: "i" } },
      { summary: { $regex: req.query.keyword, $options: "i" } },
    ];
  }
  return query;
};

router.get("/jobs", async (req, res) => {
  try {
    const [jobAds, candidateProfiles] = await Promise.all([
      JobAd.find(buildQuery(req)).sort({ createdAt: -1 }),
      CandidateProfile.find(buildQuery(req)).sort({ createdAt: -1 }),
    ]);

    res.json({ jobAds, candidateProfiles });
  } catch (error) {
    res.status(500).json({ error: "Failed to load jobs" });
  }
});

router.post("/jobs", requireVerifiedAuth, async (req, res) => {
  try {
    const job = await JobAd.create({
      ...req.body,
      user: req.user?._id || null,
      contactEmail: req.body.contactEmail || req.user?.email || "",
      contactPhone: req.body.contactPhone || req.user?.mobile || "",
    });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job ad" });
  }
});

router.post("/candidates", requireVerifiedAuth, async (req, res) => {
  try {
    const profile = await CandidateProfile.create({
      ...req.body,
      user: req.user._id,
      contactEmail: req.body.contactEmail || req.user.email || "",
      contactPhone: req.body.contactPhone || req.user.mobile || "",
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to add candidate profile" });
  }
});

router.get("/mine", requireVerifiedAuth, async (req, res) => {
  const [jobAds, candidateProfiles] = await Promise.all([
    JobAd.find({ user: req.user._id }).sort({ createdAt: -1 }),
    CandidateProfile.find({ user: req.user._id }).sort({ createdAt: -1 }),
  ]);
  res.json({ jobAds, candidateProfiles });
});

module.exports = router;
