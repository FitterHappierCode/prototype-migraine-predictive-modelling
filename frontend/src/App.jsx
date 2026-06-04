import { useEffect, useState } from "react";
import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001";

const todayDate = new Date().toISOString().split("T")[0];

const initialForm = {
  sleep_hours: 5,
  mood_level: 5,
  stress_level: 5,
  hydration_level: 5,
  screen_time: 5,
  date: todayDate,
};

function formatProbability(probability) {
  if (probability === null || probability === undefined) {
    return "N/A";
  }

  return `${Math.round(probability * 100)}%`;
}

function getPredictionText(prediction) {
  return prediction === 1
    ? "Migraine occurrence predicted"
    : "Migraine occurrence not predicted";
}

function App() {
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [submitError, setSubmitError] = useState("");
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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: name === "date" ? value : Number(value),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setResult(null);

    try {
      const response = await axios.post(`${apiBaseUrl}/api/predictions`, formData);
      setResult(response.data);
      fetchPredictionHistory();
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          "Prediction request failed. Please check the backend and ML service."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <main className="page">
        <header className="hero">
          <p className="eyebrow">MSc AI Project Demo</p>
          <h1>Migraine and Headache Risk Prediction Prototype</h1>
          <p className="intro">
            This web-based prototype estimates migraine or headache occurrence
            risk from self-reported lifestyle factors. It is designed as an
            academic demonstration of a machine-learning workflow rather than a
            clinical system.
          </p>
          <div className="disclaimer">
            This prototype is for educational and research purposes only. It is
            not a medical diagnosis tool.
          </div>
        </header>

        <section className="layout">
          <section className="panel">
            <h2>Enter Lifestyle Information</h2>
            <form className="prediction-form" onSubmit={handleSubmit}>
              <label>
                <span>Sleep Hours</span>
                <input
                  type="number"
                  name="sleep_hours"
                  value={formData.sleep_hours}
                  onChange={handleChange}
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
                  value={formData.mood_level}
                  onChange={handleChange}
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
                  value={formData.stress_level}
                  onChange={handleChange}
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
                  value={formData.hydration_level}
                  onChange={handleChange}
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
                  value={formData.screen_time}
                  onChange={handleChange}
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
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </label>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Predict Risk"}
              </button>
            </form>

            {submitError ? <p className="error-message">{submitError}</p> : null}
          </section>

          <section className="panel result-panel">
            <h2>Prediction Result</h2>
            {result ? (
              <div className="result-card">
                <div className="result-badge">{result.risk_label}</div>
                <p className="result-summary">
                  {getPredictionText(result.prediction)}
                </p>
                <div className="result-grid">
                  <div>
                    <span className="result-label">Prediction Outcome</span>
                    <strong>{getPredictionText(result.prediction)}</strong>
                  </div>
                  <div>
                    <span className="result-label">Probability</span>
                    <strong>{formatProbability(result.probability)}</strong>
                  </div>
                </div>
                <p className="model-note">
                  The model shows moderate predictive performance and should be
                  interpreted only as a risk-estimation prototype.
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
            <h2>Recent Prediction History</h2>
            <p>Saved predictions are shown from newest to oldest.</p>
          </div>

          {isLoadingHistory ? <p className="muted-text">Loading history...</p> : null}
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
                No saved predictions yet. Submit a form to create the first one.
              </p>
            )
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;
