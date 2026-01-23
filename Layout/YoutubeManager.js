export class YouTubeManager {
    // 1. 초기화 시 '에러 발생하면 실행할 콜백 함수'를 받습니다.
    constructor(options = {}) {
        this.player = null;
        this.isReady = false;
        this.timer = null;
        
        // 에러 시 실행할 외부 함수 (예: nextQuestion)
        this.onLoadError = options.onLoadError || (() => {}); 

        this.loadAPI();
    }

    loadAPI() {
        if (window.YT) {
            this.createPlayer();
            return;
        }
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            this.createPlayer();
        };
    }

    createPlayer() {
        this.player = new YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'rel': 0,
                // 중요: 에러 발생 시 다른 추천 영상 안 뜨게
                'origin': window.location.origin 
            },
            events: {
                'onReady': () => {
                    this.isReady = true;
                    console.log("유튜브 플레이어 준비 완료!");
                },
                // ★ 2. 에러 감지 리스너 등록
                'onError': (event) => this.handleError(event)
            }
        });
    }

    // ★ 3. 에러 핸들러
    handleError(event) {
        /*
         에러 코드 설명:
         2   : 잘못된 매개변수
         5   : HTML5 플레이어 에러
         100 : 영상이 없거나 비공개됨
         101 : 퍼가기 금지 (저작권 등) - 가장 흔함
         150 : 101과 같음
        */
        const errorCode = event.data;
        console.warn(`유튜브 에러 발생 (코드: ${errorCode}) - 스킵합니다.`);

        // 타이머 취소 (재생 중단 예정이었던 것)
        if (this.timer) clearTimeout(this.timer);

        // 메인 로직에게 "이 문제 스킵해!"라고 알림
        this.onLoadError(errorCode);
    }

    playSegment(videoId, startTime, durationTime) {
        if (!this.player || !this.isReady) return;

        if (this.timer) clearTimeout(this.timer);

        // 영상 로드 시도
        this.player.loadVideoById({
            'videoId': videoId,
            'startSeconds': startTime,
            'endSeconds' : startTime+durationTime
        });
        
        this.toggleCurtain(true); // 커튼 닫기

        // durationTime 뒤에 멈춤
        this.timer = setTimeout(() => {
            this.stopVideo();
        }, durationTime * 1000);
    }

    stopVideo() {
        if (this.player && this.player.pauseVideo) {
            this.player.pauseVideo();
        }
    }

    toggleCurtain(isClosed) {
        const curtain = document.getElementById('video-curtain');
        if (curtain) {
            isClosed ? curtain.classList.remove('hidden') : curtain.classList.add('hidden');
        }
    }
}