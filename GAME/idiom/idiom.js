import {startTimer, Shuffle, SolveOrNot} from  "/utils/gamestart.js"


const startBtn = document.querySelector('.start')

const timerUpBtn = document.querySelector(".up");
const timerDownBtn = document.querySelector(".down");

const timer_N = document.querySelector("#timer");

const meanDiv = document.querySelector('.mean')
const timerDiv = document.querySelector('.timer')

const inputForm = document.querySelector('form')
const inputDiv = document.querySelector('#answer')

const answerDiv = document.querySelector('.answer-sheet')
const mainDiv = document.querySelector('main')

const afterGameDiv = document.querySelector('.after-game')

var dataset = {};
var questions; // 선택된 딕셔너리
var sortedQue; // 질문 덩어리
var quest; // 해당 턴의 질문
let score = 0;


timerDownBtn.addEventListener("click", () => {
  const time = parseInt(timer_N.textContent);

  if (time == 1) {
    timer_N.textContent = 30;
  } else {
    timer_N.textContent = time - 1;
  }
});

timerUpBtn.addEventListener("click", () => {
  const time = parseInt(timer_N.textContent);
  if (time == 30) {
    timer_N.textContent = 1;
  } else {
    timer_N.textContent = time + 1;
  }
});

function Reset() {
  mainDiv.style.display = 'flex';  
  afterGameDiv.style.display ='none';
  timerDiv.textContent = '';
}

startBtn.addEventListener("click", () => {
  Reset();
  inputDiv.focus()
  questions = dataset
  sortedQue = Shuffle(Object.keys(questions))
  let ready = 3;
  meanDiv.textContent = ready;
  const startTiemr = setInterval(() => {
    ready--;
    meanDiv.textContent = ready;
    if (ready == 0) {
      clearInterval(startTiemr);
      answerDiv.style.display = 'block';
      OnGame(sortedQue);
    }
  }, 1000);
});

fetchdata(
  "https://raw.githubusercontent.com/Hyung-Z/tvshowgame/refs/heads/main/llist/idiomlist.json",
).then((response) => {
  for (let key in response) {
    dataset[response[key]] = key
  }
});


function OnGame(que) {
    quest = que.pop()
    meanDiv.textContent = quest;
    startTimer(timer_N.textContent, timerDiv, ()=>{GameFin(score)});
}

function GameFin(score) {
    meanDiv.innerHTML = `점수 : ${score}`
    if (score == 20) {
        meanDiv.innerHTML += '</br>축하합니다.'
    }
    meanDiv.innerHTML += `</br>정답 : ${questions[quest]}`
    answerDiv.style.display = 'none';
    afterGameDiv.style.display = 'flex';
}

inputForm.addEventListener('submit', (e)=> {
    e.preventDefault()
    const userInput = inputDiv.value;
    inputDiv.value = '';
    if (SolveOrNot(userInput, questions[quest])) {
        score++;
        if (sortedQue.length == 0) {
            GameFin(score)
        }
        else {
            OnGame(sortedQue)
        }
    }
    else {
        startTimer(-5, timerDiv, ()=>{GameFin(score)})
    }
    inputDiv.focus()
})