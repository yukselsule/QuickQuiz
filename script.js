"use strict";

import {
  shuffleArray,
  setLocalStorage,
  resetLocalStorage,
  getLocalStorage,
} from "./helpers.js";

const question = document.querySelector(".question");
const questionBox = document.querySelector(".question-box");
const options = document.querySelectorAll(".option");
// const lastScore = document.querySelector(".last-score");

const results = document.querySelector(".results");
let currentIndex = 0;
let quiz = [];
let questions = [];
let correctAnswers = [];
let answers = [];
let score = 0;

const fetchQuestions = async function () {
  try {
    const res = await fetch(
      "https://opentdb.com/api.php?amount=10&type=multiple"
    );
    const data = await res.json();
    quiz = data.results;

    renderQuiz(quiz);
  } catch (err) {
    console.error(err);
  }
};

const init = function () {
  resetLocalStorage("answers");
  resetLocalStorage("questions");
  results.classList.add("hidden");
  fetchQuestions();
};

init();

function updateUI() {
  if (currentIndex <= quiz.length - 1) renderQuiz(quiz);

  if (currentIndex === quiz.length) renderResultsPage();
}

function renderQuiz(quiz) {
  renderQuestion(quiz[currentIndex]);
}

function renderResultsPage() {
  questionBox.innerHTML = "";
  results.classList.remove("hidden");

  calcScore();

  const html = `
      <div class="score"> ${score * 10} / 100 </div>
      <ol class="questions_list">${quiz
        .map((question, i) => renderAnswers(question, i))
        .join("")}
      
      </ol>
      <button>Try Again</button>`;

  results.insertAdjacentHTML("afterbegin", html);
}

function renderAnswers(questionData, i) {
  const { question, correct_answer: correctAnswer } = questionData;
  const userAnswers = JSON.parse(localStorage.getItem("answers"));

  return `<li>
            <div class="question-box">
               <p class="question">${question} </p>
               <p class="answer"> ${
                 correctAnswer !== userAnswers[i]
                   ? `${userAnswers[i]} &#x2716;`
                   : ""
               }  ${correctAnswer} &#x2714; </p>
            </div> 
          </li> 
   `;
}

function calcScore(questionData) {
  answers.map((answer, i) => {
    answers[i] === correctAnswers[i] && score++;
  });
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
