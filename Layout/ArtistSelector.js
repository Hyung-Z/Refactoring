export class ArtistSelector {
    constructor(selector, options = {}) {
        this.container = document.querySelector(selector);
        
        // 요소 찾기
        this.input = this.container.querySelector('#artist-input');
        this.suggestionList = this.container.querySelector('#artist-suggestions');
        this.tagsContainer = this.container.querySelector('#selected-artists');
        this.countDisplay = this.container.querySelector('#artist-song-count');
        this.startBtn = this.container.querySelector('#btn-start-artist');

        // 상태
        this.fullData = [];       // 전체 곡 데이터
        this.uniqueArtists = [];  // 가수 이름 목록 (중복 제거됨)
        this.selectedArtists = new Set(); // 현재 선택된 가수들
        this.onStart = options.onStart || (() => {});

        this.initEvents();
    }

    // 1. 데이터 주입 (fetch 후 호출)
    setDataSet(data) {
        this.fullData = data;
        
        // ★ 핵심: 전체 곡에서 가수 이름만 뽑아서 중복 제거
        const artists = data.map(song => song.artist);
        this.uniqueArtists = [...new Set(artists)].sort(); // 가나다순 정렬
    }

    initEvents() {
        // 입력할 때마다 검색 실행
        this.input.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // 입력창 밖을 클릭하면 추천 목록 닫기
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.suggestionList.contains(e.target)) {
                this.suggestionList.classList.remove('show');
            }
        });

        // 시작 버튼
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => {
                const resultSongs = this.calculateSongs();
                this.onStart(resultSongs);
            });
        }
    }

    // 2. 검색 및 자동완성 표시
    handleSearch(keyword) {
        // 공백 제거 및 소문자 변환
        const term = keyword.trim().toLowerCase();
        
        if (term.length === 0) {
            this.suggestionList.classList.remove('show');
            return;
        }

        // 검색 로직: 포함되어 있고 && 이미 선택하지 않은 가수
        const matches = this.uniqueArtists.filter(artist => 
            artist.toLowerCase().includes(term) && !this.selectedArtists.has(artist)
        );

        this.renderSuggestions(matches);
    }

    renderSuggestions(list) {
        this.suggestionList.innerHTML = '';
        
        if (list.length === 0) {
            this.suggestionList.classList.remove('show');
            return;
        }

        list.forEach(artist => {
            const li = document.createElement('li');
            li.textContent = artist;
            li.addEventListener('click', () => this.addArtist(artist));
            this.suggestionList.appendChild(li);
        });

        this.suggestionList.classList.add('show');
    }

    // 3. 가수 추가 (태그 생성)
    addArtist(artist) {
        this.selectedArtists.add(artist);
        
        // UI 처리
        this.input.value = ''; // 입력창 비우기
        this.suggestionList.classList.remove('show'); // 목록 닫기
        this.input.focus(); // 다시 입력할 수 있게 포커스

        this.renderTags();
        this.updateUI();
    }

    // 4. 가수 삭제
    removeArtist(artist) {
        this.selectedArtists.delete(artist);
        this.renderTags();
        this.updateUI();
    }

    // 태그 그리기
    renderTags() {
        this.tagsContainer.innerHTML = '';
        
        this.selectedArtists.forEach(artist => {
            const btn = document.createElement('button');
            btn.className = 'artist-tag';
            btn.innerHTML = `${artist} <span>✕</span>`; // X 아이콘
            
            // 삭제 이벤트
            btn.addEventListener('click', () => this.removeArtist(artist));
            
            this.tagsContainer.appendChild(btn);
        });
    }

    // 5. 최종 노래 계산
    calculateSongs() {
        if (this.selectedArtists.size === 0) return [];

        // 선택된 가수의 노래만 필터링
        return this.fullData.filter(song => this.selectedArtists.has(song.artist));
    }

    updateUI() {
        const result = this.calculateSongs();
        
        if (this.countDisplay) {
            this.countDisplay.textContent = result.length;
        }
        if (this.startBtn) {
            this.startBtn.disabled = result.length === 0;
        }
    }
}