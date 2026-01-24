export class CustomPlaylist {
    constructor(selector, options = {}) {
        this.mode = options.mode
        
        // 1. 컨테이너 및 내부 요소 찾기 (selector 범위 안에서만 찾음)
        this.container = document.querySelector(selector);
        
        // 왼쪽 (내 리스트)
        this.leftPanel = this.container.querySelector('.playlist.left');
        this.leftList = this.leftPanel.querySelector('.song-list');
        this.leftCount = this.leftPanel.querySelector('#my-count'); // (0) 부분
        
        // 오른쪽 (검색 결과)
        this.rightPanel = this.container.querySelector('.playlist.right');
        this.rightList = this.rightPanel.querySelector('.song-list');
        
        // 버튼들
        this.btnAdd = this.container.querySelector('#btn-add');
        this.btnRemove = this.container.querySelector('#btn-remove');
        this.startBtn = this.container.parentElement.querySelector('.start')
        this.onStart = options.onStart || (() => {});
        // 2. 데이터 상태 관리
        this.fullData = options.dataset || []; // 전체 원본 데이터
        this.mySongs = [];    // 왼쪽 리스트 데이터
        this.poolSongs = [];  // 오른쪽 리스트 데이터 (검색 결과)
        
        // ★ 선택된 아이템의 ID를 저장할 집합 (중복 방지용 Set 사용)
        this.selectedLeft = new Set(); 
        this.selectedRight = new Set();

        this.isDragging = false; 
        this.dragMode = null; // 'add' (담기) 또는 'remove' (빼기)

        // ★ 드래그가 끝났을 때(마우스 뗐을 때) 상태 초기화
        // (리스트 밖에서 마우스를 떼도 멈춰야 하므로 document에 걺)
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.dragMode = null;
        });

        // 3. 초기화 실행
        this.init();
    }

    init() {
        // 초기에는 오른쪽(pool)에 전체 데이터를 보여주거나 비워둘 수 있음
        // 여기서는 전체 데이터를 검색 결과로 가정하고 시작
        this.poolSongs = [];
        this.render();
        this.bindEvents();
    }

    setDataSet(newData) {
        this.fullData = newData; // 새 데이터 저장
        this.poolSongs = []; // 검색 풀 업데이트
        this.render(); // 화면 다시 그리기
    }

    // --- 렌더링 관련 메서드 ---

    // 화면 그리기 (왼쪽, 오른쪽 모두 업데이트)
    render() {
        this.renderList(this.leftList, this.mySongs, this.selectedLeft);
        this.renderList(this.rightList, this.poolSongs, this.selectedRight);
        this.updateCount();
    }

    // 특정 리스트(ul)에 데이터(data)를 그리는 함수
    renderList(ulElement, data, selectedSet) {
        ulElement.innerHTML = '';

        if (data.length === 0) {
            ulElement.innerHTML = '<li class="empty-msg">데이터가 없습니다.</li>';
            return;
        }

        data.forEach(song => {
            const li = document.createElement('li');
            li.className = 'song-item';
            if (selectedSet.has(song.id)) li.classList.add('active');
            li.dataset.id = song.id;

            li.innerHTML = `<p>${song.title[0]}</p><span>${song.artist}</span>`;
            // ---------------------------------------------------------
            // [드래그 로직 시작]
            // ---------------------------------------------------------

            // 1. 마우스를 눌렀을 때 (드래그 시작)
            li.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                
                // 처음에 누른 놈이 이미 선택된 놈이면 -> '빼기 모드'
                // 처음에 누른 놈이 선택 안 된 놈이면 -> '담기 모드'
                const isAlreadySelected = selectedSet.has(song.id);
                this.dragMode = isAlreadySelected ? 'remove' : 'add';

                // 현재 아이템 즉시 처리
                this.updateItemState(li, song.id, selectedSet);
            });

            // 2. 마우스가 위로 지나갈 때 (드래그 중)
            li.addEventListener('mouseenter', () => {
                if (this.isDragging) {
                    this.updateItemState(li, song.id, selectedSet);
                }
            });

            // (주의: 기존의 'click' 이벤트는 mousedown과 겹치므로 제거하거나,
            // 드래그 로직이 클릭까지 커버하므로 굳이 따로 안 넣어도 됨)
            
            ulElement.appendChild(li);
        });
    }

    // ★ 화면을 다시 그리지 않고(no render), 상태와 클래스만 바꾸는 최적화 함수
    updateItemState(liElement, songId, targetSet) {
        if (this.dragMode === 'add') {
            // 담기 모드: Set에 없으면 추가
            if (!targetSet.has(songId)) {
                targetSet.add(songId);
                liElement.classList.add('active'); // CSS 즉시 반영
            }
        } else if (this.dragMode === 'remove') {
            // 빼기 모드: Set에 있으면 제거
            if (targetSet.has(songId)) {
                targetSet.delete(songId);
                liElement.classList.remove('active'); // CSS 즉시 반영
            }
        }
        this.updateCount();
    }   

    updateCount() {
        if (this.leftCount) {
            this.leftCount.textContent = `(${this.mySongs.length})`;
        }

        if (this.mySongs.length != 0) {
            this.startBtn.style.display = 'inline-block'
        }
    }

    // --- 로직 관련 메서드 ---

    // 선택 토글 (Set에 넣었다 뺐다)
    toggleSelection(id, set) {
        if (set.has(id)) {
            set.delete(id);
        } else {
            set.add(id);
        }
    }

    // [>] 추가 버튼 (오른쪽 -> 왼쪽)
    addSongs() {
        if (this.selectedRight.size === 0) {
            alert('추가할 곡을 선택해주세요.');
            return;
        }

        // 1. 오른쪽에 선택된 곡들을 찾는다.
        const toAdd = this.poolSongs.filter(song => this.selectedRight.has(song.id));

        // 2. 왼쪽 리스트에 추가한다. (중복 방지 로직이 필요하면 여기에 추가)
        // (Set을 이용해 ID 중복 체크를 할 수도 있음)
        this.mySongs = [...this.mySongs, ...toAdd];

        // 3. 오른쪽 리스트에서는 제거한다.
        this.poolSongs = this.poolSongs.filter(song => !this.selectedRight.has(song.id));

        // 4. 선택 상태 초기화
        this.selectedRight.clear();
        
        this.render();
    }

    // [<] 삭제 버튼 (왼쪽 -> 오른쪽)
    removeSongs() {
        if (this.selectedLeft.size === 0) {
            alert('삭제할 곡을 선택해주세요.');
            return;
        }

        // 1. 왼쪽에 선택된 곡들을 찾는다.
        const toRemove = this.mySongs.filter(song => this.selectedLeft.has(song.id));

        // 2. 오른쪽 리스트로 돌려보낸다.
        this.poolSongs = [...this.poolSongs, ...toRemove];

        // 3. 왼쪽 리스트에서 제거한다.
        this.mySongs = this.mySongs.filter(song => !this.selectedLeft.has(song.id));

        // 4. 선택 상태 초기화
        this.selectedLeft.clear();

        this.render();
    }

    // --- 검색 메서드 (외부에서 호출 가능) ---
    search(criteria) {
        // 1. 전체 데이터에서 필터링 (제공해주신 로직 활용)
        const filtered = this.fullData.filter((song) => {
            // 이미 내 리스트(왼쪽)에 있는 곡은 검색 결과에서 제외할지 결정
            // 여기서는 "내 리스트에 없는 것 중에서" 검색한다고 가정
            const isAlreadyInMyList = this.mySongs.some(my => my.id === song.id);
            if (isAlreadyInMyList) return false;

            const songYear = parseInt(song.date.split(".")[0]);
            const keywordTitle = criteria.title?.toLowerCase() || "";
            const keywordArtist = criteria.artist?.toLowerCase() || "";
            const targetTitle = song.title[0].toLowerCase();
            const targetArtist = song.artist.toLowerCase();

            const matchTitle = !keywordTitle || targetTitle.includes(keywordTitle);
            const matchArtist = !keywordArtist || targetArtist.includes(keywordArtist);
            
            const matchYearFrom = !criteria.yearFrom || songYear >= parseInt(criteria.yearFrom);
            const matchYearTo = !criteria.yearTo || songYear <= parseInt(criteria.yearTo);

            return matchTitle && matchArtist && matchYearFrom && matchYearTo;
        });

        // 2. 결과 업데이트
        this.poolSongs = filtered;
        this.selectedRight.clear(); // 검색 결과가 바뀌면 선택도 초기화
        this.render();
    }

    // --- 전체 선택/해제 기능 ---
    handleBulkSelect(panelType, action) {
        const targetList = panelType === 'left' ? this.mySongs : this.poolSongs;
        const targetSet = panelType === 'left' ? this.selectedLeft : this.selectedRight;

        if (action === 'pick') {
            // 전체 담기
            targetList.forEach(song => targetSet.add(song.id));
        } else {
            // 전체 비우기
            targetSet.clear();
        }
        this.render();
    }

    // --- 이벤트 바인딩 ---
    bindEvents() {
        // 추가/삭제 버튼
        this.btnAdd.addEventListener('click', () => this.addSongs());
        this.btnRemove.addEventListener('click', () => this.removeSongs());

        // 전체 선택/해제 버튼 연결 (이벤트 위임 사용 가능하지만 명시적으로 연결)
        this.bindBulkButton(this.leftPanel, 'left');
        this.bindBulkButton(this.rightPanel, 'right');
        
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => {
                // 현재 왼쪽 리스트에 있는 곡들을 넘김
                this.onStart(this.mySongs);
            });
        }
    }

    bindBulkButton(panelElement, type) {
        const pickBtn = panelElement.querySelector('.all-pick');
        const dropBtn = panelElement.querySelector('.all-drop');

        if (pickBtn) pickBtn.addEventListener('click', () => this.handleBulkSelect(type, 'pick'));
        if (dropBtn) dropBtn.addEventListener('click', () => this.handleBulkSelect(type, 'drop'));
    }
}