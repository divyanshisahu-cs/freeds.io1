const express = require("express");

const router = express.Router();

const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/User");

const Post = require("../models/Post");

const { JWT_SECRET, signToken, requireAuth, requireVerifiedAuth, requireAdmin } = require("../middleware/auth");


const upload = require("../middleware/upload");

const createEmailToken = () => crypto.randomBytes(24).toString("hex");

const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const createMobileOtp = createOtp;

const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getAppUrl = () =>
  (process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const sendEmailOtp = async (email, otp, verificationToken = "") => {
  if (!email || !otp) return false;

  if (!hasSmtpConfig()) {
    console.log(`[email-verification] OTP for ${email}: ${otp}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;
    const fromAddress = smtpFrom.includes("<")
      ? smtpFrom
      : `"Freeds.io" <${smtpFrom}>`;

    const appUrl = getAppUrl();
    const magicLink = verificationToken
      ? `${appUrl}/verify-email/${verificationToken}`
      : "";

    const otpDigits = otp.split("").map((d) =>
      `<span style="display:inline-block;width:44px;height:56px;line-height:56px;text-align:center;font-size:28px;font-weight:700;background:#f1f5f9;border:2px solid #e2e8f0;border-radius:10px;margin:0 4px;color:#0f172a;letter-spacing:0">${d}</span>`
    ).join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify your email – Freeds.io</title></head>
<body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:40px 0">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(15,23,42,0.08)">
        <!-- Header -->
        <tr><td style="background:#0f172a;padding:32px 40px;text-align:center">
          <div style="display:inline-block;background:#ffffff;border-radius:12px;padding:8px 14px;font-size:13px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#0f172a">FA</div>
          <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:12px">Freeds.io</div>
          <div style="color:#94a3b8;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-top:4px">Email Verification</div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px">
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#0f172a">Verify your email address</h1>
          <p style="margin:0 0 32px;color:#64748b;font-size:15px;line-height:1.6">Use the 6-digit code below to complete your registration. This code expires in <strong>10 minutes</strong>.</p>
          <!-- OTP Boxes -->
          <div style="text-align:center;margin:0 0 32px">${otpDigits}</div>
          <!-- Divider -->
          <div style="border-top:1px solid #e2e8f0;margin:32px 0"></div>
          ${magicLink ? `
          <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 16px">Or click the button below to verify instantly:</p>
          <div style="text-align:center">
            <a href="${magicLink}" style="display:inline-block;background:#0f172a;color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:100px;text-decoration:none">Verify Email &rarr;</a>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;text-align:center">Or paste: ${magicLink}</p>
          ` : ""}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center">
          <p style="margin:0;color:#94a3b8;font-size:12px">If you didn't create a Freeds.io account, you can safely ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `${otp} is your Freeds.io verification code`,
      text: `Your Freeds.io verification OTP is ${otp}. Enter it at ${appUrl}/verify-email?email=${encodeURIComponent(email)}. Expires in 10 minutes.${magicLink ? ` Or click: ${magicLink}` : ""}`,
      html,
    });

    return true;
  } catch (error) {
    console.error(`[email-verification] Could not send OTP to ${email}:`, error.message);
    console.log(`[email-verification] OTP for ${email}: ${otp}`);
    return false;
  }
};


const getVerificationPayload = (user, options = {}) => {
  const { hideEmailOtp = false, hideMobileOtp = false } = options;

  return {
    pending: {
      email: Boolean(user.email && !user.emailVerified),
      mobile: Boolean(user.mobile && !user.mobileVerified),
    },
    emailVerificationLink:
      user.email && !user.emailVerified && user.emailVerificationToken
        ? `/verify-email/${user.emailVerificationToken}`
        : "",
    emailOtp:
      user.email && !user.emailVerified && !hideEmailOtp ? user.emailOtp : "",
    mobileOtp:
      user.mobile && !user.mobileVerified && !hideMobileOtp ? user.mobileOtp : "",
  };
};

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
    const email = (req.body.email || "").trim().toLowerCase();
    const mobile = (req.body.mobile || "").trim();

    if (!email && !mobile) {
      return res.status(400).json({
        error: "Email or mobile number is required",
      });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const existingChecks = [];

    if (email) existingChecks.push({ email });
    if (mobile) {
      existingChecks.push({
        mobile,
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

    const emailVerificationToken =
      email ? createEmailToken() : "";

    const emailOtp =
      email ? createOtp() : "";

    const emailOtpExpiry = email
      ? new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      : null;


    const mobileOtp =
      mobile ? createMobileOtp() : "";

    const mobileOtpExpiry = mobile
      ? new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      : null;


    const userData = {
      username: req.body.username || email || mobile,

      accountType:
        req.body.accountType,

      role: "user", // role can only be set to admin via /auth/users/:id/role by an existing admin

      emailVerificationToken,

      emailOtp,

      emailOtpExpiry,

      mobileOtp,

      mobileOtpExpiry,

      emailVerified: !email,

      mobileVerified: !mobile,

      password: hashedPassword,
    };

    if (email) userData.email = email;
    if (mobile) { userData.mobile = mobile; userData.phoneNumber = mobile; }

    const user = await User.create(userData);

    let emailSent = false;

    if (email) {
      emailSent = await sendEmailOtp(email, emailOtp, emailVerificationToken);
    }

    res.json({
      message:
        email
          ? emailSent
            ? "Registration successful. Verification OTP has been sent to your email."
            : "Registration successful. Verification OTP has been generated."
          : "Registration successful. OTP has been generated.",
      verification: getVerificationPayload(user, {
        hideEmailOtp: emailSent,
      }),
      user,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Email or mobile number already exists",
      });
    }

    res.status(500).json({
      error: "Registration failed",
    });
  }
});


// LOGIN
router.post("/login", async (req, res) => {

  try {

    const identifier =
      (req.body.identifier || req.body.email || req.body.mobile || "").trim().toLowerCase();

    if (!identifier) {
      return res.status(400).json({
        error: "Email or mobile number is required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { mobile: identifier },
        { username: identifier },
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

    if (user.email && !user.emailVerified) {
      return res.status(403).json({
        error: "Please verify your email before signing in",
        verificationRequired: true,
        verification: getVerificationPayload(user, {
          hideEmailOtp: true,
        }),
      });
    }

    if (user.mobile && !user.mobileVerified) {
      return res.status(403).json({
        error: "Please verify your mobile number before signing in",
        verificationRequired: true,
        verification: getVerificationPayload(user),
      });
    }

    const token = signToken(user); // JWT now enceds role for frontend persistence

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

router.post("/resend-verification", async (req, res) => {
  try {
    const identifier =
      (req.body.identifier || req.body.email || req.body.mobile || "").trim().toLowerCase();

    if (!identifier) {
      return res.status(400).json({
        error: "Email or mobile number is required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { mobile: identifier },
        { username: identifier },
      ],
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (user.email && !user.emailVerified) {
      user.emailVerificationToken = createEmailToken();
      user.emailOtp = createOtp();
      user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    }

    if (user.mobile && !user.mobileVerified) {
      user.mobileOtp = createMobileOtp();
      user.mobileOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    }

    await user.save();

    let emailSent = false;

    if (user.email && !user.emailVerified) {
      emailSent = await sendEmailOtp(user.email, user.emailOtp, user.emailVerificationToken);
    }

    res.json({
      message: emailSent ? "Verification OTP sent" : "Verification details generated",
      verification: getVerificationPayload(user, {
        hideEmailOtp: emailSent,
      }),
    });
  } catch (error) {
    res.status(500).json({ error: "Could not resend verification" });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const otp = (req.body.otp || "").trim();

    // Find user by email + OTP
    const user = await User.findOne({ email, emailOtp: otp });

    if (!user) return res.status(400).json({ error: "Invalid verification code" });

    // Check OTP expiry
    if (user.emailOtpExpiry && new Date(user.emailOtpExpiry) < new Date()) {
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }

    // Mark verified
    user.emailVerified = true;
    user.emailOtp = "";
    user.emailOtpExpiry = null;
    user.emailVerificationToken = "";
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    res.json({ message: "Email verified successfully", user: safeUser });
  } catch (error) {
    res.status(500).json({ error: "Email verification failed" });
  }
});


router.get("/verify-email/:token", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { emailVerificationToken: req.params.token },
      { emailVerified: true, emailVerificationToken: "", emailOtp: "" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "Invalid verification link" });
    res.json({ message: "Email verified", user });
  } catch (error) {
    res.status(500).json({ error: "Email verification failed" });
  }
});

router.post("/verify-mobile", async (req, res) => {
  try {
    const mobile = (req.body.mobile || req.body.phoneNumber || "").trim();
    const otp = (req.body.otp || "").trim();

    const user = await User.findOne({ $or: [{ mobile }, { phoneNumber: mobile }], mobileOtp: otp });

    if (!user) return res.status(400).json({ error: "Invalid OTP" });

    // Check OTP expiry
    if (user.mobileOtpExpiry && new Date(user.mobileOtpExpiry) < new Date()) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    user.mobileVerified = true;
    user.mobileOtp = "";
    user.mobileOtpExpiry = null;
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    res.json({ message: "Mobile verified successfully", user: safeUser });
  } catch (error) {
    res.status(500).json({ error: "Mobile verification failed" });
  }
});

// POST /auth/send-otp — send OTP to a phone number (on register or phone update)
router.post("/send-otp", async (req, res) => {
  try {
    const phoneNumber = (req.body.phoneNumber || req.body.mobile || "").trim();

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const user = await User.findOne({ $or: [{ mobile: phoneNumber }, { phoneNumber }] });

    if (!user) {
      return res.status(404).json({ error: "No account found with this phone number" });
    }

    if (user.mobileVerified) {
      return res.status(400).json({ error: "Phone number is already verified" });
    }

    // Generate new OTP with 10-min expiry
    const otp = createMobileOtp();
    user.mobileOtp = otp;
    user.mobileOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // In production: send via SMS provider (Twilio, MSG91, etc.)
    // For now, return OTP in response (remove in production)
    console.log(`[mobile-verification] OTP for ${phoneNumber}: ${otp}`);

    res.json({
      message: "OTP sent to your phone number",
      // Only returned for development — remove in production
      otp: process.env.NODE_ENV === "production" ? undefined : otp,
      expiresIn: "10 minutes",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// POST /auth/verify-otp — verify phone OTP (clean API endpoint)
router.post("/verify-otp", async (req, res) => {
  try {
    const phoneNumber = (req.body.phoneNumber || req.body.mobile || "").trim();
    const otp = (req.body.otp || "").trim();

    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: "Phone number and OTP are required" });
    }

    const user = await User.findOne({
      $or: [{ mobile: phoneNumber }, { phoneNumber }],
      mobileOtp: otp,
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check OTP expiry
    if (user.mobileOtpExpiry && new Date(user.mobileOtpExpiry) < new Date()) {
      return res.status(400).json({ error: "OTP has expired. Request a new one via /auth/send-otp" });
    }

    // Mark phone as verified
    user.mobileVerified = true;
    user.mobileOtp = "";
    user.mobileOtpExpiry = null;
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");

    res.json({
      message: "Phone number verified successfully",
      isPhoneVerified: true,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ error: "OTP verification failed" });
  }
});


router.get("/me", requireVerifiedAuth, async (req, res) => {
  const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ user: req.user, posts });
});

router.put("/me", requireVerifiedAuth, async (req, res) => {
  try {
    const currentProfile = req.user.profile?.toObject
      ? req.user.profile.toObject()
      : req.user.profile || {};
    const incomingProfile = req.body.profile || {};
    const allowedProfileFields = [
      "fullName",
      "contactNumber",
      "whatsappNumber",
      "country",
      "state",
      "city",
      "location",
      "bio",
    ];

    const profile = {
      ...currentProfile,
    };

    allowedProfileFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(incomingProfile, field)) {
        profile[field] = incomingProfile[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        username: req.body.username ?? req.user.username,
        profile,
      },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Profile update failed" });
  }
});

router.post("/me/photo", requireVerifiedAuth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Photo is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        "profile.photo": req.file.filename,
      },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Profile photo upload failed" });
  }
});

router.post("/favorites/:postId", requireVerifiedAuth, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { favorites: req.params.postId } },
    { new: true }
  ).select("-password");

  res.json(user);
});

router.delete("/favorites/:postId", requireVerifiedAuth, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { favorites: req.params.postId } },
    { new: true }
  ).select("-password");

  res.json(user);
});

router.delete("/me", requireVerifiedAuth, async (req, res) => {
  await Post.deleteMany({ user: req.user._id });
  await User.findByIdAndDelete(req.user._id);
  res.json({ message: "Account deleted" });
});


// =============================================
// ADMIN — GET ALL USERS
// =============================================
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// =============================================
// ADMIN — PROMOTE / DEMOTE USER ROLE
// Only an existing admin can change roles.
// =============================================
router.patch("/users/:id/role", requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "role must be 'user' or 'admin'" });
    }

    // Prevent an admin from removing their own admin role
    if (req.user._id.toString() === req.params.id && role !== "admin") {
      return res.status(400).json({ error: "You cannot remove your own admin role" });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: `User role updated to '${role}'`, user: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update role" });
  }
});


module.exports = router;
