// 1. Иницијализација на Lenis (Smooth Scroll)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
});

// КЛУЧНА ПОПРАВКА ЗА ДА НЕМА СЕЦКАЊЕ: Комплетна синхронизација на Lenis со GSAP Ticker
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Претворање во милисекунди за перфектен тајминг
});

gsap.ticker.lagSmoothing(0);

// 2. Preloader Logic
window.addEventListener('load', () => {

    initGSAP(); // стартува прво твојата главна GSAP логика  

    // КЛУЧНО: Ја повикуваме тука за да ги пресмета точните позиции ПО претходните секции!
    initSectionSixAnimation(); 

    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.style.opacity = '0';

        setTimeout(() => {
            preloader.style.display = 'none';
        }, 1000);

    }, 1000);

});

// 3. Menu Logic
const menuWrap = document.getElementById('full-menu');
const openBtn = document.getElementById('open-btn');
const closeBtn = document.querySelector('.close-menu');
const menuTl = gsap.timeline({ paused: true });

menuTl.to(menuWrap, { duration: 0.6, y: "0%", autoAlpha: 1, ease: "power4.inOut" })
      .to(".nav-links li", { duration: 0.4, y: 0, opacity: 1, stagger: 0.08, ease: "power3.out" }, "-=0.2");

openBtn.addEventListener('click', () => {
    menuTl.play();
    lenis.stop(); 
});
closeBtn.addEventListener('click', () => {
    menuTl.reverse();
    lenis.start(); 
});

// 4. Hero Canvas Fluid Animation
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let mouse = { x: -1000, y: -1000, radius: 150 };

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
function resizeCanvas() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; initLines(); }
window.addEventListener('resize', resizeCanvas);

class Point {
    constructor(x, baseY) { this.x = x; this.y = baseY; this.baseY = baseY; this.vy = 0; }
    update(time, speed, phase, amp) {
        let targetY = this.baseY + Math.sin(this.x * 0.002 + time * speed + phase) * amp;
        targetY += Math.sin(this.x * 0.005 - time * (speed * 1.5)) * (amp * 0.5);
        let dx = mouse.x - this.x; let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
            let force = (mouse.radius - distance) / mouse.radius;
            targetY += force * 80 * (dy > 0 ? -1 : 1); 
        }
        let ay = (targetY - this.y) * 0.05;
        this.vy += ay; this.vy *= 0.85; this.y += this.vy;
    }
}

class FluidLine {
    constructor(yOffset, color, speed, amp) {
        this.yOffset = yOffset; this.color = color; this.speed = speed; this.amp = amp;
        this.phase = Math.random() * Math.PI * 2; this.points = [];
        let resolution = 30; 
        for (let x = -50; x <= width + 50; x += resolution) this.points.push(new Point(x, yOffset));
    }
    draw(time) {
        ctx.beginPath(); ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 0; i < this.points.length; i++) {
            let p = this.points[i]; p.update(time, this.speed, this.phase, this.amp);
            if (i < this.points.length - 1) {
                let xc = (p.x + this.points[i + 1].x) / 2; let yc = (p.y + this.points[i + 1].y) / 2;
                ctx.quadraticCurveTo(p.x, p.y, xc, yc);
            } else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = this.color; ctx.lineWidth = 1; ctx.stroke();
    }
}

let lines = [];
function initLines() { lines = []; for(let i = 0; i < 6; i++) lines.push(new FluidLine(height * (0.15 + (i * 0.12)), 'rgba(0, 0, 0, 0.25)', 0.001 + (Math.random() * 0.0015), 30 + (Math.random() * 60))); }
function animateCanvas(time) { ctx.clearRect(0, 0, width, height); lines.forEach(line => line.draw(time)); requestAnimationFrame(animateCanvas); }

resizeCanvas();
requestAnimationFrame(animateCanvas);

// Почетна состојба на индикаторите
gsap.set(".line-ind", {
    width: "20px",
    backgroundColor: "#1A1A1A"
});

gsap.set(".line-ind:nth-of-type(1)", {
    width: "40px",
    backgroundColor: "#D2FF00"
});

