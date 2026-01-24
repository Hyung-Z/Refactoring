import { CutLyrics, Shuffle, SolveOrNot } from "/utils/gamestart.js";
import { CustomPlaylist } from "/Layout/custom.js";
import { SearchModal } from "/Layout/searchModal.js";
import { YearSelector } from "/Layout/yearSelector.js";
import { ArtistSelector } from "/Layout/ArtistSelector.js";
import { YouTubeManager } from "/Layout/YoutubeManager.js";

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

const curtainText = document.querySelector('.curtain-text')
const endingDiv = document.querySelector('.ending')

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
    excuseDiv.textContent = `저작권 문제로 재생이 불가합니다.`;
  },
});

const searchTrigger = document.querySelector(".right .title"); // "상세검색" 텍스트

searchTrigger.addEventListener("click", () => {
  searchModal.toggle();
});

var dataset;
var sortedQue; // 질문 덩어리
var quest; // 해당 턴의 질문
let score = 0;

const chartStartBtn = document.querySelector("#chart");



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
})

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
  videoWrapperDiv.style.visibility = 'visible';
  afterGameDiv.style.display = 'none';
  skip = 0;
  excuseDiv.textContent = '';
}

const ingameBtn = document.querySelector('.ingame-btn')
const resultBtn = document.querySelector('.result-btn')

function OnGame(que) {
  endingDiv.style.display = 'none';
  inputForm.style.display = 'block';
  ingameBtn.style.display = 'inline-block'
  resultBtn.style.display = 'none'
  timerDiv.textContent = '';
  if (que.length == 0) {
    GameFin(score);
    return;
  }
  quest = que.pop();
  const randomLyrics = CutLyrics(quest.lyrics)
  curtainText.textContent = randomLyrics
  console.log(randomLyrics)
}

function GameFin(score) {
  endingDiv.style.display = 'inline-block'
  endingDiv.textContent = `점수 : ${score}`;
  videoWrapperDiv.style.visibility = 'hidden';
  ytManager.toggleCurtain(false)
  answerDiv.style.display = "none";
  afterGameDiv.style.display = "flex";
  excuseDiv.textContent = `저작권 문제로 총 ${skip} 곡이 넘어갔습니다.`;
}

inputForm.addEventListener("submit", (e) => {
  ingameBtn.style.display = 'none'
  resultBtn.style.display = 'inline-block'
  inputForm.style.display = 'none';
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
    } 
  } 
  console.log(quest)
  ytManager.openLyricsAnswer(quest.youtubeUrl)
  excuseDiv.textContent = ''
  timerDiv.textContent = `${quest.title[0]} - ${quest.artist}`
  inputDiv.focus();
});


const revealBtn = document.getElementById('reveal')
const nextBtn = document.getElementById('next')


revealBtn.addEventListener('click', (e)=> {
  e.preventDefault();
  ingameBtn.style.display = 'none'
  resultBtn.style.display = 'inline-block'
  inputForm.style.display = 'none';
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
    } 
  } 
  console.log(quest)
  ytManager.openLyricsAnswer(quest.youtubeUrl)
  excuseDiv.textContent = ''
  timerDiv.textContent = `${quest.title[0]} - ${quest.artist}`
  inputDiv.focus();
})


nextBtn.addEventListener('click', ()=> {
  ytManager.stopVideo()
  ytManager.toggleCurtain(true);
  excuseDiv.textContent = '';
  OnGame(sortedQue)
})