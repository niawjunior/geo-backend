const express = require("express");
const router = express.Router();
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const BlacklistedToken = require("../models/BlacklistedToken");
const authenticate = require("../middlewares/authenticate");
const {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  calculateExpirationDate,
} = require("../utils/auth");

router.post("/register", async (req, res) => {
  try {
    // Extract the user data from the request body
    const { username, password } = req.body;

    // Hash the password
    const passwordHash = await hashPassword(password);
    // Create a new user object
    const user = await User.create({
      username,
      passwordHash,
    });
    // Check if the user was successfully inserted
    if (!user) {
      throw new Error("User registration failed");
    }
    // Respond with a success message or appropriate response
    res.json({ message: "User registered successfully" });
  } catch (error) {
    // Handle registration error

    // Check for specific validation errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Handle registration error
    res.status(500).json({ error: "An error occurred during registration" });
  }
});

router.post("/logout", authenticate, async (req, res) => {
  try {
    // Get the access token from the request headers
    const accessToken = req.headers.authorization;
    // Create a new BlacklistedToken record
    const isBlacklisted = await BlacklistedToken.findOne({
      where: { token: accessToken },
    });

    // If the access token is not already blacklisted, create a new BlacklistedToken record
    if (!isBlacklisted) {
      await BlacklistedToken.create({ token: accessToken });
    } else {
      return res.status(401).json({ error: "Access token revoked" });
    }

    // Respond with a success message
    res.json({ message: "Logout successful" });
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json({ error: "An error occurred during logout" });
  }
});

router.post("/login", async (req, res) => {
  try {
    // Extract the user data from the request body
    const { username, password } = req.body;

    // Fetch the user data from the database
    const user = await User.findOne({ where: { username } });

    // If the user does not exist or the password is incorrect, return an error response
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = generateToken({ id: user.id, username: user.username });

    // Generate a refresh token
    const refreshToken = generateRefreshToken();

    // Calculate the expiration date for the refresh token
    const expiresAt = calculateExpirationDate();

    // Save the refresh token to the database
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    // Respond with the token
    res.json({ token, refreshToken });
  } catch (error) {
    console.log(error);
    // Handle login error
    res.status(500).json({ error: "An error occurred during login" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify the refresh token against the stored tokens in the database
    const token = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    if (!token || token.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }

    const user = await User.findOne({ where: { id: token.userId } });

    // Generate a new access token
    const accessToken = generateToken({ username: user.username });

    // Respond with the new access token
    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while refreshing the access token" });
  }
});

module.exports = router;
