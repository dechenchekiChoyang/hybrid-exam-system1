import jwt from "jsonwebtoken";

/**
 * Generate JWT Token
 * @param {Object} user
 * @returns {String} JWT Token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES || "7d",
      issuer: "Hybrid Exam System",
      audience: "Hybrid Exam Users",
    }
  );
};

/**
 * Verify JWT Token
 * @param {String} token
 * @returns {Object} Decoded Token
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: "Hybrid Exam System",
    audience: "Hybrid Exam Users",
  });
};