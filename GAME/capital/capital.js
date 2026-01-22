import {startTimer, Shuffle, SolveOrNot} from  "/utils/gamestart.js"

const levelUpBtn = document.querySelectorAll(".up")[0];
const levelDownBtn = document.querySelectorAll(".down")[0];
const startBtn = document.querySelector('.start')

const timerUpBtn = document.querySelectorAll(".up")[1];
const timerDownBtn = document.querySelectorAll(".down")[1];

const level_N = document.querySelector("#levelN");
const timer_N = document.querySelector("#timer");

const countryNameDiv = document.querySelector(".country-name");
const flagDiv = document.querySelector('.flag')
const timerDiv = document.querySelector('.timer')

const inputForm = document.querySelector('form')
const inputDiv = document.querySelector('#answer')

const answerDiv = document.querySelector('.answer-sheet')
const mainDiv = document.querySelector('main')

const afterGameDiv = document.querySelector('.after-game')
const reloadBtn = document.querySelector('.retry');

var dataset = {};
var countrycode;
var questions; // 선택된 딕셔너리
var sortedQue; // 질문 덩어리
var quest; // 해당 턴의 질문
let score = 0;

levelDownBtn.addEventListener("click", () => {
  const level = parseInt(level_N.textContent);
  if (level == 1) {
    level_N.textContent = 6;
  } else {
    level_N.textContent = level - 1;
  }
});

levelUpBtn.addEventListener("click", () => {
  const level = parseInt(level_N.textContent);
  if (level == 6) {
    level_N.textContent = 1;
  } else {
    level_N.textContent = level + 1;
  }
});

timerDownBtn.addEventListener("click", () => {
  const time = parseInt(timer_N.textContent);

  if (time == 1) {
    timer_N.textContent = 10;
  } else {
    timer_N.textContent = time - 1;
  }
});

timerUpBtn.addEventListener("click", () => {
  const time = parseInt(timer_N.textContent);
  if (time == 10) {
    timer_N.textContent = 1;
  } else {
    timer_N.textContent = time + 1;
  }
});

reloadBtn.addEventListener('click', ()=> {
  flagDiv.textContent = '';
  timerDiv.textContent = '';
  countryNameDiv.textContent = '';
})

startBtn.addEventListener("click", () => {
  mainDiv.style.display = 'flex';  
  afterGameDiv.style.display ='none';
  questions = Prepare();
  sortedQue = Shuffle(Object.keys(questions))
  let ready = 5;
  flagDiv.textContent = ready;
  answerDiv.style.display = 'block';
  inputDiv.focus()
  const startTiemr = setInterval(() => {
    ready--;
    flagDiv.textContent = ready;
    if (ready == 0) {
      clearInterval(startTiemr);
      OnGame(sortedQue);
    }
  }, 1000);
});

fetchdata(
  "https://raw.githubusercontent.com/Hyung-Z/tvshowgame/refs/heads/main/llist/capitallists.json",
).then((response) => {
  dataset = response;
});

fetchdata("/countrycode.json").then((response) => {
  countrycode = response;
});

function Prepare() {
  const level = parseInt(level_N.textContent);
  const poolTitle = Object.keys(dataset)[level];
  const poolDict = dataset[poolTitle];
  return poolDict;
}

function OnGame(que) {
    quest = que.pop()
    countryNameDiv.textContent = quest;
    const code = countrycode[quest]
    flagDiv.innerHTML = `<img src="/asset/Flags/${code}.gif" alt="${quest} 국기"></img>`
    startTimer(timer_N.textContent, timerDiv, ()=>{GameFin(score)});
}

function GameFin(score) {
    countryNameDiv.innerHTML = `점수 : ${score}`
    if (score == 20) {
        flagDiv.innerHTML += '축하합니다.'
    }
    flagDiv.textContent = `${quest} : ${questions[quest]}`
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