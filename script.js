(() => {
  "use strict";

  const API_BASE = "https://mental-health-score-predictor-kohl.vercel.app";
  const form = document.getElementById("predict-form");
  const submitBtn = document.getElementById("submit-btn");
  const assessment = document.getElementById("assessment");
  const report = document.getElementById("report");
  const messageSection = document.getElementById("message-section");
  const resetBtn = document.getElementById("reset-btn");
  const errorRetryBtn = document.getElementById("error-retry-btn");
  const stepPanels = [...document.querySelectorAll(".step-panel")];
  const nextButtons = [...document.querySelectorAll(".next-btn")];
  const backButtons = [...document.querySelectorAll(".back-btn")];
  const progressBar = document.getElementById("progress-bar");
  const stepLabel = document.getElementById("step-label");
  const stepName = document.getElementById("step-name");
  const dots = [...document.querySelectorAll(".progress-dots span")];
  const stressGroup = document.getElementById("stress_level_group");
  const stressInput = document.getElementById("stress_level");
  const scoreNumber = document.getElementById("score-number");
  const scoreBand = document.getElementById("score-band");
  const scoreContext = document.getElementById("score-context");
  const gaugeFill = document.getElementById("gauge-fill");
  const errorLabel = document.getElementById("error-label");
  const errorCopy = document.getElementById("error-copy");
  const gaugeLength = 314;
  let currentStep = 1;

  function drawTicks() {
    document.querySelectorAll(".gauge-ticks").forEach((group) => {
      for (let i = 0; i <= 10; i += 2) {
        const angle = Math.PI - (i / 10) * Math.PI;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", (120 + 100 * Math.cos(angle)).toFixed(1));
        line.setAttribute("y1", (140 - 100 * Math.sin(angle)).toFixed(1));
        line.setAttribute("x2", (120 + 90 * Math.cos(angle)).toFixed(1));
        line.setAttribute("y2", (140 - 90 * Math.sin(angle)).toFixed(1));
        group.appendChild(line);
      }
    });
  }

  function fieldWrapper(input) { return input.closest(".field"); }
  function setFieldError(input, message) {
    const wrapper = fieldWrapper(input);
    if (!wrapper) return;
    wrapper.classList.add("field-error");
    const messageEl = wrapper.querySelector(".error-msg");
    if (messageEl) messageEl.textContent = message;
  }
  function clearFieldError(input) {
    const wrapper = fieldWrapper(input);
    if (!wrapper) return;
    wrapper.classList.remove("field-error");
    const messageEl = wrapper.querySelector(".error-msg");
    if (messageEl) messageEl.textContent = "";
  }
  function clearAllErrors() {
    form.querySelectorAll(".field").forEach((field) => field.classList.remove("field-error"));
    form.querySelectorAll(".error-msg").forEach((message) => { message.textContent = ""; });
  }

  function collectPayload() {
    const data = new FormData(form);
    return {
      age: data.get("age") === "" ? NaN : parseInt(data.get("age"), 10),
      gender: data.get("gender") || "",
      country: (data.get("country") || "").trim(),
      academic_level: data.get("academic_level") || "",
      most_used_platform: data.get("most_used_platform") || "",
      purpose_of_use: data.get("purpose_of_use") || "",
      avg_daily_usage_hours: data.get("avg_daily_usage_hours") === "" ? NaN : parseFloat(data.get("avg_daily_usage_hours")),
      daily_unlocks: data.get("daily_unlocks") === "" ? NaN : parseInt(data.get("daily_unlocks"), 10),
      study_hours: data.get("study_hours") === "" ? NaN : parseFloat(data.get("study_hours")),
      physical_activity_hours: data.get("physical_activity_hours") === "" ? NaN : parseFloat(data.get("physical_activity_hours")),
      sleep_hours_per_night: data.get("sleep_hours_per_night") === "" ? NaN : parseFloat(data.get("sleep_hours_per_night")),
      stress_level: data.get("stress_level") || "",
    };
  }

  function validate(payload, step) {
    const fieldsByStep = { 1: ["age", "gender", "country"], 2: ["academic_level", "study_hours", "most_used_platform", "purpose_of_use", "avg_daily_usage_hours", "daily_unlocks"], 3: ["physical_activity_hours", "sleep_hours_per_night", "stress_level"] };
    const fields = step ? fieldsByStep[step] : Object.keys(payload);
    const ranges = { age: [10, 100], avg_daily_usage_hours: [0, 24], daily_unlocks: [0, Infinity], study_hours: [0, 24], physical_activity_hours: [0, 24], sleep_hours_per_night: [0, 24] };
    const errors = [];
    fields.forEach((key) => {
      const value = payload[key];
      const input = key === "stress_level" ? stressInput : document.getElementById(key);
      if (value === "" || value === null || Number.isNaN(value)) errors.push([input, key === "stress_level" ? "Please select a stress level." : "Please enter a value."]);
      else if (ranges[key] && (value < ranges[key][0] || value > ranges[key][1])) errors.push([input, `Must be between ${ranges[key][0]} and ${ranges[key][1] === Infinity ? "0+" : ranges[key][1]}.`]);
    });
    return errors;
  }

  function updateStep(step) {
    currentStep = step;
    stepPanels.forEach((panel) => { const active = Number(panel.dataset.step) === step; panel.hidden = !active; panel.classList.toggle("active", active); });
    const names = ["Profile", "Academic & digital habits", "Lifestyle & stress"];
    stepLabel.textContent = `Step ${step} of 3`;
    stepName.textContent = names[step - 1];
    progressBar.style.width = `${((step - 1) / 2) * 100}%`;
    dots.forEach((dot, index) => dot.classList.toggle("active", index < step));
    assessment.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bandFor(score) {
    if (score < 4) return { label: "Strained", context: "Your responses suggest elevated strain right now.", explanation: "The model estimates a lower wellness signal from the information you shared. This is a prompt to notice where you may need more rest, support or recovery, not a diagnosis." };
    if (score < 7) return { label: "Balanced", context: "Your rhythm looks fairly steady, with room to recover.", explanation: "The model estimates a moderate wellness signal based on the information you provided. There may be a few parts of your routine worth gently strengthening." };
    return { label: "Strong", context: "Your habits point to a well-supported baseline.", explanation: "Your responses indicate a generally positive wellness pattern. Keep noticing which parts of your daily rhythm help you feel supported." };
  }
  function format(value, suffix = "") { return Number.isFinite(value) ? `${value.toFixed(1)}${suffix}` : "-"; }
  function renderSnapshot(payload) {
    const metrics = [["Sleep", format(payload.sleep_hours_per_night, " hrs")], ["Screen time", format(payload.avg_daily_usage_hours, " hrs")], ["Study", format(payload.study_hours, " hrs")], ["Physical activity", format(payload.physical_activity_hours, " hrs")], ["Phone unlocks", Number.isFinite(payload.daily_unlocks) ? String(payload.daily_unlocks) : "-"], ["Stress", payload.stress_level || "-"]];
    document.getElementById("metric-grid").innerHTML = metrics.map(([label, value]) => `<div class="metric-card"><span>${label}</span><strong>${value}</strong></div>`).join("");
  }
  function renderSuggestions(payload) {
    const suggestions = [];
    if (payload.sleep_hours_per_night < 7) suggestions.push("Try maintaining a more consistent sleep schedule when your week allows.");
    else suggestions.push("Keep a consistent sleep schedule where possible to protect your recovery time.");
    if (payload.avg_daily_usage_hours >= 6) suggestions.push("Consider taking short breaks during long screen sessions.");
    else suggestions.push("Continue pairing screen time with regular breaks to give your attention room to reset.");
    if (payload.physical_activity_hours < 0.5) suggestions.push("Regular movement throughout the day can support overall wellbeing.");
    if (["High", "Very High"].includes(payload.stress_level)) suggestions.push("Consider building short recovery periods into your study routine.");
    if (payload.study_hours >= 6) suggestions.push("Try breaking longer study blocks into smaller sessions with brief pauses.");
    if (payload.daily_unlocks >= 80) suggestions.push("Consider setting a few phone-free moments during study or wind-down time.");
    if (suggestions.length < 2) suggestions.push("Keep noticing which routines help you feel rested, focused and connected.");
    document.getElementById("suggestion-list").innerHTML = suggestions.slice(0, 3).map((suggestion) => `<div class="suggestion"><span aria-hidden="true">+</span><p>${suggestion}</p></div>`).join("");
  }
  function renderResult(score, payload) {
    const clamped = Math.max(0, Math.min(10, score));
    const band = bandFor(clamped);
    scoreNumber.textContent = score.toFixed(2);
    scoreBand.textContent = band.label;
    scoreContext.textContent = band.context;
    document.getElementById("result-explanation").textContent = band.explanation;
    renderSnapshot(payload);
    renderSuggestions(payload);
    gaugeFill.style.transition = "none";
    gaugeFill.style.strokeDashoffset = String(gaugeLength);
    report.hidden = false;
    requestAnimationFrame(() => { gaugeFill.style.transition = ""; gaugeFill.style.strokeDashoffset = String(gaugeLength * (1 - clamped / 10)); });
    report.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function showMessage(title, copy) { errorLabel.textContent = title; errorCopy.textContent = copy; messageSection.hidden = false; messageSection.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function applyServerErrors(detail) {
    if (!Array.isArray(detail)) return;
    detail.forEach((item) => {
      const key = item.loc?.[item.loc.length - 1];
      const input = key === "stress_level" ? stressInput : document.getElementById(key);
      if (input) setFieldError(input, item.msg || "Please enter a valid value.");
    });
  }
  function resetAssessment() { form.reset(); stressInput.value = ""; stressGroup.querySelectorAll(".seg-btn").forEach((button) => button.classList.remove("active")); clearAllErrors(); messageSection.hidden = true; report.hidden = true; updateStep(1); document.getElementById("age").focus(); }

  drawTicks();
  stressGroup.querySelectorAll(".seg-btn").forEach((button) => button.addEventListener("click", () => { stressGroup.querySelectorAll(".seg-btn").forEach((item) => item.classList.remove("active")); button.classList.add("active"); stressInput.value = button.dataset.value; clearFieldError(stressInput); }));
  nextButtons.forEach((button) => button.addEventListener("click", () => { clearAllErrors(); const errors = validate(collectPayload(), currentStep); if (errors.length) { errors.forEach(([input, message]) => setFieldError(input, message)); errors[0][0]?.focus(); return; } updateStep(currentStep + 1); }));
  backButtons.forEach((button) => button.addEventListener("click", () => updateStep(currentStep - 1)));
  form.querySelectorAll("input, select").forEach((input) => { input.addEventListener("input", () => clearFieldError(input)); input.addEventListener("change", () => clearFieldError(input)); });
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); clearAllErrors(); messageSection.hidden = true;
    const payload = collectPayload(); const errors = validate(payload);
    if (errors.length) { errors.forEach(([input, message]) => setFieldError(input, message)); errors[0][0]?.focus(); return; }
    submitBtn.disabled = true; submitBtn.classList.add("loading"); document.querySelector(".assessment-shell").classList.add("is-loading");
    try {
      const response = await fetch(`${API_BASE}/predict`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (response.status === 422) { const body = await response.json().catch(() => null); applyServerErrors(body?.detail); showMessage("Check your inputs", "The model rejected a few fields. Review the highlighted details and try again."); return; }
      if (!response.ok) { showMessage("We couldn't generate your signal", "The prediction service is unavailable right now. Please try again."); return; }
      const result = await response.json();
      if (typeof result.predicted_mental_health_score !== "number") { showMessage("Unexpected response", "The service responded, but the score was missing or malformed."); return; }
      renderResult(result.predicted_mental_health_score, payload);
    } catch (error) { showMessage("We couldn't generate your signal", "Please check your connection and try again."); }
    finally { submitBtn.disabled = false; submitBtn.classList.remove("loading"); document.querySelector(".assessment-shell").classList.remove("is-loading"); }
  });
  resetBtn.addEventListener("click", resetAssessment);
  errorRetryBtn.addEventListener("click", resetAssessment);
})();