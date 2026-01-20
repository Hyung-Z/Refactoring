const GAP = 20;
const track = document.querySelector(".track");
const slides = document.querySelectorAll(".slide"); // 원본 슬라이드들
const slideCount = slides.length; // 원본 개수 (예: 5개)
const nextBtn = document.querySelector('.next')
const prevBtn = document.querySelector('.prev')

// 1. 클론 생성 (원본 개수만큼 뒤에 붙임, 반쪽은 앞에다가 넣기)
for (let i = 0; i < slideCount; i++) {
    const clone = slides[i].cloneNode(true);
    const clone2 = slides[i].cloneNode(true);
    clone.classList.add('clone');
    clone2.classList.add('clone');
    track.appendChild(clone);
    track.insertBefore(clone2, slides[0]);
}

let currentIndex = slideCount;

// slideWidth는 여러 곳에서 쓰이니 밖에서 계산 (반응형 대응 시 함수로 변경 필요)
// clientWidth나 offsetWidth 사용
let slideWidth = slides[0].offsetWidth + GAP; 
window.addEventListener('resize',() => {slideWidth = slides[0].offsetWidth + GAP; currentIndex = 0; moveSlide(currentIndex)})

moveSlide(currentIndex)

function moveSlide(index) {
    track.style.transition = 'transform 0.5s ease-in-out'; // 애니메이션 켜기
    currentIndex = index;
    const amount = -1 * currentIndex * slideWidth;
    track.style.transform = `translateX(${amount}px)`;
}

// 2. 트랜지션이 끝났을 때 '눈속임' 처리
track.addEventListener('transitionend', () => {
    if (currentIndex >= slideCount*2 || currentIndex <= 0) {
        track.style.transition = 'none'; // 애니메이션 끄기 (순간이동 준비)
        currentIndex = slideCount; 
        
        const amount = -1 * currentIndex * slideWidth;
        track.style.transform = `translateX(${amount}px)`; // 위치 강제 이동
    }
});

nextBtn.addEventListener('click', () => {
    currentIndex++;
    moveSlide(currentIndex)
})

prevBtn.addEventListener('click', () => {
    currentIndex--;
    moveSlide(currentIndex)
})

// setInterval(() => {
//     currentIndex++;
//     moveSlide(currentIndex)
// }, 2000);

