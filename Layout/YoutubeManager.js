export class YouTubeManager {

  constructor(options = {}) {
    this.player = null;
    this.isReady = false;
    this.timer = null;
    this.playDuration = 180; // 재생해야 할 시간(초) 저장용
    this.bufferTimeout = null; // 무한 로딩 방지용 안전장치

    // 에러 시 실행할 외부 함수 (예: nextQuestion)
    this.onLoadError = options.onLoadError || (() => {});

    this.loadAPI();
  }

  loadAPI() {
    if (window.YT) {
      this.createPlayer();
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      this.createPlayer();
    };
  }

  createPlayer() {
    this.player = new YT.Player("youtube-player", {
      height: "100%",
      width: "100%",
      playerVars: {
        playsinline: 1,
        controls: 1,
        disablekb: 0,
        fs: 1,
        rel: 0,
        // 중요: 에러 발생 시 다른 추천 영상 안 뜨게
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          this.isReady = true;
          event.target.setPlaybackQuality('small')
        },
        // ★ 2. 에러 감지 리스너 등록
        onError: (event) => this.handleError(event),
        onStateChange: (e) => this.onPlayerStateChange(e),
      },
    });
  }

  handleError(event) {
    /*
         에러 코드 설명:
         2   : 잘못된 매개변수
         5   : HTML5 플레이어 에러
         100 : 영상이 없거나 비공개됨
         101 : 퍼가기 금지 (저작권 등)
         150 : 101과 같음
        */
    const errorCode = event.data;
    console.warn(`유튜브 에러 발생 (코드: ${errorCode}) - 스킵합니다.`);
    if (errorCode == 5 ) {
        return
    }

    // 타이머 취소 (재생 중단 예정이었던 것)
    if (this.timer) clearTimeout(this.timer);

    // 메인 로직에게 "이 문제 스킵해!"라고 알림
    this.onLoadError(errorCode);
  }

  playSegment(videoId, startTime, durationTime) {
    if (!this.player || !this.isReady) return;

    // 이전 타이머들 초기화
    this.clearTimers();

    // 목표 재생 시간 저장 (나중에 쓰려고)
    this.playDuration = durationTime;

    // 영상 로드 및 재생 시작
    this.player.loadVideoById({
      videoId: videoId,
      startSeconds: startTime,
    });

    this.toggleCurtain(true);

    // ★ [안전장치] 만약 15초 동안이나 로딩만 하고 있으면 그때 스킵 (무한 로딩 방지)
    this.bufferTimeout = setTimeout(() => {
      console.warn("로딩 시간이 너무 깁니다 (15초 초과). 스킵합니다.");
      this.onLoadError(999); // 에러 처리기로 넘김
    }, 15000);
  }

  onPlayerStateChange(event) {
    // YT.PlayerState.PLAYING 의 값은 1 입니다.
    if (event.data === YT.PlayerState.PLAYING) {
      console.log("버퍼링 끝! 실제 재생 시작 🎵");

      // 로딩 성공했으니 안전장치(15초 타이머) 해제
      if (this.bufferTimeout) clearTimeout(this.bufferTimeout);

      // ★ 진짜 재생 타이머 시작 (예: 5초 뒤 정지)
      this.timer = setTimeout(() => {
        this.stopVideo();
      }, this.playDuration * 1000);
    }
  }

  openAnswer(videoId, start) {
    if (!this.player || !this.isReady) return;

    if (this.timer) clearTimeout(this.timer);
    this.playDuration = 180;

    // 영상 로드 시도
    this.player.seekTo(start, true);
    this.player.playVideo();

    this.toggleCurtain(false); // 커튼 닫기
  }

  openLyricsAnswer(vidoeId) {
    this.player.loadVideoById({
      'videoId' : vidoeId,
      'startSeconds' : 0
    })
    this.toggleCurtain(false);
  }

  stopVideo() {
    if (this.player && this.player.pauseVideo) {
      this.player.pauseVideo();
    }
    this.clearTimers();
  }

  clearTimers() {
    if (this.timer) clearTimeout(this.timer);
    if (this.bufferTimeout) clearTimeout(this.bufferTimeout);
  }

  toggleCurtain(isClosed) {
    const curtain = document.getElementById("video-curtain");
    if (curtain) {
      isClosed
        ? curtain.classList.remove("hidden")
        : curtain.classList.add("hidden");
    }
  }
}
