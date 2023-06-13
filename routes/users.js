const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const User = require("../models/User");

const BlacklistedToken = require("../models/BlacklistedToken");

router.get("/me", authenticate, async (req, res) => {
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

module.exports = router;
