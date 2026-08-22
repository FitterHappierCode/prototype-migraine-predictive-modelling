const express = require("express");
const axios = require("axios");

const Prediction = require("../models/Prediction");

const router = express.Router();
const mlServiceUrl =
  process.env.ML_SERVICE_URL || "http://127.0.0.1:8000/predict";
const headacheDiaryMlServiceUrl =
  process.env.HEADACHE_DIARY_ML_SERVICE_URL ||
  mlServiceUrl.replace(/\/predict\/?$/, "/predict-headache-diary");
const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

function getLifestyleSignals(input) {
  const signals = [];

  if (Number(input.sleep_hours) < 6) {
    signals.push("sleep duration is low");
  }

  if (Number(input.stress_level) >= 8) {
    signals.push("stress level is high");
  }

  if (Number(input.hydration_level) <= 3) {
    signals.push("hydration level is low");
  }

  if (Number(input.screen_time) > 8) {
    signals.push("screen time is high");
  }

  if (Number(input.mood_level) <= 3) {
    signals.push("mood level is low");
  }

  return signals;
}

function getDiarySignals(input) {
  const labels = {
    preventive_medication_use: "preventive medication was used",
    stress: "stress was selected",
    excess_sleep: "excess sleep was selected",
    sleep_deprivation: "sleep deprivation was selected",
    exercise_trigger: "exercise was selected as a trigger",
    no_exercise: "no exercise was selected",
    physical_fatigue: "physical fatigue was selected",
    menstrual_phase: "menstrual phase was selected",
    ovulation_phase: "ovulation phase was selected",
    emotional_change: "strong emotional change was selected",
    weather_temperature_change: "weather or temperature change was selected",
    excessive_sunlight: "excessive sunlight was selected",
    noise: "noise was selected",
    inappropriate_lighting: "inappropriate lighting was selected",
    specific_smell: "specific smell was selected",
    excess_alcohol: "excess alcohol was selected",
    irregular_meals: "irregular meals or fasting was selected",
    overeating: "overeating was selected",
    excess_caffeine: "excess caffeine was selected",
    excess_smoking: "excess smoking was selected",
    cheese_chocolate: "cheese or chocolate was selected",
    travel: "travel was selected",
    other_trigger: "another trigger was selected",
  };

  return Object.entries(labels)
    .filter(([key]) => Number(input[key]) === 1)
    .map(([, label]) => label);
}

function getMlDiaryPayload(input) {
  const { sex_gender, ...mlPayload } = input;
  return mlPayload;
}

function getFallbackExplanation({ modelType, riskLabel, probability, signals }) {
  const probabilityPercent = Math.round(Number(probability) * 100);

  if (signals.length === 0) {
    return `The model estimated ${riskLabel.toLowerCase()} with a probability of ${probabilityPercent}%. No single input stands out strongly, so this should be interpreted as a general risk estimate rather than a diagnosis.`;
  }

  const factorText = signals.slice(0, 3).join(", ");
  const focusText =
    modelType === "diary"
      ? "These diary factors may be useful to monitor when reviewing future headache patterns."
      : "These lifestyle factors may be useful to monitor when reviewing future migraine risk.";

  return `The model estimated ${riskLabel.toLowerCase()} with a probability of ${probabilityPercent}%. The main factors to reflect on are: ${factorText}. ${focusText}`;
}

function extractOpenAiText(data) {
  if (data.output_text) {
    return data.output_text.trim();
  }

  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join(" ")
    .trim();
}

async function generateExplanation({ modelType, input, riskLabel, probability, signals }) {
  const fallbackExplanation = getFallbackExplanation({
    modelType,
    riskLabel,
    probability,
    signals,
  });

  if (!openAiApiKey) {
    return {
      ai_explanation: fallbackExplanation,
      explanation_source: "rule_based",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: openAiModel,
        instructions:
          "You write brief, cautious, non-diagnostic self-management explanations for a headache risk prototype. Do not give medical advice, treatment instructions, or certainty. Use 2 short sentences. Include that the output is not a diagnosis.",
        input: JSON.stringify({
          model_type: modelType,
          risk_label: riskLabel,
          probability,
          notable_factors: signals,
          user_input: input,
        }),
        max_output_tokens: 110,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `OpenAI request failed with status ${response.status}: ${errorBody}`
      );
    }

    const data = await response.json();
    const aiText = extractOpenAiText(data);

    return {
      ai_explanation: aiText || fallbackExplanation,
      explanation_source: aiText ? "openai" : "rule_based",
    };
  } catch (error) {
    console.warn("OpenAI explanation failed; using rule-based fallback:", error.message);

    return {
      ai_explanation: fallbackExplanation,
      explanation_source: "rule_based",
    };
  } finally {
    clearTimeout(timeout);
  }
}

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
    const explanation = await generateExplanation({
      modelType: "lifestyle",
      input: {
        sleep_hours,
        mood_level,
        stress_level,
        hydration_level,
        screen_time,
        date,
      },
      riskLabel: risk_label,
      probability,
      signals: getLifestyleSignals(req.body),
    });

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
        ...explanation,
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
        ...explanation,
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
    const mlPayload = getMlDiaryPayload(req.body);
    const mlResponse = await axios.post(headacheDiaryMlServiceUrl, mlPayload);
    const { risk_label, probability } = mlResponse.data;
    const explanation = await generateExplanation({
      modelType: "diary",
      input: req.body,
      riskLabel: risk_label,
      probability,
      signals: getDiarySignals(req.body),
    });

    res.status(200).json({
      ...mlResponse.data,
      ...explanation,
    });
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
