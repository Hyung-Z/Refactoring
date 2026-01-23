export class SearchModal {
    constructor(targetSelector, options = {}) {
        this.parent = document.querySelector(targetSelector) || document.body;
        this.onSearch = options.onSearch || (() => {}); 
        this.isOpen = false;
        
        this.render();
        
        this.overlay = this.element.querySelector('.search-modal-overlay');
        this.form = this.element.querySelector('form');
        this.inputs = {
            artist: this.form.querySelector('[name="artist"]'),
            title: this.form.querySelector('[name="title"]'),
            yearFrom: this.form.querySelector('[name="yearFrom"]'),
            yearTo: this.form.querySelector('[name="yearTo"]'),
        };
        this.closeBtns = this.element.querySelectorAll('.close-btn');
        this.resetBtn = this.element.querySelector('.reset-btn');

        this.bindEvents();
    }

    render() {
        const wrapper = document.createElement('div');
        // ★ Tailwind 클래스 대신 우리가 만든 CSS 클래스 사용
        wrapper.className = 'search-modal-wrapper'; 
        
        wrapper.innerHTML = `
            <div class="search-modal-overlay"></div>

            <div class="search-modal-container">
                
                <div class="search-modal-header">
                    <p class="search-modal-title">상세 조건 설정</p>
                    <button type="button" class="close-btn">✖</button>
                </div>

                <form>
                    <div class="form-group">
                        <label class="form-label">가수</label>
                        <input name="artist" class="form-input" placeholder="예: 프로미스나인">
                    </div>
                    <div class="form-group">
                        <label class="form-label">곡명</label>
                        <input name="title" class="form-input" placeholder="예: 하얀 그리움">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-col">
                            <label class="form-label">시작 연도</label>
                            <input name="yearFrom" type="number" class="form-input" placeholder="2018">
                        </div>
                        <div class="form-col">
                            <label class="form-label">종료 연도</label>
                            <input name="yearTo" type="number" class="form-input" placeholder="2026">
                        </div>
                    </div>
                    
                    <div class="btn-row">
                        <button type="button" class="btn btn-secondary reset-btn">
                            초기화
                        </button>
                        <button type="submit" class="btn btn-primary">
                            검색
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        this.element = wrapper;
        this.parent.appendChild(this.element);
        
        // 중요: 부모 요소에 relative가 없으면 모달 위치가 이상해질 수 있음
        if (getComputedStyle(this.parent).position === 'static') {
            this.parent.style.position = 'relative';
        }
    }

    bindEvents() {
        this.closeBtns.forEach(btn => btn.addEventListener('click', () => this.close()));
        this.overlay.addEventListener('click', () => this.close());
        this.resetBtn.addEventListener('click', () => this.form.reset());

        this.form.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const criteria = {
                artist: this.inputs.artist.value,
                title: this.inputs.title.value,
                yearFrom: this.inputs.yearFrom.value,
                yearTo: this.inputs.yearTo.value,
            };

            this.onSearch(criteria);
            this.close();
        });
    }

    open() {
        this.element.classList.add('active'); // CSS display:block 활성화
        this.isOpen = true;
    }

    close() {
        this.element.classList.remove('active'); // CSS 숨김
        this.isOpen = false;
    }
    
    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }
}