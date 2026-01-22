import { startTimer, Shuffle, SolveOrNot } from "/utils/gamestart.js";
import { InfiniteCarousel } from "/Layout/carousel.js";

const carousel_1 = new InfiniteCarousel("#type-sector", { gap: 10 });

const timerUpBtn = document.querySelectorAll(".up")[0];
const timerDownBtn = document.querySelectorAll(".down")[0];
const startBtn = document.querySelector(".start");

const timer_N = document.querySelector("#timer");

const potraitDiv = document.querySelector(".potrait");
const timerDiv = document.querySelector(".timer");

const inputForm = document.querySelector("form");
const inputDiv = document.querySelector("#answer");

const answerDiv = document.querySelector(".answer-sheet");
const mainDiv = document.querySelector("main");

const rangeContainer = document.querySelector('.range-container')
const topicDiv = document.querySelector("#type-sector");
const levelDiv = document.querySelector("#type-level");

const afterGameDiv = document.querySelector(".after-game");
const reBtn = document.querySelector('.retry')


var dataset = {};
var countrycode;
var questions; // 선택된 딕셔너리
var sortedQue; // 질문 덩어리
var quest; // 해당 턴의 질문
let score = 0;
const selectedTopics = new Set();
const selectedLevel = new Set();

startBtn.addEventListener("click", () => {
  mainDiv.style.display = "flex";
  afterGameDiv.style.display = "none";
  inputDiv.focus();
  let ready = 5;
  potraitDiv.textContent = ready;
  const startTiemr = setInterval(() => {
    ready--;
    potraitDiv.textContent = ready;
    if (ready == 0) {
      clearInterval(startTiemr);
      answerDiv.style.display = "block";
      OnGame(sortedQue);
    }
  }, 1000);
  rangeContainer.style.display = 'none';
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

topicDiv.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() == "li") {
    e.target.classList.toggle("selected");
    const topic = e.target.textContent;

    if (selectedTopics.has(topic)) {
      selectedTopics.delete(topic);
    } else selectedTopics.add(topic);

    const divs = e.target.parentElement.querySelectorAll(".slide");
    for (let div of divs) {
      if (div.textContent == topic && div != e.target) {
        div.classList.toggle("selected");
      }
    }
    if (topic == "All") {
      const A = e.target.classList.contains("selected");
      for (let div of divs) {
        if (div.textContent != topic && A) {
          div.classList.add("selected");
          selectedTopics.add(div.textContent);
        } else if (div.textContent != topic && !A) {
          div.classList.remove("selected");
          selectedTopics.delete(div.textContent);
        }
      }
    } else {
      for (let div of divs) {
        if (div.textContent == "All") {
          div.classList.remove("selected");
          selectedTopics.delete(div.textContent);
        }
      }
    }
  }
  CheckStartCondition();
});

levelDiv.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() == "li") {
    e.target.classList.toggle("selected");
    const level = e.target.textContent;
    if (selectedLevel.has(level)) {
      selectedLevel.delete(level);
    } else selectedLevel.add(level);
  }
  CheckStartCondition();
});

reBtn.addEventListener('click', ()=> {
  rangeContainer.style.display = 'block';
  timerDiv.textContent = '';
  answerDiv.style.display = 'block'
})


fetchdata(
  "https://raw.githubusercontent.com/Hyung-Z/tvshowgame/refs/heads/main/llist/indivlist.json",
).then((response) => {
  dataset = response;
  questions = dataset['all']
});

function Prepare() {
  let topicSector = []
  let levelSector = []
  selectedTopics.delete('All')
  for (let topic of selectedTopics) {
    let a = Object.keys(dataset['topic'][switchToEng(topic)]);
    topicSector = [...topicSector, ...a]
  }
  for (let level of selectedLevel) {
    let a = Object.keys(dataset['level'][switchToEng(level)]);
    levelSector = [...levelSector, ...a]
  }
  sortedQue = Shuffle(topicSector.filter(item => levelSector.includes(item)));
  return sortedQue.length
}

function switchToEng(kr) {
  switch (kr) {
    case "All":
      return "all";
    case "남자 아이돌":
      return "idolMale";
    case "여자 아이돌":
      return "idol";
    case "가수":
      return 'singer';
    case "배우":
      return 'actor';
    case "스포츠":
      return 'sport';
    case "기타":
      return 'influencerAndCharacter';
    case '코메디언':
      return 'comedian';
    case '쉬움' :
      return 'level1';
    case '중간' :
      return 'level2';
    case '어려움' :
      return 'level3';
    default :
      console.log('?')
      return;
  }
}

function OnGame(que) {
  quest = que.pop();
  potraitDiv.innerHTML = `<img src="https://raw.githubusercontent.com/Hyung-Z/tvshowgame/refs/heads/main/llist/imgs/photo/${quest}.jpg" alt="${quest}"></img>`;
  startTimer(100, timerDiv, () => {
    GameFin(score);
  });
}

function GameFin(score) {
  potraitDiv.innerHTML = `점수 : ${score}`;
  if (score == 20) {
    potraitDiv.innerHTML += "</br>축하합니다.";
  }
  potraitDiv.innerHTML += `</br>${quest}`;
  answerDiv.style.display = "none";
  afterGameDiv.style.display = "flex";
}

function CheckStartCondition() {
  if (selectedLevel.size == 0 || selectedTopics.size == 0) {
    startBtn.style.display = "none";
  } else {
    startBtn.style.display = "inline-block";
    const ques = Prepare();
    startBtn.textContent = `START (${ques})`
  }
}

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const userInput = inputDiv.value;
  inputDiv.value = "";
  let judge = false;
  for (let answer of [...questions[quest], quest]) {
    console.log(answer)
    if (SolveOrNot(userInput, answer)) {      
      score++;
      judge = true;
      break;      
    }
  }
  console.log(judge)
  if (judge) {
    if (sortedQue.length == 0) {
      GameFin(score)
    } else {
      OnGame(sortedQue)
    }
  }
  else {
    startTimer(-5, timerDiv, () => {
      GameFin(score);
    });
  }
  inputDiv.focus();
});
