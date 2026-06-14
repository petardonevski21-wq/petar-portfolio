(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  document.documentElement.classList.add("js");

  let lenis = null;
  function initLenis() {
    if (reduce || typeof Lenis === "undefined") return;
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, lerp: 0.1 });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
    }
  }

  function initScrollAnimations() {
    if (typeof gsap === "undefined") return;
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (reduce) return;

    ScrollTrigger.refresh();
  }

  // 3. Menu Logic
  function initMenu() {
    if (typeof gsap === "undefined") return;

    const menuWrap = document.getElementById('full-menu');
    const openBtn = document.getElementById('open-btn');
    const closeBtn = document.querySelector('.close-menu');
    if (!menuWrap || !openBtn || !closeBtn) return;

    const menuTl = gsap.timeline({ paused: true });

    menuTl.to(menuWrap, { duration: 0.6, y: "0%", autoAlpha: 1, ease: "power4.inOut" })
          .to(".nav-links li", { duration: 0.4, y: 0, opacity: 1, stagger: 0.08, ease: "power3.out" }, "-=0.2");

    openBtn.addEventListener('click', () => {
        menuTl.play();
        if (lenis) lenis.stop(); 
    });
    closeBtn.addEventListener('click', () => {
        menuTl.reverse();
        if (lenis) lenis.start(); 
    });

    // Поврзување на менито со Lenis Smooth Scroll
    const menuLinks = document.querySelectorAll('.nav-links .roll-link');

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); 
            const targetId = this.getAttribute('href'); 

            if (targetId && targetId !== '#') {
                menuTl.reverse();
                if (lenis) lenis.start();

                // Времето на чекање е 600ms за да се синхронизира со затворањето на менито
                setTimeout(() => {
                    // Ако линкот е внатрешен лепенка (почнува со #), скролај со Lenis
                    if (targetId.startsWith('#')) {
                        if (!lenis) return;
                        if (targetId === '#hero') {
                            lenis.scrollTo(0, { duration: 1.5 });
                        } else {
                            lenis.scrollTo(targetId, {
                                offset: 0,
                                duration: 1.5
                            });
                        }
                    } else {
                        // Ако е класичен линк до страница (пр. /index.html), пренасочи го прелистувачот
                        window.location.href = targetId;
                    }
                }, 600); 
            }
        });
    });
  }

  // Функција за Lando Norris ефект
  function applyHoverAnimation(buttonId) {
      const btn = document.getElementById(buttonId);
      if (!btn) return;

      const btnText = btn.textContent.trim();
      btn.innerHTML = '';
      btn.style.display = 'flex';

      btnText.split('').forEach((char, i) => {
          const charContainer = document.createElement('span');
          charContainer.style.position = 'relative';
          charContainer.style.display = 'inline-block';
          charContainer.style.overflow = 'hidden'; 
          
          const origChar = document.createElement('span');
          origChar.textContent = char === ' ' ? '\u00A0' : char;
          origChar.style.display = 'inline-block';
          origChar.style.transition = 'transform 0.3s cubic-bezier(0.76, 0, 0.24, 1)';
          origChar.style.transitionDelay = `${i * 0.020}s`;

          const cloneChar = document.createElement('span');
          cloneChar.textContent = char === ' ' ? '\u00A0' : char;
          cloneChar.style.position = 'absolute';
          cloneChar.style.left = '0';
          cloneChar.style.top = '0';
          cloneChar.style.display = 'inline-block';
          cloneChar.style.transform = 'translate(-100%, 100%)'; 
          cloneChar.style.transition = 'transform 0.3s cubic-bezier(0.76, 0, 0.24, 1)';
          cloneChar.style.transitionDelay = `${i * 0.020}s`;

          charContainer.appendChild(origChar);
          charContainer.appendChild(cloneChar);
          btn.appendChild(charContainer);

          btn.addEventListener('mouseenter', () => {
              origChar.style.transform = 'translate(100%, -100%)'; 
              cloneChar.style.transform = 'translate(0%, 0%)';     
          });
          
          btn.addEventListener('mouseleave', () => {
              origChar.style.transform = 'translate(0%, 0%)';
              cloneChar.style.transform = 'translate(-100%, 100%)';
          });
      });
  }

  /* =====================================================
     9. Projects slider (drag + arrows + dots)
     ===================================================== */
  function initSlider() {
    const slider = $("#slider");
    if (!slider) return;
    const medias = $$(".slide__media", slider);
    if (typeof gsap === "undefined" || !window.ScrollTrigger || reduce) return;

    // 3D coverflow: side slides tilt up to ±30°, recede and shrink slightly
    function updateCoverflow() {
      const half = window.innerWidth / 2;
      medias.forEach((m) => {
        const r = m.getBoundingClientRect();
        const d = (r.left + r.width / 2 - half) / half; // -1 left … 0 centre … 1 right
        const k = Math.max(-1, Math.min(1, d));
        gsap.set(m, {
          rotationY: -k * 30,
          z: -Math.abs(k) * 140,
          scale: 1 - Math.abs(k) * 0.1,
          transformPerspective: 1100,
        });
      });
    }

    // scroll distance that leaves the LAST slide exactly centred at the end
    const getAmt = () => {
      const slides = $$(".slide", slider);
      const last = slides[slides.length - 1];
      return Math.max(0, last.offsetLeft + last.offsetWidth / 2 - window.innerWidth / 2);
    };
    gsap.to(slider, {
      x: () => -getAmt(), ease: "none",
      scrollTrigger: {
        trigger: "#projects", start: "top top", end: () => "+=" + getAmt(),
        scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: updateCoverflow, onRefresh: updateCoverflow,
      },
    });
    updateCoverflow();
  }

  window.addEventListener("load", () => {
    initLenis();
    initMenu();
    applyHoverAnimation('open-btn');
    applyHoverAnimation('submit-btn');
    applyHoverAnimation('nav-home');
    applyHoverAnimation('nav-work');
    applyHoverAnimation('nav-contact');
    applyHoverAnimation('nav-about');
    initScrollAnimations();
    initSlider();
    if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 400);
  });
})();