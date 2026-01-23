import { startTimer, Shuffle, SolveOrNot } from "/utils/gamestart.js";
import { CustomPlaylist } from "/Layout/custom.js";
import { SearchModal } from "/Layout/searchModal.js";
import { YearSelector } from "/Layout/yearSelector.js";
import { ArtistSelector } from "/Layout/ArtistSelector.js";
import { YouTubeManager } from "/Layout/YoutubeManager.js";

const startUpBtn = document.querySelectorAll(".up")[0];
const startDownBtn = document.querySelectorAll(".down")[0];
const durationUpBtn = document.querySelectorAll(".up")[1];
const durationDownBtn = document.querySelectorAll(".down")[1];

const startBtn = document.querySelector(".start");

const start_N = document.querySelector("#start");
const duration_N = document.querySelector("#duration");

const descriptionDiv = document.querySelector(".description");
const videoWrapperDiv = document.querySelector(".video-wrapper");
const timerDiv = document.querySelector(".timer");

const inputForm = document.querySelector("form");
const inputDiv = document.querySelector("#answer");

const answerDiv = document.querySelector(".answer-sheet");
const mainDiv = document.querySelector("main");

const rangeContainer = document.querySelector(".range-container");
let chartData;
const gamemodeDiv = document.querySelector(".modes > ul");

const afterGameDiv = document.querySelector(".after-game");
const reBtn = document.querySelector(".retry");

const excuseDiv = document.querySelector(".excuse");
let skip = 0;

const myPlaylist = new CustomPlaylist(".custom", {
  dataset: [],
  onStart: (songs) => {
    Prepare(songs);
    OnGame(sortedQue);
  },
});

const yearSelector = new YearSelector(".year-select-section", {
  dataset: [],
  onStart: (songs) => {
    Prepare(songs);
    OnGame(sortedQue);
  },
});

const artistSelector = new ArtistSelector(".artist-select-section", {
  dataset: [], // 초기엔 빈 값
  onStart: (songs) => {
    Prepare(songs);
    OnGame(sortedQue);
  },
});

const searchModal = new SearchModal(".playlist.right .playlist-header", {
  // ★ 핵심: 모달에서 검색 버튼을 누르면 실행될 함수
  onSearch: (criteria) => {
    console.log("검색 조건:", criteria);
    myPlaylist.search(criteria); // 플레이리스트에 검색 명령 전달!
  },
});

const ytManager = new YouTubeManager({
  onLoadError: (errorCode) => {
    skip = skip + 1;
    excuseDiv.textContent = `저작권 문제로 ${skip} 곡이 넘어갔습니다.`;
    console.log("재생 불가 영상입니다. 다음 문제로 넘어갑니다.");
    OnGame(sortedQue);
  },
});

const searchTrigger = document.querySelector(".right .title"); // "상세검색" 텍스트

searchTrigger.addEventListener("click", () => {
  searchModal.toggle();
});

var dataset;
var questions; // 선택된 딕셔너리
var sortedQue; // 질문 덩어리
var quest; // 해당 턴의 질문
let score = 0;

const chartStartBtn = document.querySelector("#chart");



startBtn.addEventListener("click", () => {
  mainDiv.style.display = "flex";
  afterGameDiv.style.display = "none";
  inputDiv.focus();
  let ready = 5;
  videoWrapperDiv.textContent = ready;
  const startTiemr = setInterval(() => {
    ready--;
    videoWrapperDiv.textContent = ready;
    if (ready == 0) {
      clearInterval(startTiemr);
      answerDiv.style.display = "block";
      OnGame(sortedQue);
    }
  }, 1000);
  rangeContainer.style.display = "none";
});

startDownBtn.addEventListener("click", () => {
  const start = parseInt(start_N.textContent);

  if (start == 0) {
    start_N.textContent = 60;
  } else {
    start_N.textContent = start - 1;
  }
});

startUpBtn.addEventListener("click", () => {
  const start = parseInt(start_N.textContent);
  if (start == 10) {
    start_N.textContent = 1;
  } else {
    start_N.textContent = start + 1;
  }
});

durationDownBtn.addEventListener("click", () => {
  const duration = parseInt(duration_N.textContent);
  if (duration == 1) {
    duration_N.textContent = 10;
  } else {
    duration_N.textContent = duration - 1;
  }
});

