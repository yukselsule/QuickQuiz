"use strict";

import {
  shuffleArray,
  setLocalStorage,
  resetLocalStorage,
  getLocalStorage,
} from "./helpers.js";

const app = document.querySelector(".app");
const questionBox = document.querySelector(".question-box");
const results = document.querySelector(".results");
const resultsPage = document.querySelector(".results-page");
const again = document.querySelector(".again");
const lastScoreBox = document.querySelector(".last-score-box");
const lastScoreEl = document.getElementById("last-score");

let currentIndex = 0;
let quiz = [];
let questions = [];
let correctAnswers = [];
let answers = [];
let score = 0;

const fetchQuestions = async function () {
  renderSpinner();
  try {
    const res = await fetch(
      "https://opentdb.com/api.php?amount=10&type=multiple"
    );
    const data = await res.json();
    quiz = data.results;

    quiz.length > 0 ? renderQuiz(quiz) : renderSpinner();
  } catch (err) {
    console.error(err);
  }
};

function renderLastScore() {
  const lastScore = getLocalStorage("score");
  if (!lastScore) lastScoreBox.classList.add("hidden");
  if (lastScore) {
    lastScoreBox.classList.remove("hidden");
    lastScoreEl.innerText = lastScore * 10;
  }
}

function renderSpinner() {
  const spinner = `<div class="wrapper">
          <i class="spinner"></i>
        </div>`;
  questionBox.insertAdjacentHTML("afterbegin", spinner);
}

const init = function () {
  resetLocalStorage("answers");
  resetLocalStorage("questions");
  resultsPage.classList.add("hidden");

  renderLastScore();
  fetchQuestions();
};

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

function renderResultsPage() {
  app.classList.add("hidden");
  questionBox.innerHTML = "";
  results.innerHTML = "";
  lastScoreBox.classList.add("hidden");

  resultsPage.classList.remove("hidden");

  calcScore();

  const html = `
      <div> Score: <span class="score">${score * 10}  / 100 </score></div>
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
               <p class="question">${question} </p>
               ${
                 correctAnswer !== userAnswers[i]
                   ? ` <p class="answer answer--wrong">
                     ${userAnswers[i]} &#x2716;
                   </p>`
                   : ""
               }
                <p class="answer answer--correct"> ${correctAnswer} &#x2714; </p>
            </div> 
          </li> 
   `;
}

function calcScore(questionData) {
  answers.map((answer, i) => {
    answers[i] === correctAnswers[i] && score++;
  });

  setLocalStorage("score", score);
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
      <h2 class="question">${question}</h2>
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
