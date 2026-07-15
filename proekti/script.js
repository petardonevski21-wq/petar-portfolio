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

  // Обновена мени логика
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
            const targetId = this.getAttribute('href'); 

            // Ако е друга страница, дозволи нормално да се отвори
            if (!targetId.startsWith('#')) {
                return;
            }

            e.preventDefault(); 
            menuTl.reverse();
            if (lenis) lenis.start();

            // Времето на чекање е 600ms за да се синхронизира со затворањето на менито
            setTimeout(() => {
                if (!lenis) return;
                if (targetId === '#hero') {
                    lenis.scrollTo(0, { duration: 1.5 });
                } else {
                    lenis.scrollTo(targetId, {
                        offset: 0,
                        duration: 1.5
                    });
                }
            }, 600); 
        });
    });
  }

  // Обновена функција за Lando Norris ефект со hoverColor опција
  function applyHoverAnimation(buttonId, hoverColor) {
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
          
          if (hoverColor) {
              cloneChar.style.color = hoverColor;
          }

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

  /* =====================================================
     СВЕТКИ ВО ПОЗАДИНА
     ===================================================== */
  function initSparkles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-sparkles';
    document.body.prepend(canvas);

    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '1', /* За да се гледа над позадината, но позади елементите */
        pointerEvents: 'none' /* За да не блокира кликање */
    });

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', () => {
        initCanvas();
        createParticles();
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = Math.random() * 0.3 - 0.15;
            this.speedY = Math.random() * 0.3 - 0.15;
            // Микс од бела боја и неонската зелена
            this.color = Math.random() > 0.5 ? 'rgba(255, 255, 255, ' : 'rgba(210, 255, 0, ';
            this.alpha = Math.random() * 0.5 + 0.2;
            this.alphaChange = Math.random() * 0.01 - 0.005;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > width) this.speedX *= -1;
            if (this.y < 0 || this.y > height) this.speedY *= -1;
            
            // Ефект на светкање (twinkle)
            this.alpha += this.alphaChange;
            if (this.alpha <= 0.1 || this.alpha >= 0.7) {
                this.alphaChange *= -1;
            }
        }
        draw() {
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        const particleCount = Math.floor(window.innerWidth / 20); // Динамичен број на светки
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    initCanvas();
    createParticles();
    animate();
  }

  window.addEventListener("load", () => {
    initLenis();
    initMenu();
    applyHoverAnimation('open-btn');
    applyHoverAnimation('submit-btn');
    applyHoverAnimation('nav-home', '#D2FF00');
    applyHoverAnimation('nav-work', '#D2FF00');
    applyHoverAnimation('nav-contact', '#D2FF00');
    applyHoverAnimation('nav-about', '#D2FF00');
    applyHoverAnimation('close-btn', '#D2FF00');
    initScrollAnimations();
    initSlider();
    initSparkles(); // Го повикуваме ефектот на светки
    if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 400);
  });
})();