durationUpBtn.addEventListener("click", () => {
  const duration = parseInt(duration_N.textContent);
  if (duration == 10) {
    duration_N.textContent = 1;
  } else {
    duration_N.textContent = duration + 1;
  }
});

reBtn.addEventListener("click", () => {
  rangeContainer.style.display = "block";
  timerDiv.textContent = "";
  answerDiv.style.display = "block";
});

for (let mode of gamemodeDiv.childNodes) {
  mode.addEventListener("click", () => {
    const custom = document.querySelector(".custom");
    const year = document.querySelector(".year-select-section");
    const artist = document.querySelector(".artist-select-section");
    switch (mode.id) {
      case "custom":
        custom.style.display = "flex";
        year.style.display = "none";
        artist.style.display = "none";
        return;
      case "years":
        custom.style.display = "none";
        year.style.display = "block";
        artist.style.display = "none";
        startBtn.style.display = "none";
        return;
      case "singers":
        custom.style.display = "none";
        year.style.display = "none";
        artist.style.display = "block";
        startBtn.style.display = "none";

        return;
    }
  });
}

fetchdata(
  "https://raw.githubusercontent.com/Hyung-Z/tvshowgame/refs/heads/main/data.json",
).then((response) => {
  const jsonData = response;
  const dataList = Object.values(jsonData);
  const formattedData = dataList.map((item, index) => ({
    id: index,
    title: item[1],
    artist: item[2],
    date: item[4],
    lyrics: item[3],
    youtubeUrl: item[0],
  }));
  dataset = formattedData;
  myPlaylist.setDataSet(formattedData);
  yearSelector.setDataSet(formattedData);
  artistSelector.setDataSet(formattedData);
}).then(
  
)

fetchdata(
  "https://raw.githubusercontent.com/Hyung-Z/tvshowgame/refs/heads/main/chart_live.json",
).then((response) => {
  chartData = response;
});

chartStartBtn.addEventListener("click", () => {
  const songs = dataset.filter((song) => {
    return chartData.includes(song.title[0]);
  });
  console.log(songs.length)
  Prepare(songs);
  OnGame(sortedQue);
});

function Prepare(songs) {
  sortedQue = Shuffle(songs);
  mainDiv.style.display = "flex";
  rangeContainer.style.display = "none";
  descriptionDiv.style.display = "none";
  document.querySelector(".start-option").value = parseInt(start_N.textContent);
  document.querySelector(".duration-option").value = parseInt(
    duration_N.textContent,
  );
}

function OnGame(que) {
  if (que.length == 0) {
    GameFin(score);
    return;
  }
  document.querySelector(".curtain-text").classList.remove("stop");
  const option_start = document.querySelector(".start-option");
  const option_duration = document.querySelector(".duration-option");

  const start_time = parseInt(option_start.value);
  const duration_time = parseInt(option_duration.value);

  console.log(que.length);
  quest = que.pop();
  console.log(quest.youtubeUrl, start_time, duration_time);
  ytManager.playSegment(quest.youtubeUrl, start_time, duration_time);

  // videoWrapperDiv.innerHTML
  // 음악 시작하는 로직
}

function GameFin(score) {
  videoWrapperDiv.innerHTML = `점수 : ${score}`;
  videoWrapperDiv.classList.toggle("fin");
  if (sortedQue.length == 0) {
    videoWrapperDiv.innerHTML += "</br>축하합니다.";
  } else {
    videoWrapperDiv.innerHTML += `</br>${quest.title[0]}-${quest.artist}`;
  }
  answerDiv.style.display = "none";
  afterGameDiv.style.display = "flex";
}

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const userInput = inputDiv.value;
  inputDiv.value = "";
  let judge = false;
  for (let answer of quest.title) {
    console.log(answer);
    if (SolveOrNot(userInput, answer)) {
      score++;
      judge = true;
      break;
    }
  }

  console.log(judge);
  if (judge) {
    if (sortedQue.length == 0) {
      GameFin(score);
    } else {
      OnGame(sortedQue);
    }
  } else {
    startTimer(-5, timerDiv, () => {
      GameFin(score);
    });
  }
  inputDiv.focus();
});
