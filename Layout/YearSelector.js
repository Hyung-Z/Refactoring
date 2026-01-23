export class YearSelector {
    constructor(selector, options = {}) {
        this.container = document.querySelector(selector);
        this.buttons = this.container.querySelectorAll('.year-btn');
        this.countDisplay = this.container.querySelector('#selected-count');
        this.startBtn = this.container.querySelector('#start-game-btn');
        
        // 데이터 및 콜백
        this.dataset = options.dataset || []; // 전체 데이터
        this.onStart = options.onStart || (() => {}); // 게임 시작 콜백
        
        // 선택된 필터들을 저장할 Set ('2000s', 'recent' 등)
        this.activeFilters = new Set();
        
        // 현재 필터링된 결과물 저장
        this.resultSongs = [];

        this.init();
    }

    init() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const range = btn.dataset.range;
                this.toggleFilter(range, btn);
            });
        });

        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => {
                // 게임 시작 버튼 누르면 현재 필터링된 데이터 전달
                this.onStart(this.resultSongs);
            });
        }
    }

    setDataSet(newData) {
        this.dataset = newData;
        
        // 중요: 데이터를 넣자마자 '현재 눌려있는 버튼' 기준으로 다시 계산해야 함
        // (사용자가 로딩 중에 미리 버튼을 눌러놨을 수도 있으니까요)
        this.calculateSongs(); 
        this.updateUI();
    }

    toggleFilter(rangeKey, btnElement) {
        // 1. 필터 Set 관리 (Toggle)
        if (this.activeFilters.has(rangeKey)) {
            this.activeFilters.delete(rangeKey);
            btnElement.classList.remove('active');
        } else {
            this.activeFilters.add(rangeKey);
            btnElement.classList.add('active');
        }

        // 2. 데이터 재계산
        this.calculateSongs();
    }

    calculateSongs() {
        // 필터가 하나도 없으면 0곡
        if (this.activeFilters.size === 0) {
            this.resultSongs = [];
            this.updateUI();
            return;
        }

        // 전체 데이터 중 조건에 맞는 것 필터링
        this.resultSongs = this.dataset.filter(song => {
            // song.date가 "2023.05" 형식이면 연도만 추출
            const year = parseInt(song.date.split('.')[0]); 
            
            // 현재 활성화된 필터 중 "하나라도" 만족하면 포함 (OR 조건)
            // 예: 2000년대 버튼과 2010년대 버튼을 둘 다 눌렀으면 합집합
            for (const filter of this.activeFilters) {
                if (this.checkYear(year, filter)) {
                    return true; // 포함!
                }
            }
            return false; // 탈락
        });

        this.updateUI();
    }

    // 연도 비교 로직 (핵심)
    checkYear(year, filterKey) {
        switch (filterKey) {
            case 'under-2000': return year < 2000;
            case '2000s':      return year >= 2000 && year <= 2009;
            case '2010s':      return year >= 2010 && year <= 2019;
            case '2020s':      return year >= 2020 && year <= 2029;
            case 'recent':     return year >= 2025 && year <= 2026;
            default:           return false;
        }
    }

    updateUI() {
        // 카운트 업데이트
        if (this.countDisplay) {
            this.countDisplay.textContent = this.resultSongs.length;
        }

        // 시작 버튼 활성/비활성
        if (this.startBtn) {
            this.startBtn.disabled = this.resultSongs.length === 0;
        }
    }
}