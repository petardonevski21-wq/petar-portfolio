// 1. Иницијализација на Lenis (Smooth Scroll)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// 2. Мени Логика (со Lando Norris Hover Ефект)
const menuWrap = document.getElementById('full-menu');
const openBtn = document.getElementById('open-btn');
const closeBtn = document.querySelector('.close-menu');
const menuTl = gsap.timeline({ paused: true });

menuTl.to(menuWrap, { duration: 0.6, y: "0%", autoAlpha: 1, ease: "power4.inOut" })
      .to(".nav-links li", { duration: 0.4, y: 0, opacity: 1, stagger: 0.08, ease: "power3.out" }, "-=0.2");

openBtn.addEventListener('click', () => { menuTl.play(); lenis.stop(); });
closeBtn.addEventListener('click', () => { menuTl.reverse(); lenis.start(); });


function applyHoverAnimation(buttonId) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    const btnText = btn.textContent.trim();
    btn.innerHTML = '';
    btn.style.display = 'flex';
    btnText.split('').forEach((char, i) => {
        const charContainer = document.createElement('span');
        charContainer.style.position = 'relative'; charContainer.style.display = 'inline-block'; charContainer.style.overflow = 'hidden'; 
        
        const origChar = document.createElement('span');
        origChar.textContent = char === ' ' ? '\u00A0' : char; origChar.style.display = 'inline-block';
        origChar.style.transition = 'transform 0.3s cubic-bezier(0.76, 0, 0.24, 1)'; origChar.style.transitionDelay = `${i * 0.020}s`;

        const cloneChar = document.createElement('span');
        cloneChar.textContent = char === ' ' ? '\u00A0' : char; cloneChar.style.position = 'absolute';
        cloneChar.style.left = '0'; cloneChar.style.top = '0'; cloneChar.style.display = 'inline-block';
        cloneChar.style.transform = 'translate(-100%, 100%)'; 
        cloneChar.style.transition = 'transform 0.3s cubic-bezier(0.76, 0, 0.24, 1)'; cloneChar.style.transitionDelay = `${i * 0.020}s`;

        charContainer.appendChild(origChar); charContainer.appendChild(cloneChar); btn.appendChild(charContainer);

        btn.addEventListener('mouseenter', () => { origChar.style.transform = 'translate(100%, -100%)'; cloneChar.style.transform = 'translate(0%, 0%)'; });
        btn.addEventListener('mouseleave', () => { origChar.style.transform = 'translate(0%, 0%)'; cloneChar.style.transform = 'translate(-100%, 100%)'; });
    });
}
applyHoverAnimation('open-btn');
applyHoverAnimation('nav-home');
applyHoverAnimation('nav-work');
applyHoverAnimation('nav-contact');
applyHoverAnimation('nav-about');

applyHoverAnimation('view-btn-1');
applyHoverAnimation('view-btn-2');
applyHoverAnimation('view-btn-3');

// Спречување на копчињата да носат било каде (да не скока страната нагоре)
// =========================================
// 3. ПРОФЕСИОНАЛНА "PIN" АНИМАЦИЈА ЗА ПРОЕКТИТЕ
// =========================================
gsap.registerPlugin(ScrollTrigger);

let texts = gsap.utils.toArray('.work-text');
let images = gsap.utils.toArray('.work-img');

// Почетна состојба: Скриј ги текстовите 2 и 3 надолу, и сликите 2 и 3 целосно надвор од екранот
gsap.set(texts.slice(1), { y: 80, autoAlpha: 0 }); 
gsap.set(images.slice(1), { yPercent: 100 }); 

const workTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".work-showcase",
        start: "top top",
        end: "+=300%", // Колку се скрола подолго, толку е поспора транзицијата (300% за 3 проекти)
        pin: true,
        scrub: 1,
        anticipatePin: 1
    }
});

// Анимација: Од Проект 1 кон Проект 2
workTl.to(texts[0], { y: -80, autoAlpha: 0, duration: 1 }) // Стариот текст оди нагоре и исчезнува
      .to(images[1], { yPercent: 0, duration: 1, ease: "power2.inOut" }, "<") // Новата слика се лизга одоздола
      .to(texts[1], { y: 0, autoAlpha: 1, duration: 1 }, "<0.3") // Новиот текст доаѓа одоздола
      
      // Пауза за да се види убаво вториот проект
      .to({}, { duration: 0.5 })

      // Анимација: Од Проект 2 кон Проект 3
      .to(texts[1], { y: -80, autoAlpha: 0, duration: 1 })
      .to(images[2], { yPercent: 0, duration: 1, ease: "power2.inOut" }, "<")
      .to(texts[2], { y: 0, autoAlpha: 1, duration: 1 }, "<0.3");
