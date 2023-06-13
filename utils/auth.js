const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { jwtSecret } = require("../config");

// Function to generate a JWT
function generateToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
}

// Function to generate a refresh token
function generateRefreshToken() {
  const refreshToken = jwt.sign({}, jwtSecret, { expiresIn: "7d" });
  return refreshToken;
}

// Function to verify a JWT
function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

// Function to hash a password
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Function to compare a password with its hash
async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

// Function to calculate the expiration date for the refresh token
function calculateExpirationDate() {
  const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const expiresAt = new Date(Date.now() + expiresIn);
  return expiresAt;
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateRefreshToken,
  calculateExpirationDate,
};
