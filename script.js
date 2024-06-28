"use strict";

import {
  shuffleArray,
  setLocalStorage,
  resetLocalStorage,
  getLocalStorage,
} from "./helpers.js";

// DOM elements
const app = document.querySelector(".app");
const questionBox = document.querySelector(".question-box");
const results = document.querySelector(".results");
const resultsPage = document.querySelector(".results-page");
const again = document.querySelector(".again");
const lastScoreBox = document.querySelector(".last-score-box");
const lastScoreEl = document.getElementById("last-score");

// State variables
let currentIndex = 0;
let quiz = [];
let questions = [];
let correctAnswers = [];
let answers = [];
let score = 0;

// Constants
const FETCH_TIMEOUT = 3000;

// functions
const fetchQuestions = async function () {
  renderSpinner();

  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("Request timed out. Please try again."));
    }, FETCH_TIMEOUT);
  });

  try {
    const fetchPromise = fetch(
      "https://opentdb.com/api.php?amount=10&type=multiple"
    );
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      throw new Error("Failed to fetch quiz.");
    }

    const data = await response.json();
    quiz = data.results;
    quiz.length > 0 ? renderQuiz(quiz) : renderError("No quiz data available.");
  } catch (err) {
    renderError(err.message);
  }
};

function renderSpinner() {
  const spinner = `<div class="wrapper">
          <i class="spinner"></i>
        </div>`;
  questionBox.innerHTML = spinner;
}

function renderError(message) {
  const errorMessage = `
        <div class="error">
          <p>${message}</p>
        </div>`;
  questionBox.innerHTML = errorMessage;
}

function renderLastScore() {
  const lastScore = getLocalStorage("score");
  if (!lastScore) lastScoreBox.classList.add("hidden");
  if (lastScore) {
    lastScoreBox.classList.remove("hidden");
    lastScoreEl.innerText = lastScore;
  }
}

function init() {
  resetLocalStorage("answers");
  resetLocalStorage("questions");
  resultsPage.classList.add("hidden");

  renderLastScore();
  fetchQuestions();
}

init();

function updateUI() {
  if (currentIndex <= quiz.length - 1) renderAppPage();

  if (currentIndex === quiz.length) renderResultsPage();
}

function renderAppPage() {
  resultsPage.classList.add("hidden");
  renderQuiz(quiz);
}

function renderQuiz(quiz) {
  renderQuestion(quiz[currentIndex]);
}

function renderQuestion(questionData) {
  questionBox.innerHTML = "";

  const {
    question,
    incorrect_answers: incorrectAnswers,
    correct_answer: correctAnswer,
  } = questionData;

  questions = [...questions, question];
  setLocalStorage("questions", questions);

  const options = [...incorrectAnswers, correctAnswer];
  correctAnswers = [...correctAnswers, correctAnswer];

  shuffleArray(options);

  const html = `
      <h2 class="question"> <strong>${
        currentIndex + 1
      }.</strong> ${question}</h2>
      <div class="options">${options
        .map((option) => renderOptions(option))
        .join("")}</div>
   `;
  questionBox.insertAdjacentHTML("afterbegin", html);

  submitAnswer();
}

function renderOptions(option) {
  return `<button class="option">${option}</button>`;
}

function submitAnswer() {
  const options = document.querySelectorAll(".option");

  options.forEach((option) =>
    option.addEventListener("click", function () {
      answers = [...answers, option.textContent];
      setLocalStorage("answers", answers);

      currentIndex++;

      updateUI();
    })
  );
}

function calcScore() {
  answers.map((answer, i) => {
    answers[i] === correctAnswers[i] && score++;
  });

  setLocalStorage("score", score);
}

function renderResultsPage() {
  app.classList.add("hidden");
  questionBox.innerHTML = "";
  results.innerHTML = "";
  lastScoreBox.classList.add("hidden");

  resultsPage.classList.remove("hidden");

  calcScore();

  const html = `
      <div> Score: <span class="score">${score}  / ${quiz.length} </score></div>
      <ol class="questions_list">${quiz
        .map((question, i) => renderAnswers(question, i))
        .join("")}
      </ol>
      `;

  results.insertAdjacentHTML("afterbegin", html);
}

function renderAnswers(questionData, i) {
  const { question, correct_answer: correctAnswer } = questionData;
  const userAnswers = JSON.parse(localStorage.getItem("answers"));

  return `<li>
  <div class="question-box">
     <p class="question">${question}</p>
     <div class="answers">
      ${
        correctAnswer !== userAnswers[i]
          ? `<p class="answer answer--wrong">${userAnswers[i]} &#x2716;</p>`
          : ""
      }
     <p class="answer answer--correct">${correctAnswer} &#x2714;</p> </div>
  </div> 
</li>`;
}

// event listeners

again.addEventListener("click", function () {
  currentIndex = 0;
  quiz = [];
  questions = [];
  correctAnswers = [];
  answers = [];
  score = 0;
  app.classList.remove("hidden");

  init();
});
