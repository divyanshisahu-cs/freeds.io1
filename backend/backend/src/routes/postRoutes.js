const express = require("express");

const router = express.Router();

const Post = require("../models/Post");

const upload = require("../middleware/upload");

const User = require("../models/User");

const AdminSetting = require("../models/AdminSetting");

const getAdminSetting = async () =>
  AdminSetting.findOneAndUpdate(
    { key: "main" },
    { $setOnInsert: { key: "main" } },
    { new: true, upsert: true }
  );

const getBlockedUntil = (duration) => {
  if (duration === "permanent") {
    return new Date("9999-12-31T23:59:59.999Z");
  }

  const days = Number(duration) || 1;
  const blockedUntil = new Date();
  blockedUntil.setDate(blockedUntil.getDate() + days);
  return blockedUntil;
};


// =====================================
// ADD POST WITH IMAGE
// =====================================
router.post(

  "/add",

  upload.single("image"),

  async (req, res) => {

    try {

      const post = await Post.create({

        title: req.body.title,

        description: req.body.description,

        location: req.body.location,

        country: req.body.country,

        category: req.body.category,

        company: req.body.company,

        adType: req.body.adType,

        price: req.body.price,

        currency: req.body.currency,

        featured: req.body.featured === true || req.body.featured === "true",

        paymentProvider: req.body.paymentProvider,

        paymentStatus: req.body.paymentStatus,

        startDate: req.body.startDate || null,

        endDate: req.body.endDate || null,

        image: req.file
          ? req.file.filename
          : "",
      });

      res.json(post);

    } catch (error) {

      res.status(500).json(error);
    }
  }
);


// =====================================
// GET ALL POSTS
// =====================================
router.get("/", async (req, res) => {

  try {

    const posts = await Post.find()
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// FEATURED ADS
// =====================================
router.get("/featured/all", async (req, res) => {

  try {

    const featuredPosts =
      await Post.find({
        featured: true
      });

    res.json(featuredPosts);

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// COUNTRY FILTER
// =====================================
router.get("/country/:country", async (req, res) => {

  try {

    const posts =
      await Post.find({
        country: req.params.country
      });

    res.json(posts);

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// SEARCH POSTS
// =====================================
router.get("/search/:keyword", async (req, res) => {

  try {

    const posts =
      await Post.find({

        title: {
          $regex: req.params.keyword,
          $options: "i",
        },
      });

    res.json(posts);

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// REPORT AD
// =====================================
router.post("/report/:id", async (req, res) => {

  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { reportCount: 1 },
        $push: {
          reports: {
            reason: req.body.reason || "No reason added",
          },
        },
      },
      { new: true }
    );

    res.json({
      message: "Ad Reported Successfully",
      reason: req.body.reason,
      post,
    });

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// ANALYTICS
// =====================================
router.get("/analytics/total", async (req, res) => {

  try {

    const totalPosts =
      await Post.countDocuments();

    res.json({
      totalPosts,
    });

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// ADMIN DASHBOARD DATA
// =====================================
router.get("/admin/dashboard", async (req, res) => {

  try {

    const [
      totalPosts,
      featuredPosts,
      reportedPosts,
      users,
      settings,
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ featured: true }),
      Post.find({ reportCount: { $gt: 0 } }).sort({ reportCount: -1 }),
      User.find().select("-password").sort({ createdAt: -1 }),
      getAdminSetting(),
    ]);

    const countryBreakdown =
      await Post.aggregate([
        {
          $group: {
            _id: "$country",
            count: { $sum: 1 },
          },
        },
      ]);

    res.json({
      totalPosts,
      featuredPosts,
      reportedPosts,
      users,
      countryBreakdown,
      settings,
    });

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// BLOCK USER LOGIN
// =====================================
router.post("/admin/block-user", async (req, res) => {

  try {

    const identifier =
      req.body.identifier;

    if (!identifier) {
      return res.status(400).json({
        error: "Email or mobile number is required",
      });
    }

    const user = await User.findOneAndUpdate(
      {
        $or: [
          { email: identifier },
          { mobile: identifier },
        ],
      },
      {
        blockedUntil: getBlockedUntil(req.body.duration),
        blockReason: req.body.reason || "Blocked by admin",
        blockedBy: identifier,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(user);

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// UNBLOCK USER LOGIN
// =====================================
router.post("/admin/unblock-user", async (req, res) => {

  try {

    const user = await User.findByIdAndUpdate(
      req.body.userId,
      {
        blockedUntil: null,
        blockReason: "",
        blockedBy: "",
      },
      { new: true }
    ).select("-password");

    res.json(user);

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// ADMIN MESSAGE
// =====================================
router.post("/admin/message", async (req, res) => {

  try {

    const settings =
      await getAdminSetting();

    settings.messages.unshift({
      text: req.body.text,
    });

    await settings.save();

    res.json(settings);

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// ADMIN ANNOUNCEMENT
// =====================================
router.post("/admin/announcement", async (req, res) => {

  try {

    const durationDays =
      Number(req.body.durationDays) || 7;

    const expiresAt =
      new Date();

    expiresAt.setDate(
      expiresAt.getDate() + durationDays
    );

    const settings =
      await getAdminSetting();

    settings.announcements.unshift({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      durationDays,
      expiresAt,
    });

    await settings.save();

    res.json(settings);

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// FEATURED AD PRICE
// =====================================
router.put("/admin/featured-price", async (req, res) => {

  try {

    const settings =
      await getAdminSetting();

    settings.featuredPrice = {
      India: Number(req.body.indiaPrice) || 0,
      Norway: Number(req.body.norwayPrice) || 0,
    };

    await settings.save();

    res.json(settings);

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// UPDATE POST
// =====================================
router.put("/:id", async (req, res) => {

  try {

    const updatedPost =
      await Post.findByIdAndUpdate(

        req.params.id,

        req.body,

        { new: true }

      );

    res.json(updatedPost);

  } catch (error) {

    res.status(500).json(error);
  }
});


// =====================================
// DELETE POST
// =====================================
router.delete("/:id", async (req, res) => {

  try {

    await Post.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Deleted Successfully"
    });

  } catch (error) {

    res.status(500).json(error);
  }
});

module.exports = router;
