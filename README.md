# Mental Health Score Predictor

A student wellness prediction project that estimates a mental health score based on lifestyle, digital usage, study patterns, sleep, and stress indicators. The project combines a trained machine learning model with a simple web interface and a FastAPI backend.

## Overview

This project was created to analyze how everyday behaviors such as study hours, screen time, sleep, physical activity, and stress levels may relate to a student's mental wellness score. It uses a trained model to provide a quick, informative assessment that can be used as an educational and awareness tool.

The application includes:

- A responsive front-end form for collecting student information
- A Python FastAPI backend for prediction
- A machine learning model saved as `Mental_Health_Model.pkl`
- A simple Vercel deployment setup for static frontend and API routes

## Features

- Predicts a mental health score from student input data
- Accepts values such as age, gender, country, academic level, platform use, and stress level
- Provides an easy-to-use web interface
- Uses a trained model to generate a score between a practical assessment range
- Includes API endpoints for direct integration

## Tech Stack

- Python
- FastAPI
- scikit-learn
- Pandas
- Joblib
- JavaScript / HTML / CSS
- Vercel deployment configuration

## Project Structure

```text
.
├── index.html              # Frontend UI
├── style.css               # Styling for the app
├── script.js               # Client-side form logic and API calls
├── main.py                 # FastAPI application and prediction logic
├── Mental_Health_Model.pkl # Trained ML model
├── Student Social Media And Mental Health Impact.csv
├── ML_Project.ipynb        # Notebook with model development
├── requirements.txt        # Python dependencies
├── vercel.json             # Vercel deployment config
├── README.md               # Project documentation
└── .gitignore              # Git ignore rules (if present in repo)
```

## How It Works

1. The user fills out a form with profile and lifestyle details.
2. The browser sends the data to the backend API.
3. The backend prepares the input in the format expected by the trained model.
4. The model predicts a mental health score.
5. The frontend displays the score and a brief interpretation.

## Backend API

The API is built in `main.py` and exposes a `POST /predict` endpoint.

### Request format

```json
{
  "age": 21,
  "gender": "Female",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 5.5,
  "daily_unlocks": 30,
  "study_hours": 3.0,
  "physical_activity_hours": 1.5,
  "sleep_hours_per_night": 6.5,
  "stress_level": "Medium"
}
```

### Response format

```json
{
  "predicted_mental_health_score": 7.42
}
````

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/mental-health-score-predictor.git
cd mental-health-score-predictor
```

### 2. Create a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the backend

```bash
uvicorn main:app --reload
```

Then open:

- http://localhost:8000
- http://localhost:8000/docs for FastAPI Swagger documentation

## Frontend Usage

Open the `index.html` page in a browser or serve the project through a local static server. The app collects responses and sends them to the backend for prediction.

## Deployment

This project includes a `vercel.json` file for deployment support. It routes the prediction API and serves static assets.

## Important Disclaimer

This application is intended for educational and awareness purposes only. It is not a medical diagnosis or a clinical assessment. If a user is experiencing serious mental health concerns, they should consult a qualified healthcare professional.

## License

This project is available for educational and personal use. If you plan to use it publicly, please check the repository license or add one before publishing.

## Author

Created as a student wellness analytics project focused on understanding behavioral patterns and mental health signals through data-driven prediction.
