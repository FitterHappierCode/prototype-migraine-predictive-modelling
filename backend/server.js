const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

const predictionRoutes = require("./routes/predictionRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

const mongoStateLabels = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

// Allow requests from other parts of the project, such as a future frontend.
app.use(cors());

// Parse incoming JSON request bodies.
app.use(express.json());

// Serve the deployed demo page from the backend for simple sharing.
app.use("/demo", express.static(path.join(__dirname, "public")));

// Connect to MongoDB using the connection string from the environment file.
// The backend can still run if MongoDB is unavailable, but saved history will not work.
if (!mongoUri) {
  console.warn("MONGO_URI is not set. Prediction history will not be saved.");
} else {
  mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error.message);
    });
}

// Simple health check route for confirming the backend is running.
app.get("/", (req, res) => {
  res.json({ message: "MERN backend is running" });
});

// Health route for checking whether MongoDB is configured and connected.
app.get("/api/health", (req, res) => {
  const state = mongoose.connection.readyState;

  res.json({
    backend: "running",
    mongo: {
      configured: Boolean(mongoUri),
      state,
      state_label: mongoStateLabels[state] || "unknown",
      database: mongoose.connection.name || null,
      host: mongoose.connection.host || null,
    },
    openai: {
      configured: Boolean(openAiApiKey),
      model: openAiModel,
    },
  });
});

// All prediction-related routes are grouped under this base path.
app.use("/api/predictions", predictionRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
