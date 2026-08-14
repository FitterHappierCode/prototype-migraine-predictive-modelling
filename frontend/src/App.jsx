import { useEffect, useState } from "react";
import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001";

const todayDate = new Date().toISOString().split("T")[0];

const initialLifestyleForm = {
  sleep_hours: 5,
  mood_level: 5,
  stress_level: 5,
  hydration_level: 5,
  screen_time: 5,
  date: todayDate,
};

const initialDiaryForm = {
  preventive_medication_use: 0,
  stress: 0,
  excess_sleep: 0,
  sleep_deprivation: 0,
  exercise_trigger: 0,
  no_exercise: 0,
  physical_fatigue: 0,
  menstrual_phase: 0,
  ovulation_phase: 0,
  emotional_change: 0,
  weather_temperature_change: 0,
  excessive_sunlight: 0,
  noise: 0,
  inappropriate_lighting: 0,
  specific_smell: 0,
  excess_alcohol: 0,
  irregular_meals: 0,
  overeating: 0,
  excess_caffeine: 0,
  excess_smoking: 0,
  cheese_chocolate: 0,
  travel: 0,
  other_trigger: 0,
  exercise_status: 0,
  vigorous_exercise: 0,
  moderate_exercise: 0,
};

const diaryFields = [
  ["preventive_medication_use", "Preventive medication used"],
  ["stress", "Stress"],
  ["excess_sleep", "Excess sleep"],
  ["sleep_deprivation", "Sleep deprivation"],
  ["physical_fatigue", "Physical fatigue"],
  ["weather_temperature_change", "Weather/temperature change"],
  ["excessive_sunlight", "Excessive sunlight"],
  ["noise", "Noise"],
  ["inappropriate_lighting", "Inappropriate lighting"],
  ["specific_smell", "Specific smell trigger"],
  ["excess_alcohol", "Excess alcohol"],
  ["irregular_meals", "Irregular meals / fasting"],
  ["overeating", "Overeating"],
  ["excess_caffeine", "Excess caffeine drinks"],
  ["excess_smoking", "Excess smoking"],
  ["cheese_chocolate", "Cheese or chocolate"],
  ["travel", "Travel"],
  ["other_trigger", "Other trigger"],
  ["emotional_change", "Strong emotional change"],
  ["exercise_trigger", "Exercise as trigger"],
  ["no_exercise", "No exercise"],
  ["exercise_status", "Exercise done today"],
  ["vigorous_exercise", "Vigorous exercise"],
  ["moderate_exercise", "Moderate exercise"],
  ["menstrual_phase", "Menstrual phase"],
  ["ovulation_phase", "Ovulation phase"],
];

function formatProbability(probability) {
  if (probability === null || probability === undefined) {
    return "N/A";
  }

  return `${Math.round(probability * 100)}%`;
}

function getMigrainePredictionText(prediction) {
  return prediction === 1
    ? "Migraine occurrence predicted"
    : "Migraine occurrence not predicted";
}

function getHeadachePredictionText(prediction) {
  return prediction === 1
    ? "Headache day predicted"
    : "Headache-free day predicted";
}

