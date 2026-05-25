const express = require("express");

const router = express.Router();

const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const User = require("../models/User");

const getBlockMessage = (user) => {
  if (!user.blockedUntil) return "";

  const blockedUntil =
    new Date(user.blockedUntil);

  if (blockedUntil > new Date()) {
    return `Login blocked until ${blockedUntil.toLocaleString()}. ${user.blockReason || ""}`.trim();
  }

  return "";
};


// REGISTER
router.post("/register", async (req, res) => {

  try {

    const existingChecks = [
      { email: req.body.email },
    ];

    if (req.body.mobile) {
      existingChecks.push({
        mobile: req.body.mobile,
      });
    }

    const existingUser =
      await User.findOne({
        $or: existingChecks,
      });

    if (existingUser) {

      return res.status(400).json({
        error: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        req.body.password,
        10
      );

    const user = await User.create({

      username: req.body.username,

      email: req.body.email,

      mobile: req.body.mobile || "",

      accountType:
        req.body.accountType,

      password: hashedPassword,
    });

    res.json({
      message:
        "Registration Successful",
      user,
    });

  } catch (error) {

    res.status(500).json({
      error: "Registration failed",
    });
  }
});


// LOGIN
router.post("/login", async (req, res) => {

  try {

    const identifier =
      req.body.identifier ||
      req.body.email ||
      req.body.mobile;

    if (!identifier) {
      return res.status(400).json({
        error: "Email or mobile number is required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { mobile: identifier },
      ],
    });

    if (!user) {

      return res.status(400).json({
        error: "User not found",
      });
    }

    const blockMessage =
      getBlockMessage(user);

    if (blockMessage) {
      return res.status(403).json({
        error: blockMessage,
      });
    }

    const isMatch =
      await bcrypt.compare(
        req.body.password,
        user.password
      );

    if (!isMatch) {

      return res.status(400).json({
        error: "Invalid password",
      });
    }

    const token = jwt.sign(

      {
        id: user._id,
      },

      "secretkey",

      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user,
    });

  } catch (error) {

    res.status(500).json({
      error: "Login failed",
    });
  }
});

module.exports = router;
