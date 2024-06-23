"use strict";

import { shuffleArray } from "./helpers.js";

const question = document.querySelector(".question");
const questionBox = document.querySelector(".question-box");
// const options = document.querySelector(".options");
const option = document.querySelector(".option");
// const lastScore = document.querySelector(".last-score");
let currentQuestion;

const fetchQuestions = async function () {
  try {
    const res = await fetch(
      "https://opentdb.com/api.php?amount=10&type=multiple"
    );
    const data = await res.json();
    const questions = data.results;

    renderQuiz(questions);
  } catch (err) {
    console.error(err);
  }
};

fetchQuestions();

function renderQuiz(questions) {
  currentQuestion = questions[0];

  renderQuestion(currentQuestion);

  // questions.map((question) => renderQuestion(question));
}

function renderQuestion(questionData) {
  const {
    question,
    incorrect_answers: incorrectAnswers,
    correct_answer: correctAnswer,
  } = questionData;

  const answers = [...incorrectAnswers, correctAnswer];
  shuffleArray(answers);

  const html = `
      <h2 class="question">${question}</h2>
      <div class="options">${answers
        .map((answer) => renderOptions(answer))
        .join("")}</div>
   `;
  questionBox.insertAdjacentHTML("afterbegin", html);

  submitAnswer();
}

function renderOptions(answer) {
  return `<button class="option">${answer}</button>`;
}

function submitAnswer() {
  const options = document.querySelectorAll(".option");

  options.forEach((option) =>
    option.addEventListener("click", function () {
      console.log(option);
    })
  );
}

///////////// event handlers
