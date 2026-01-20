// js/layout.js

// 1. 헤더와 푸터 HTML을 문자열로 정의
const Header = `
  <header>
    <button class="hamburger">
      <span></span>
      <span></span>
      <span></span>
    </button>
  
    <p><a href="/">예능게임모음</a></p>

    <section id="ig">
      <img src="/asset/instagram.png" alt="iglink">
    </section>
  
  </header>
`;

const Footer = `
  <footer>
    <p>© 2023 tvshowgame</p>
  </footer>
`;

// 2. 페이지 로드 시 실행될 함수
document.addEventListener('DOMContentLoaded', () => {
  // body 태그의 시작 부분에 헤더 추가
  document.body.insertAdjacentHTML('afterbegin', Header);
  
  // body 태그의 끝 부분에 푸터 추가
  document.body.insertAdjacentHTML('beforeend', Footer);
});

async function fetchdata(url) {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(response.status);  
        }
        const data = await response.json();
        return data
    }
    catch(e) {
        console.error(e)
    }
}
