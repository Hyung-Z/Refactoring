const startBtn = document.querySelector(".start");
const reloadBtn = document.querySelector('.retry');
const descriptDiv = document.querySelector(".description");
const mainDiv = document.querySelector('main')

startBtn.addEventListener("click", () => {
  descriptDiv.style.display = "none";
});

reloadBtn.addEventListener('click', () => {
  descriptDiv.style.display = 'block';
  mainDiv.style.display = 'none';
})

let timerInterval;

export function startTimer(duration, displayElement, f) {
  let time = duration;
  clearInterval(timerInterval);

  displayElement.textContent = time;

  if (time < 0) {
    clearInterval(timerInterval);
    displayElement.textContent = "오답!";
    f();
    return;
  }

  timerInterval = setInterval(() => {
    time--; // 시간 감소
    displayElement.textContent = time; // 화면 업데이트

    if (time <= 0) {
      clearInterval(timerInterval); // 타이머 삭제
      displayElement.textContent = "시간초과!";
      f();
    }
  }, 1000);
}

export function SolveOrNot(userinput, answer) {
  const cleanInput = userinput.replace(/(\s*)/g, "").toLowerCase();
  const cleanAnswer = answer.replace(/(\s*)/g, "").toLowerCase();
  if (cleanInput === cleanAnswer) {
    return true;
  } else {
    return false;
  }
}

export function Shuffle(array) {
  // 1. 원본 배열을 복사합니다. (원본 보호)
  // 객체가 들어있는 배열이라도 얕은 복사([...array])로 순서를 섞는 건 충분합니다.
  const result = [...array];

  // 2. 뒤에서부터 앞으로 오면서 섞습니다.
  for (let i = result.length - 1; i > 0; i--) {
    // 3. 0부터 i 사이의 무작위 인덱스(j)를 뽑습니다.
    const j = Math.floor(Math.random() * (i + 1));

    // 4. 현재 위치(i)와 무작위 위치(j)의 값을 맞바꿉니다(Swap).
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