function App() {
  const [activeTab, setActiveTab] = useState("lifestyle");
  const [lifestyleForm, setLifestyleForm] = useState(initialLifestyleForm);
  const [diaryForm, setDiaryForm] = useState(initialDiaryForm);
  const [lifestyleResult, setLifestyleResult] = useState(null);
  const [diaryResult, setDiaryResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isSubmittingLifestyle, setIsSubmittingLifestyle] = useState(false);
  const [isSubmittingDiary, setIsSubmittingDiary] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [lifestyleError, setLifestyleError] = useState("");
  const [diaryError, setDiaryError] = useState("");
  const [historyError, setHistoryError] = useState("");

  async function fetchPredictionHistory() {
    setIsLoadingHistory(true);
    setHistoryError("");

    try {
      const response = await axios.get(`${apiBaseUrl}/api/predictions`);
      setHistory(response.data);
    } catch (error) {
      setHistoryError("Could not load recent prediction history.");
    } finally {
      setIsLoadingHistory(false);
    }
  }

  useEffect(() => {
    fetchPredictionHistory();
  }, []);

  function handleLifestyleChange(event) {
    const { name, value } = event.target;

    setLifestyleForm((current) => ({
      ...current,
      [name]: name === "date" ? value : Number(value),
    }));
  }

  function handleDiaryCheckboxChange(event) {
    const { name, checked } = event.target;

    setDiaryForm((current) => ({
      ...current,
      [name]: checked ? 1 : 0,
    }));
  }

  async function handleLifestyleSubmit(event) {
    event.preventDefault();
    setIsSubmittingLifestyle(true);
    setLifestyleError("");
    setLifestyleResult(null);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/predictions`,
        lifestyleForm
      );
      setLifestyleResult(response.data);
      fetchPredictionHistory();
    } catch (error) {
      setLifestyleError(
        error.response?.data?.message ||
          "Prediction request failed. Please check the backend and ML service."
      );
    } finally {
      setIsSubmittingLifestyle(false);
    }
  }

  async function handleDiarySubmit(event) {
    event.preventDefault();
    setIsSubmittingDiary(true);
    setDiaryError("");
    setDiaryResult(null);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/predictions/headache-diary`,
        diaryForm
      );
      setDiaryResult(response.data);
    } catch (error) {
      setDiaryError(
        error.response?.data?.message ||
          "Headache diary prediction failed. Please check the backend and ML service."
      );
    } finally {
      setIsSubmittingDiary(false);
    }
  }

  return (
    <div className="app-shell">
      <main className="page">
        <header className="hero">
          <p className="eyebrow">MSc AI Project Demo</p>
          <h1>Migraine and Headache Risk Prediction Prototype</h1>
          <p className="intro">
            This web-based prototype demonstrates two separate machine-learning
            models: a lifestyle-based migraine occurrence model and a headache
            diary trigger model. The models are trained on different datasets and
            should be interpreted independently.
          </p>
          <div className="disclaimer">
            This prototype is for educational and research purposes only. It is
            not a medical diagnosis tool.
          </div>
        </header>

        <nav className="model-tabs" aria-label="Prediction model tabs">
          <button
            className={activeTab === "lifestyle" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("lifestyle")}
          >
            Lifestyle Migraine Risk
          </button>
          <button
            className={activeTab === "diary" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("diary")}
          >
            Headache Diary Risk
          </button>
        </nav>

        {activeTab === "lifestyle" ? (
          <>
            <section className="model-context panel soft-panel">
              <h2>Lifestyle-Based Migraine Occurrence Model</h2>
              <p>
                This model uses the original lifestyle dataset and estimates the
                probability of migraine occurrence from daily self-reported
                factors such as sleep, mood, stress, hydration and screen time.
              </p>
            </section>

            <section className="layout">
              <section className="panel">
                <h2>Enter Lifestyle Information</h2>
                <form className="prediction-form" onSubmit={handleLifestyleSubmit}>
                  <label>
                    <span>Sleep Hours</span>
                    <input
                      type="number"
                      name="sleep_hours"
                      value={lifestyleForm.sleep_hours}
                      onChange={handleLifestyleChange}
                      min="0"
                      max="24"
                      step="0.1"
                      required
                    />
                  </label>

                  <label>
                    <span>Mood Level</span>
                    <small className="field-helper">
                      1 = very low, 10 = very positive
                    </small>
                    <input
                      type="number"
                      name="mood_level"
                      value={lifestyleForm.mood_level}
                      onChange={handleLifestyleChange}
                      min="1"
                      max="10"
                      step="1"
                      required
                    />
                  </label>

                  <label>
                    <span>Stress Level</span>
                    <small className="field-helper">
                      1 = very low, 10 = very high
                    </small>
                    <input
                      type="number"
                      name="stress_level"
                      value={lifestyleForm.stress_level}
                      onChange={handleLifestyleChange}
                      min="1"
                      max="10"
                      step="1"
                      required
                    />
                  </label>

                  <label>
                    <span>Hydration Level</span>
                    <small className="field-helper">
                      1 = very low, 10 = very good
                    </small>
                    <input
                      type="number"
                      name="hydration_level"
                      value={lifestyleForm.hydration_level}
                      onChange={handleLifestyleChange}
                      min="1"
                      max="10"
                      step="1"
                      required
                    />
                  </label>

                  <label>
                    <span>Screen Time (hours)</span>
                    <input
                      type="number"
                      name="screen_time"
                      value={lifestyleForm.screen_time}
                      onChange={handleLifestyleChange}
                      min="0"
                      max="24"
                      step="0.1"
                      required
                    />
                  </label>

                  <label>
                    <span>Date for this record</span>
                    <small className="field-helper">
                      Select the date these lifestyle details apply to.
                    </small>
                    <input
                      type="date"
                      name="date"
                      value={lifestyleForm.date}
                      onChange={handleLifestyleChange}
                      required
                    />
                  </label>

                  <button type="submit" disabled={isSubmittingLifestyle}>
                    {isSubmittingLifestyle ? "Submitting..." : "Predict Migraine Risk"}
                  </button>
                </form>

                {lifestyleError ? (
                  <p className="error-message">{lifestyleError}</p>
                ) : null}
              </section>

              <section className="panel result-panel">
                <h2>Prediction Result</h2>
                {lifestyleResult ? (
                  <div className="result-card">
                    <div className="result-badge">
                      {lifestyleResult.risk_label}
                    </div>
                    <p className="result-summary">
                      {getMigrainePredictionText(lifestyleResult.prediction)}
                    </p>
                    <div className="result-grid">
                      <div>
                        <span className="result-label">Prediction Outcome</span>
                        <strong>
                          {getMigrainePredictionText(lifestyleResult.prediction)}
                        </strong>
                      </div>
                      <div>
                        <span className="result-label">Probability</span>
                        <strong>
                          {formatProbability(lifestyleResult.probability)}
                        </strong>
                      </div>
                    </div>
                    {lifestyleResult.ai_explanation ? (
                      <div className="ai-explanation">
                        <strong>Self-management note</strong>
                        <p>{lifestyleResult.ai_explanation}</p>
                      </div>
                    ) : null}
                    <p className="model-note">
                      The model shows moderate predictive performance and should
                      be interpreted only as a risk-estimation prototype.
                    </p>
                  </div>
                ) : (
                  <p className="muted-text">
                    Submit the form to see the latest migraine risk prediction.
                  </p>
                )}
              </section>
            </section>

            <section className="panel history-panel">
              <div className="section-heading">
                <h2>Recent Lifestyle Prediction History</h2>
                <p>Saved predictions are shown from newest to oldest.</p>
              </div>

              {isLoadingHistory ? (
                <p className="muted-text">Loading history...</p>
              ) : null}
              {historyError ? <p className="error-message">{historyError}</p> : null}

              {!isLoadingHistory && !historyError ? (
                history.length > 0 ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Date for Record</th>
                          <th>Sleep Hours</th>
                          <th>Mood Level</th>
                          <th>Stress Level</th>
                          <th>Hydration Level</th>
                          <th>Screen Time</th>
                          <th>Risk Label</th>
                          <th>Probability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((item) => (
                          <tr key={item._id}>
                            <td>{new Date(item.date).toLocaleDateString()}</td>
                            <td>{item.sleep_hours}</td>
                            <td>{item.mood_level}</td>
                            <td>{item.stress_level}</td>
                            <td>{item.hydration_level}</td>
                            <td>{item.screen_time}</td>
                            <td>{item.risk_label}</td>
                            <td>{formatProbability(item.probability)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="muted-text">
                    No saved predictions yet. Submit a form to create the first
                    one.
                  </p>
                )
              ) : null}
            </section>
          </>
        ) : (
          <>
            <section className="model-context panel soft-panel">
              <h2>Headache Diary Trigger Model</h2>
              <p>
                This second model uses a separate published smartphone headache
                diary dataset. It predicts headache day risk from trigger-style
                diary inputs rather than from the original lifestyle dataset.
              </p>
              <p className="source-note">
                Reference dataset: Park et al. (2016), PLOS ONE smartphone
                headache diary study. The source paper is used as the benchmark
                reference for diary variables and trigger categories.
              </p>
            </section>

            <section className="layout">
              <section className="panel">
                <h2>Select Diary Factors</h2>
                <p className="muted-text form-note">
                  Tick the factors that apply to the diary day being considered.
                </p>
                <form className="checkbox-form" onSubmit={handleDiarySubmit}>
                  {diaryFields.map(([name, label]) => (
                    <label className="checkbox-field" key={name}>
                      <input
                        type="checkbox"
                        name={name}
                        checked={diaryForm[name] === 1}
                        onChange={handleDiaryCheckboxChange}
                      />
                      <span>{label}</span>
                    </label>
                  ))}

                  <button type="submit" disabled={isSubmittingDiary}>
                    {isSubmittingDiary ? "Submitting..." : "Predict Headache Risk"}
                  </button>
                </form>

                {diaryError ? <p className="error-message">{diaryError}</p> : null}
              </section>

              <section className="panel result-panel">
                <h2>Headache Diary Result</h2>
                {diaryResult ? (
                  <div className="result-card diary-card">
                    <div className="result-badge">{diaryResult.risk_label}</div>
                    <p className="result-summary">
                      {getHeadachePredictionText(diaryResult.prediction)}
                    </p>
                    <div className="result-grid">
                      <div>
                        <span className="result-label">Prediction Outcome</span>
                        <strong>
                          {getHeadachePredictionText(diaryResult.prediction)}
                        </strong>
                      </div>
                      <div>
                        <span className="result-label">Probability</span>
                        <strong>{formatProbability(diaryResult.probability)}</strong>
                      </div>
                    </div>
                    {diaryResult.ai_explanation ? (
                      <div className="ai-explanation">
                        <strong>Self-management note</strong>
                        <p>{diaryResult.ai_explanation}</p>
                      </div>
                    ) : null}
                    <p className="model-note">
                      This model is trained on a separate published headache
                      diary dataset and should not be directly compared or merged
                      with the lifestyle model without further validation.
                    </p>
                  </div>
                ) : (
                  <p className="muted-text">
                    Submit the diary factors to see the headache day risk
                    estimate.
                  </p>
                )}
              </section>
            </section>

            <section className="panel history-panel">
              <div className="section-heading">
                <h2>Why This Is Separate</h2>
                <p>
                  The headache diary model uses trigger and diary information
                  from a published study, while the lifestyle model uses the
                  original daily lifestyle dataset. Keeping them separate makes
                  the prototype easier to explain and avoids mixing incompatible
                  datasets.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
