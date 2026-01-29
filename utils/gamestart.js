const startBtn = document.querySelector(".start");
const reloadBtn = document.querySelector(".retry");
const descriptDiv = document.querySelector(".description");
const mainDiv = document.querySelector("main");

const sounds = {
  'correct' : new Audio("/asset/sounds/yes.mp3"),
  'wrong' : new Audio("/asset/sounds/no.mp3"),
  'countdown' : new Audio('/asset/sounds/tiktok2.mp3')
}

startBtn.addEventListener("click", () => {
  descriptDiv.style.display = "none";
});

reloadBtn.addEventListener("click", () => {
  descriptDiv.style.display = "block";
  mainDiv.style.display = "none";
});

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
    playSFX('correct')
    triggerVisualFeedback(true)
    return true;
  } else {
    playSFX('wrong')
    triggerVisualFeedback(false)
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

export function CutLyrics(fullLyrics) {
  if (!fullLyrics) return "K-pop song illustration"; // 가사가 없을 경우 기본값

  // 1. 줄바꿈(\n) 기준으로 가사를 배열로 나눕니다.
  const lines = fullLyrics
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 5);
  // (길이가 너무 짧은 'Yeah', 'Oh' 같은 추임새는 제외하기 위해 길이 5 이상만 필터링)

  if (lines.length === 0) return fullLyrics.slice(0, 50); // 필터링 후 남은게 없으면 앞에서 자름

  // 2. 랜덤한 시작 위치를 잡습니다. (전체 라인 수 - 뽑을 라인 수 범위 내에서)
  const lineCountToPick = 2; // 2줄 정도 뽑기 (너무 길면 AI가 헷갈려함)

  // 가사가 짧으면 처음부터, 길면 중간 랜덤 위치에서
  const maxStartIndex = Math.max(0, lines.length - lineCountToPick);
  const randomIndex = Math.floor(Math.random() * maxStartIndex);

  // ✨ [수정 1] 재할당을 위해 const 대신 let 사용
  let segment = lines
    .slice(randomIndex, randomIndex + lineCountToPick)
    .join(", ");

  // 현재 마지막으로 사용한 줄의 다음 인덱스
  let currentEndIndex = randomIndex + lineCountToPick;

  // ✨ [수정 2] 길이가 50자가 안 되고, 아직 뒤에 남은 줄이 있다면 계속 붙이기
  while (segment.length < 50 && currentEndIndex < lines.length) {
    // 다음 줄 가져오기
    const nextLine = lines[currentEndIndex];

    // 기존 가사에 이어 붙이기
    segment += ", " + nextLine;

    // 인덱스 증가 (다음 줄로 이동)
    currentEndIndex++;
  }
  console.log(segment);
  return segment;
}


function playSFX(name) {
  const sound = sounds[name]
  if (sound) {
      // cloneNode()로 복제본을 만들어서 재생 -> 겹침 가능
      const clone = sound.cloneNode();
      clone.volume = 0.8; // 효과음 볼륨
      
      // Promise 예외 처리
      clone.play().catch(e => console.log("소리 재생 실패:", e));
  }
}


function triggerVisualFeedback(isCorrect) {
    const inputField = document.querySelector('.answer-container'); // 입력창 ID
    
    // 1. 기존 클래스 제거 (혹시 남아있을 수 있으니)
    inputField.classList.remove('correct', 'wrong');

    // 2. 상태에 따라 클래스 추가
    if (isCorrect) {
        inputField.classList.add('correct');
    } else {
        // 오답일 때는 애니메이션 재실행을 위해 '약간의 트릭'이 필요할 수 있음
        // (void offsetWidth를 호출하면 리플로우가 발생해 애니메이션 리셋됨)
        void inputField.offsetWidth; 
        inputField.classList.add('wrong');
    }

    // 3. 1.5초 뒤에 원상복구 (다음 문제를 위해)
    // 정답일 땐 다음 문제로 넘어가면서 자연스럽게 풀리게 둬도 되지만,
    // 오답일 땐 다시 입력해야 하므로 빨리 풀어주는 게 좋음
    const delay = isCorrect ? 2000 : 1000; 

    setTimeout(() => {
        inputField.classList.remove('correct', 'wrong');
        
        // (선택) 오답이면 입력창 비워주기
        if (!isCorrect) {
            inputField.value = ''; 
            inputField.focus();
        }
    }, delay);
}