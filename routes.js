const express = require("express");
const router = express.Router();
const User = require("./models/User");
const RefreshToken = require("./models/RefreshToken");
const BlacklistedToken = require("./models/BlacklistedToken");

const {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  calculateExpirationDate,
  verifyToken,
} = require("./utils/auth");

// Middleware to verify the JWT token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid authorization token" });
  }
};

// Protected route to retrieve user's credentials
router.get("/users/me", authenticate, async (req, res) => {
  try {
    // Get the user ID from the decoded token
    const { id } = req.user;
    const accessToken = req.headers.authorization;
    const blacklistedToken = await BlacklistedToken.findOne({
      where: { token: accessToken },
    });

    if (blacklistedToken) {
      return res.status(401).json({ error: "Access token revoked" });
    }

    // Fetch the user data from the database
    const user = await User.findByPk(id, {
      attributes: { exclude: ["passwordHash"] },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Respond with the user's credentials
    res.json({ user });
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/auth/register", async (req, res) => {
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

router.post("/auth/logout", authenticate, async (req, res) => {
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

router.post("/auth/login", async (req, res) => {
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

router.post("/auth/refresh-token", async (req, res) => {
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
