const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    sleep_hours: {
      type: Number,
      required: true,
    },
    mood_level: {
      type: Number,
      required: true,
    },
    stress_level: {
      type: Number,
      required: true,
    },
    hydration_level: {
      type: Number,
      required: true,
    },
    screen_time: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    prediction: {
      type: Number,
      required: true,
    },
    risk_label: {
      type: String,
      required: true,
    },
    probability: {
      type: Number,
      required: true,
    },
    ai_explanation: {
      type: String,
      default: "",
    },
    explanation_source: {
      type: String,
      default: "rule_based",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Prediction", predictionSchema);