// 5. GSAP & ScrollTrigger Animations
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);
    
    let mm = gsap.matchMedia();

    // =========================================
    // ДЕСКТОП АНИМАЦИИ (Екрани над 1024px) - НЕЧЕПНАТИ
    // =========================================
    mm.add("(min-width: 1025px)", function() {
        
        // ГЛАВНА АНИМАЦИЈА ЗА ПРВАТА СТРАНА (СЕГА САМО ЗА ДЕСКТОП)
        const heroTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".scroll-wrapper",
                start: "top top",
                end: "+=80%", 
                scrub: 1, 
                pin: true, 
                anticipatePin: 1 
            }
        });
        heroTl.to(".hero-image", { filter: "grayscale(100%)", duration: 1, ease: "power2.inOut" }, 0);
        heroTl.to(".section-two", { opacity: 1, duration: 0.1 }, 0);
        heroTl.to(".hero-section", { scale: 0.6, borderRadius: "30px", boxShadow: "0px 30px 60px rgba(0,0,0,0.6)", duration: 1, ease: "power2.inOut" }, 0);
        heroTl.to("#main-logo", { color: "#FFFFFF", duration: 0.25, ease: "expo.out" }, 0.35);
        heroTl.to(".scroll-down", { opacity: 0, duration: 0.1 }, 0);
        heroTl.to(".reveal-text", { opacity: 1, letterSpacing: "5px", duration: 0.4, ease: "power2.out" }, 0.3); 
        heroTl.to(".line-ind", { backgroundColor: "#FFFFFF", duration: 0.25, ease: "expo.out" }, 0.35);
        heroTl.to("#hero-text", { color: "#FFFFFF", duration: 0.25, ease: "expo.out" }, 0.35);

        // ABOUT ME (BLOCK REVEAL) ДЕСКТОП
        const aboutTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".section-three",
                start: "top 65%",
                toggleActions: "play none none reverse"
            }
        });

        aboutTl.to("#trigger-content", { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });

        document.querySelectorAll('.desc-reveal-line').forEach((line) => {
            const block = line.querySelector('.desc-reveal-block');
            const text = line.querySelector('.desc-reveal-inner');
            
            aboutTl.to(block, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, "-=0.3")
                   .set(text, { opacity: 1 })
                   .to(block, { scaleX: 0, transformOrigin: "right", duration: 0.35, ease: "power3.inOut" });
        });

        // ХОРИЗОНТАЛНО СКРОЛАЊЕ СО ЛЕПЕЊЕ ЗА ДЕСКТОП
        let skillsTrack = document.getElementById("skills-track");
        if (skillsTrack) {
            let getScrollAmount = () => skillsTrack.scrollWidth - window.innerWidth;

            gsap.to(skillsTrack, {
                x: () => -getScrollAmount(), 
                ease: "none",
                scrollTrigger: {
                    trigger: ".section-four",
                    start: "top top+=-1px",
                    end: () => `+=${getScrollAmount()}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    anticipatePin: 1
                }
            });
        }

        gsap.to(["#main-logo", "#hero-text"], {
            color: "#1A1A1A",
            backgroundColor: "transparent",
            immediateRender: false, 
            scrollTrigger: {
                trigger: ".section-four",
                start: "top 20%",
                toggleActions: "play none none reverse" 
            }
        });

        gsap.to(".line-ind:not(.active)", {
            backgroundColor: "#1A1A1A",
            immediateRender: false,
            scrollTrigger: {
                trigger: ".section-four",
                start: "top 20%",
                toggleActions: "play none none reverse" 
            }
        });

        // СМООТХ ПРЕЛАЗ ЗА ПОЗАДИНИТЕ
        gsap.set("body", { backgroundColor: "#5B631B" });
        gsap.to("body", {
            scrollTrigger: {
                trigger: ".section-three",
                start: "top center",  
                end: "bottom top",    
                scrub: 1,             
            },
            keyframes: [
                { backgroundColor: "#5B631B", ease: "none" }, 
                { backgroundColor: "#5B631B", ease: "none" }, 
                { backgroundColor: "#5B631B", ease: "none" }, 
                { backgroundColor: "#939E3B", ease: "none" }, 
                { backgroundColor: "#D1D5DB", ease: "none" }  
            ]
        });

        // СИНХРОНИЗИРАНА КОНТРОЛА НА ТЕКСТ И ЛИНИИ
        ScrollTrigger.create({
            start: "top top",
            endTrigger: ".section-four",
            end: "top 20%",
            onEnter: () => {
                document.getElementById("hero-text").innerText = "HERO";
                gsap.to(".line-ind", { width: "20px", backgroundColor: "#1A1A1A", duration: 0.3 });
                gsap.to(".line-ind:nth-of-type(1)", { width: "40px", backgroundColor: "#D2FF00", duration: 0.3 });
            }
        });

        ScrollTrigger.create({
            trigger: ".section-four",
            start: "top 50%",
            onEnter: () => {
                document.getElementById("hero-text").innerText = "MY SKILLS";
                gsap.to(["#main-logo", "#hero-text"], { color: "#1A1A1A" });
                gsap.to(".line-ind", { width: "20px", backgroundColor: "#1A1A1A", duration: 0.3 });
                gsap.to(".line-ind:nth-of-type(2)", { width: "40px", backgroundColor: "#D2FF00", duration: 0.3 });
            },
            onLeaveBack: () => {
                document.getElementById("hero-text").innerText = "HERO";
                gsap.to(".line-ind", { width: "20px", backgroundColor: "#1A1A1A", duration: 0.3 });
                gsap.to(".line-ind:nth-of-type(1)", { width: "40px", backgroundColor: "#D2FF00", duration: 0.3 });
            }
        });

        ScrollTrigger.create({
            trigger: ".section-five",
            start: "top 50%",
            onEnter: () => {
                document.getElementById("hero-text").innerText = "MY PROJECTS";
                gsap.to(["#main-logo", "#hero-text"], { color: "#FFFFFF" });
                gsap.to(".line-ind", { width: "20px", backgroundColor: "#FFFFFF", duration: 0.3 });
                gsap.to(".line-ind:nth-of-type(3)", { width: "40px", backgroundColor: "#D2FF00", duration: 0.3 });
            },
            onLeaveBack: () => {
                document.getElementById("hero-text").innerText = "MY SKILLS";
                gsap.to(["#main-logo", "#hero-text"], { color: "#1A1A1A" });
                gsap.to(".line-ind", { width: "20px", backgroundColor: "#1A1A1A", duration: 0.3 });
                gsap.to(".line-ind:nth-of-type(2)", { width: "40px", backgroundColor: "#D2FF00", duration: 0.3 });
            }
        });

        ScrollTrigger.create({
            trigger: ".section-six",
            start: "top 50%",
            onEnter: () => {
                document.getElementById("hero-text").innerText = "ABOUT ME";
                gsap.to(["#main-logo", "#hero-text"], { color: "#FFFFFF" });
                gsap.to(".line-ind", { width: "20px", backgroundColor: "#FFFFFF", duration: 0.3 });
                gsap.to(".line-ind:nth-of-type(4)", { width: "40px", backgroundColor: "#D2FF00", duration: 0.3 });
            },
            onLeaveBack: () => {
                document.getElementById("hero-text").innerText = "MY PROJECTS";
                gsap.to(".line-ind", { width: "20px", backgroundColor: "#FFFFFF", duration: 0.3 });
                gsap.to(".line-ind:nth-of-type(3)", { width: "40px", backgroundColor: "#D2FF00", duration: 0.3 });
            }
        });

        ScrollTrigger.create({
            trigger: ".section-seven",
            start: "top 50%",
            onEnter: () => {
                document.getElementById("hero-text").innerText = "CONTACT";
                gsap.to(["#main-logo", "#hero-text"], { color: "#FFFFFF" });
                gsap.to(".line-ind", { width: "20px", backgroundColor: "#FFFFFF", duration: 0.3 });
                gsap.to(".line-ind:nth-of-type(5)", { width: "40px", backgroundColor: "#D2FF00", duration: 0.3 });
            },
            onLeaveBack: () => {
                document.getElementById("hero-text").innerText = "ABOUT ME";
                gsap.to(".line-ind", { width: "20px", backgroundColor: "#FFFFFF", duration: 0.3 });
                gsap.to(".line-ind:nth-of-type(4)", { width: "40px", backgroundColor: "#D2FF00", duration: 0.3 });
            }
        });

        gsap.to(".line-ind:not(.active)", {
            backgroundColor: "#FFFFFF",
            duration: 0.4,
            ease: "power2.inOut",
            scrollTrigger: {
                trigger: ".section-five",
                start: "top 10%",
                toggleActions: "play none none reverse" 
            }
        });
    });

    // =========================================
    // МОБИЛНИ АНИМАЦИИ (Екрани под 1024px)
    // =========================================
    mm.add("(max-width: 1024px)", function() {
        
        // HERO SECTION SHRINK - МОБИЛЕН (иста ScrollTrigger логика како кај десктоп верзијата, анимира само .hero-section)
        const heroTlMobile = gsap.timeline({
            scrollTrigger: {
                trigger: ".scroll-wrapper",
                start: "top top",
                end: "+=80%",
                scrub: 1,
                pin: true,
                anticipatePin: 1
            }
        });
        heroTlMobile.to(".hero-section", { scale: 0.6, borderRadius: "30px", boxShadow: "0px 30px 60px rgba(0,0,0,0.6)", duration: 1, ease: "power2.inOut" }, 0);
        
        // КЛУЧНО: Истата анимација за текстот DONEVSKI од десктоп се додава и тука
        heroTlMobile.to(".reveal-text", { opacity: 1, letterSpacing: "5px", duration: 0.4, ease: "power2.out" }, 0.3);

        // ABOUT ME (BLOCK REVEAL) - МОБИЛЕН
        const aboutTlMobile = gsap.timeline({
            scrollTrigger: {
                trigger: ".section-three",
                start: "top 75%",
                toggleActions: "play none none reverse"
            }
        });

        aboutTlMobile.to("#trigger-content", { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });

        document.querySelectorAll('.desc-reveal-line').forEach((line) => {
            const block = line.querySelector('.desc-reveal-block');
            const text = line.querySelector('.desc-reveal-inner');
            
            aboutTlMobile.to(block, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, "-=0.3")
                         .set(text, { opacity: 1 })
                         .to(block, { scaleX: 0, transformOrigin: "right", duration: 0.35, ease: "power3.inOut" });
        });

        // SKILLS КАРТИЧКИ
        gsap.utils.toArray(".skill-card").forEach((card) => {
            gsap.from(card, {
                y: 40,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // СМООТХ ТРАНЗИЦИЈА НА БОИ НА ТЕЛОТО ЗА МОБИЛЕН
        gsap.set("body", { backgroundColor: "#5B631B" });
        gsap.to("body", {
            scrollTrigger: {
                trigger: ".section-three",
                start: "top center",
                endTrigger: ".section-six",
                end: "top center",
                scrub: 1
            },
            keyframes: [
                { backgroundColor: "#5B631B", ease: "none" },
                { backgroundColor: "#939E3B", ease: "none" },
                { backgroundColor: "#1A1A1A", ease: "none" }
            ]
        });
        
        gsap.to("#main-logo", {
            color: "#FFFFFF",
            scrollTrigger: {
                trigger: ".section-five",
                start: "top 20%",
                toggleActions: "play none none reverse"
            }
        });
    });
}

// Анимација за Featured Projects секцијата
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.from(".projects-content", {
        scrollTrigger: {
            trigger: ".section-five",
            start: "top 75%", 
            toggleActions: "play none none reverse"
        },
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
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
applyHoverAnimation('open-btn');
applyHoverAnimation('submit-btn');
applyHoverAnimation('nav-home');
applyHoverAnimation('nav-work');
applyHoverAnimation('nav-contact');
applyHoverAnimation('nav-about');

// =========================================
// PREMIUM SMOOTH MASK ANIMATION FOR SECTION SIX
// =========================================
function initSectionSixAnimation() {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 1025px)", function() {
        const inspireTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: ".section-six",
                start: "top top", 
                end: "+=150%",         
                pin: true,             
                scrub: 1.2,            
                invalidateOnRefresh: true,
                anticipatePin: 1 
            }
        });
        inspireTimeline.to(".about-center-box", {
            width: "0vw",
            borderRadius: "24px",
            duration: 1.5,
            ease: "power2.inOut"
        });
    });

    mm.add("(max-width: 1024px)", function() {
        // На мобилен правиме чист и префинет паралакс влез на содржината
        gsap.from(".about-center-box", {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".section-six",
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
    });
}

// =========================================
// АНИМАЦИЈА ЗА КОНТАКТ СЕКЦИЈАТА
// =========================================
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.to(".contact-card", {
        scrollTrigger: {
            trigger: ".section-seven",
            start: "top 75%", 
            toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out"
    });
}
// Поврзување на менито со Lenis Smooth Scroll
const menuLinks = document.querySelectorAll('.nav-links .roll-link');

menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); 
        const targetId = this.getAttribute('href'); 

        if (targetId && targetId !== '#') {
            menuTl.reverse();
            lenis.start();

            // Времето на чекање е намалено на 600ms за да се синхронизира со затворањето на менито
            setTimeout(() => {
                if (targetId === '#hero') {
                    lenis.scrollTo(0, { duration: 1.5 });
                } else {
                    lenis.scrollTo(targetId, {
                        offset: 0,
                        duration: 1.5
                    });
                }
            }, 600); 
        }
    });
});

// Иницијализација со објект (стандард за v4)
emailjs.init({
    publicKey: "0pJGXmE2Gs5zVadVM",
});

const contactForm = document.getElementById("contact-form");
const submitBtn = document.getElementById("submit-btn");

contactForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const originalText = "SUBMIT"; 
    
    submitBtn.innerHTML = "SENDING...";
    submitBtn.style.pointerEvents = "none"; 

    emailjs.send("service_pg1v4cd", "template_jb63cvr", {
        from_name: document.getElementById("name").value,
        from_email: document.getElementById("email").value,
        message: document.getElementById("message").value
    })
    .then(function() {
        submitBtn.innerHTML = "SENT!";
        contactForm.reset();

        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.pointerEvents = "auto";
            applyHoverAnimation('submit-btn'); 
        }, 3000);
    })
    .catch(function(error) {
        submitBtn.innerHTML = "ERROR!";
        console.error(error);
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.pointerEvents = "auto";
            applyHoverAnimation('submit-btn');
        }, 3000);
    });
});