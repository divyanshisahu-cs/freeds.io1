const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

const readToken = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  // Also support token in query string for convenience
  if (req.query?.token) return req.query.token;
  return "";
};

// Creates a signed JWT that embeds id + role so the frontend
// localStorage user object stays consistent with the token.
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

const optionalAuth = async (req, _res, next) => {
  try {
    const token = readToken(req);
    if (token) {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(payload.id).select("-password");
    }
  } catch (_error) {
    req.user = null;
  }
  next();
};

const requireAuth = async (req, res, next) => {
  await optionalAuth(req, res, () => {});
  if (!req.user) {
    return res.status(401).json({
      error: "Please sign in first",
    });
  }
  next();
};

const requireVerifiedAuth = async (req, res, next) => {
  await optionalAuth(req, res, () => {});
  if (!req.user) {
    return res.status(401).json({
      error: "Please sign in first",
    });
  }

  // Check email verification
  if (req.user.email && !req.user.emailVerified) {
    return res.status(403).json({
      error: "Please verify your email before accessing this feature",
      verificationRequired: true,
      verification: {
        pending: {
          email: true,
          mobile: Boolean(req.user.mobile && !req.user.mobileVerified),
        },
        emailOtp: req.user.emailOtp || "",
      },
    });
  }

  // Check mobile verification
  if (req.user.mobile && !req.user.mobileVerified) {
    return res.status(403).json({
      error: "Please verify your mobile number before accessing this feature",
      verificationRequired: true,
      verification: {
        pending: {
          email: false,
          mobile: true,
        },
        mobileOtp: req.user.mobileOtp || "",
      },
    });
  }

  next();
};

const requireAdmin = async (req, res, next) => {
  await optionalAuth(req, res, () => {});
  if (!req.user) {
    return res.status(401).json({
      error: "Please sign in first",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Access denied. Admins only.",
    });
  }

  next();
};

module.exports = {
  JWT_SECRET,
  signToken,
  optionalAuth,
  requireAuth,
  requireVerifiedAuth,
  requireAdmin,
};

