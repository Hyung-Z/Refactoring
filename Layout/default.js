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

  <div class="backdrop"></div>

  <nav class="side-menu">
    <ul>
      <li id='home'><a href = "/">메인으로</a></li>
      <li ><a href="/GAME/capital/capital.html">수도 퀴즈</a></li>
      <li ><a href="/GAME/idiom/idiom.html">사자성어 퀴즈</a></li>
      <li ><a href="/GAME/individual/individual.html">인물퀴즈</a></li>
      <li ><a href="/GAME/4blank2/4blank2.html">이어말하기: 사자성어</a></li>
      <li ><a href="/GAME/proverb/proverb.html">이어말하기: 속담</a></li>
      <li ><a href="">1초 음악퀴즈</a></li>
      <li ><a href="">가사 퀴즈</a></li>
      <li ><a href="">OST 퀴즈</a></li>
      <li ><a href="">뮤직 믹스 퀴즈</a></li>
    </ul>
  </nav>
`;

const Footer = `
  <footer>
    <p>© 2023 tvshowgame</p>
  </footer>
`;


// 2. 페이지 로드 시 실행될 함수
document.addEventListener("DOMContentLoaded", () => {
  // body 태그의 시작 부분에 헤더 추가
  document.body.insertAdjacentHTML("afterbegin", Header);
  // body 태그의 끝 부분에 푸터 추가
  document.body.insertAdjacentHTML("beforeend", Footer);
  const hamburgerBtn = document.querySelector('.hamburger');
  const sideMenu = document.querySelector('.side-menu');
  const backdrop = document.querySelector('.backdrop');

  // 토글 함수 (열려있으면 닫고, 닫혀있으면 여는 거)
  function toggleMenu() {
      // 1. 버튼에 active 클래스를 넣었다 뺐다 함 (X자 변신)
      hamburgerBtn.classList.toggle('active');
      
      // 2. 메뉴와 배경에도 active를 줘서 보여줌
      sideMenu.classList.toggle('active');
      backdrop.classList.toggle('active');
  }

  // 클릭 이벤트 연결
  hamburgerBtn.addEventListener('click', toggleMenu);
  backdrop.addEventListener('click', toggleMenu); 
});

async function fetchdata(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.status);
    }
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e);
  }
}

