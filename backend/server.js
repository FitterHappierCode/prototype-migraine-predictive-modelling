const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const predictionRoutes = require("./routes/predictionRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Allow requests from other parts of the project, such as a future frontend.
app.use(cors());

// Parse incoming JSON request bodies.
app.use(express.json());

// Connect to MongoDB using the connection string from the environment file.
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

// Simple health check route for confirming the backend is running.
app.get("/", (req, res) => {
  res.json({ message: "MERN backend is running" });
});

// All prediction-related routes are grouped under this base path.
app.use("/api/predictions", predictionRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
