const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { jwtSecret } = require("../config");

// Function to generate a JWT
function generateToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
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

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
};
