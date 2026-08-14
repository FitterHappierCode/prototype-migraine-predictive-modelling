const express = require("express");
const axios = require("axios");

const Prediction = require("../models/Prediction");

const router = express.Router();
const mlServiceUrl =
  process.env.ML_SERVICE_URL || "http://127.0.0.1:8000/predict";
const headacheDiaryMlServiceUrl =
  process.env.HEADACHE_DIARY_ML_SERVICE_URL ||
  mlServiceUrl.replace(/\/predict\/?$/, "/predict-headache-diary");

// Save a new prediction after sending the user input to the Python ML service.
router.post("/", async (req, res) => {
  try {
    const {
      sleep_hours,
      mood_level,
      stress_level,
      hydration_level,
      screen_time,
      date,
    } = req.body;

    const mlResponse = await axios.post(mlServiceUrl, {
      sleep_hours,
      mood_level,
      stress_level,
      hydration_level,
      screen_time,
      date,
    });

    const { prediction, risk_label, probability } = mlResponse.data;

    try {
      const savedPrediction = await Prediction.create({
        sleep_hours,
        mood_level,
        stress_level,
        hydration_level,
        screen_time,
        date,
        prediction,
        risk_label,
        probability,
      });

      return res.status(201).json(savedPrediction);
    } catch (databaseError) {
      return res.status(200).json({
        sleep_hours,
        mood_level,
        stress_level,
        hydration_level,
        screen_time,
        date,
        prediction,
        risk_label,
        probability,
        database_warning:
          "Prediction was created, but it could not be saved to MongoDB.",
      });
    }
  } catch (error) {
    if (error.response) {
      return res.status(502).json({
        message: "ML service returned an error",
        details: error.response.data,
      });
    }

    res.status(500).json({
      message: "Failed to create prediction",
      error: error.message,
    });
  }
});

// Send headache diary trigger inputs to the second Python ML model.
router.post("/headache-diary", async (req, res) => {
  try {
    const mlResponse = await axios.post(headacheDiaryMlServiceUrl, req.body);

    res.status(200).json(mlResponse.data);
  } catch (error) {
    if (error.response) {
      return res.status(502).json({
        message: "Headache diary ML service returned an error",
        details: error.response.data,
      });
    }

    res.status(500).json({
      message: "Failed to create headache diary prediction",
      error: error.message,
    });
  }
});

// Return all saved predictions, with the newest entries first.
router.get("/", async (req, res) => {
  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 });
    res.json(predictions);
  } catch (error) {
    res.json([]);
  }
});

module.exports = router;
