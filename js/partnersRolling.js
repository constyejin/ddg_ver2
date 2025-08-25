const list = document.querySelector(".partner_list");

list.innerHTML += list.innerHTML + list.innerHTML;

const listWidth = list.scrollWidth / 3;

gsap.to(list, {
  x: -listWidth,        
  duration: 50,
  ease: "none",
  repeat: -1,
  modifiers: {
    x: gsap.utils.unitize(x => {
      let pos = parseFloat(x);
      if (pos <= -listWidth) {
        pos += listWidth; 
      }
      return pos;
    })
  }
});



// const inner = document.querySelector(".culture_inner");
// const items = gsap.utils.toArray(".culture_item");

// inner.innerHTML += inner.innerHTML; 

// let totalHeight = inner.scrollHeight / 2; 

// gsap.to(inner, {
//   y: -totalHeight, 
//   duration: 40,     
//   ease: "linear",
//   repeat: -1
// });

// gsap.to(items, {
//   yPercent: -200, 
//   duration: 40,
//   ease: "linear",
//   repeat: -1,
//   modifiers: {
//     yPercent: gsap.utils.unitize(y => {
//       const wrapped = y % 200; 
//       return wrapped;
//     })
//   },
//   onUpdate: function() {
//     document.querySelectorAll(".culture_item").forEach(item => {
//       let rect = item.getBoundingClientRect();
//       let parentRect = document.querySelector(".culture_list").getBoundingClientRect();

//       let fadeZone = parentRect.height * 0.2;
//       let distTop = rect.top - parentRect.top;
//       let distBottom = parentRect.bottom - rect.bottom;

//       if (distTop < fadeZone) {
//         item.style.opacity = distTop / fadeZone; 
//       } else if (distBottom < fadeZone) {
//         item.style.opacity = distBottom / fadeZone; 
//       } else {
//         item.style.opacity = 1;
//       }
//     });
//   }
// });


// ddg_value.js — GSAP infinite vertical loop (PC & Mobile) + mobile 2-cards viewport
(function () {
  const list = document.querySelector(".culture_list");
  const inner = document.querySelector(".culture_inner");
  if (!list || !inner) return;

  const BP = 768; // 모바일 기준폭
  let tween = null;
  let isMobile = window.innerWidth <= BP;

  // 유틸
  const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const debounce = (fn, d = 120) => {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d); };
  };

  // 1) 모바일에서 컨테이너 높이를 "카드 2개 + gap"로 맞추기
  function setMobileViewportHeight() {
    if (!isMobile) { list.style.height = ""; return; }

    // 레이아웃이 세로(column)이고 gap이 CSS에 정의되어 있다고 가정 (기본 20px)
    const items = $all(".culture_item", inner);
    if (items.length === 0) return;

    // 이미지 로딩 전/후 높이 차이를 커버하기 위해 실제 렌더 높이 측정
    const r1 = items[0].getBoundingClientRect();
    const r2 = (items[1] || items[0]).getBoundingClientRect();

    const cs = getComputedStyle(inner);
    const gap = parseFloat(cs.rowGap || cs.gap || "20") || 20;

    const target = Math.round(r1.height + r2.height + gap);
    // 정확히 두 장만 보이도록 컨테이너 높이를 고정
    list.style.height = `${target}px`;
  }

  // 2) 무한 루프 초기화 (PC/Mobile 공통)
  function initInfiniteScroll() {
    // 중복 방지: 최초 1회만 복제
    if (!inner.dataset.cloned) {
      inner.innerHTML += inner.innerHTML;
      inner.dataset.cloned = "1";
    }

    // 기존 트윈 제거
    if (tween) { tween.kill(); tween = null; }

    // 총 이동 높이(원본 세트 높이)
    const total = inner.scrollHeight / 2;

    tween = gsap.to(inner, {
      y: -total,
      duration: 40,           
      ease: "linear",
      repeat: -1,
      modifiers: {
        y: gsap.utils.unitize(y => (parseFloat(y) % -total)) // 래핑
      },
      onUpdate: fadeUpdate
    });
  }

  // 3) 상/하단 페이드(시안의 마스크 느낌 강화)
  function fadeUpdate() {
    const parentRect = list.getBoundingClientRect();
    const fadeZone = parentRect.height * 0.2; // 상/하 20% 영역 페이드
    $all(".culture_item", inner).forEach(item => {
      const rect = item.getBoundingClientRect();
      const distTop = rect.top - parentRect.top;
      const distBottom = parentRect.bottom - rect.bottom;
      let opacity = 1;
      if (distTop < fadeZone)      opacity = Math.max(0, distTop / fadeZone);
      else if (distBottom < fadeZone) opacity = Math.max(0, distBottom / fadeZone);
      item.style.opacity = opacity;
    });
  }

  // 4) 뷰포트 들어올 때만 재생해 성능 최적화
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (tween) tween.paused(!e.isIntersecting);
    });
  }, { threshold: 0.06 });
  io.observe(list);

  // 5) 초기 세팅
  function setup() {
    isMobile = window.innerWidth <= BP;
    setMobileViewportHeight();
    initInfiniteScroll();
    // 첫 페이드 계산
    requestAnimationFrame(fadeUpdate);
  }

  // 6) 리사이즈/방향 전환 대응 (이미지 로딩 후 재계산 포함)
  const onResize = debounce(() => {
    setup();
  }, 150);

  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize);

  // 이미지가 늦게 로드되는 경우도 재계산
  window.addEventListener("load", () => {
    setup();
    // 폰트/이미지로 레이아웃 변할 수 있어 한번 더
    setTimeout(setup, 200);
  });

  // DOM 준비 직후도 세팅
  if (document.readyState !== "loading") setup();
  else document.addEventListener("DOMContentLoaded", setup);
})();
