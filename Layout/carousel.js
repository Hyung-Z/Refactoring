export class InfiniteCarousel {
    constructor(selector, options = {}) {
        // 1. 내 구역(컨테이너) 찾기
        this.container = document.querySelector(selector);
        
        // 2. 내 구역 안에서만 요소들 찾기 (document X -> this.container O)
        this.track = this.container.querySelector(".track");
        this.originalSlides = this.container.querySelectorAll(".slide");
        this.nextBtn = this.container.querySelector('.next');
        this.prevBtn = this.container.querySelector('.prev');

        // 3. 설정값 및 상태 저장 (this에 저장해야 공유 안 됨)
        this.gap = options.gap || 20; // 갭 설정 (없으면 기본 20)
        this.slideCount = this.originalSlides.length;
        this.currentIndex = this.slideCount; // 앞쪽에 복사본만큼 밀려있으므로 시작점은 count와 같음
        
        // 4. 실행 순서
        this.cloneSlides();      // 복제하기
        this.updateWidth();      // 너비 계산
        this.setInitialPos();    // 초기 위치 잡기
        this.addEvents();        // 이벤트 연결
    }

    cloneSlides() {
        // 기존 로직 그대로 사용
        for (let i = 0; i < this.slideCount; i++) {
            const clone = this.originalSlides[i].cloneNode(true);
            const clone2 = this.originalSlides[i].cloneNode(true);
            clone.classList.add('clone');
            clone2.classList.add('clone');
            
            this.track.appendChild(clone); // 뒤에 붙이기
            // this.originalSlides[0] 앞에 붙여야 순서가 맞음
            this.track.insertBefore(clone2, this.originalSlides[0]); 
        }
        // 복제 후 전체 슬라이드 다시 잡기 (transitionend 체크용)
        this.allSlides = this.track.querySelectorAll('.slide'); 
    }

    updateWidth() {
        // 원본의 첫 번째 요소 기준으로 너비 계산
        this.slideWidth = this.originalSlides[0].offsetWidth + this.gap;
    }

    setInitialPos() {
        // 초기 위치로 순간이동 (애니메이션 없이)
        this.track.style.transition = 'none';
        this.track.style.transform = `translateX(${-1 * this.currentIndex * this.slideWidth}px)`;
    }

    moveSlide(index) {
        // 애니메이션 켜고 이동
        this.track.style.transition = 'transform 0.5s ease-in-out';
        this.currentIndex = index;
        const amount = -1 * this.currentIndex * this.slideWidth;
        this.track.style.transform = `translateX(${amount}px)`;
    }

    addEvents() {
        // 1. Next 버튼
        this.nextBtn.addEventListener('click', () => {
            this.moveSlide(this.currentIndex + 1);
        });

        // 2. Prev 버튼
        this.prevBtn.addEventListener('click', () => {
            this.moveSlide(this.currentIndex - 1);
        });

        // 3. 트랜지션 끝났을 때 (무한 루프 눈속임)
        this.track.addEventListener('transitionend', () => {
            // 맨 뒤 복사본 구간에 도달했으면
            if (this.currentIndex >= this.slideCount * 2) {
                this.track.style.transition = 'none'; // 애니메이션 끄기
                this.currentIndex = this.slideCount;  // 원본 위치로 리셋
                this.moveSlideNone(this.currentIndex);
            }
            // 맨 앞 복사본 구간에 도달했으면
            if (this.currentIndex <= 0) {
                this.track.style.transition = 'none';
                this.currentIndex = this.slideCount;
                this.moveSlideNone(this.currentIndex);
            }
        });

        // 4. 반응형 (Resize)
        window.addEventListener('resize', () => {
            this.updateWidth();
            // 리사이즈 시 위치가 틀어지지 않게 현재 인덱스로 다시 정렬
            this.moveSlideNone(this.currentIndex);
        });
    }

    // 애니메이션 없이 이동하는 내부 함수 (코드 중복 제거)
    moveSlideNone(index) {
        const amount = -1 * index * this.slideWidth;
        this.track.style.transform = `translateX(${amount}px)`;
    }
}