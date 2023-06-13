const express = require("express");
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Routes
const router = require("./routes/index");

app.use("/api", router);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
