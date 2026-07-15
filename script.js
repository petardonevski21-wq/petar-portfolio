// 1. Иницијализација на Lenis (Smooth Scroll)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000); 
});

gsap.ticker.lagSmoothing(0);

// 2. Preloader Logic
window.addEventListener('load', () => {
    initGSAP(); 
    initSectionSixAnimation(); 

    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.style.opacity = '0';
        setTimeout(() => { preloader.style.display = 'none'; }, 1000);
    }, 1000);
});

// 3. Menu Logic
const menuWrap = document.getElementById('full-menu');
const openBtn = document.getElementById('open-btn');
const closeBtn = document.querySelector('.close-menu');
const menuTl = gsap.timeline({ paused: true });

menuTl.to(menuWrap, { duration: 0.6, y: "0%", autoAlpha: 1, ease: "power4.inOut" })
      .to(".nav-links li", { duration: 0.4, y: 0, opacity: 1, stagger: 0.08, ease: "power3.out" }, "-=0.2");

openBtn.addEventListener('click', () => { menuTl.play(); lenis.stop(); });
closeBtn.addEventListener('click', () => { menuTl.reverse(); lenis.start(); });

// =========================================
// 4. PREMIUM VERTICAL GRID & LIGHT NODES
// =========================================
const premiumCanvas = document.getElementById('premium-bg-canvas');
const ctx = premiumCanvas.getContext('2d');

// Лесна конфигурација за визуелниот ефект
const BG_CONFIG = {
    linesCount: 34,           
    nodesCount: 65,           
    nodeSizeMin: 3,           
    nodeSizeMax: 5,           
    animationSpeed: 1.2,      
    lineOpacity: 0.08,        
    glowIntensity: 12,        
    nodeColor: '#ffffff'      
};

let width, height;
let linesX = [];
let nodes = [];
let isAnimating = false;
let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class LightNode {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.lineIndex = Math.floor(Math.random() * BG_CONFIG.linesCount);
        this.size = BG_CONFIG.nodeSizeMin + Math.random() * (BG_CONFIG.nodeSizeMax - BG_CONFIG.nodeSizeMin);
        
        let direction = Math.random() > 0.5 ? 1 : -1;
        let baseSpeed = 0.2 + Math.random() * 1.5; 
        this.speed = baseSpeed * direction * BG_CONFIG.animationSpeed;
        
        this.opacity = 0.3 + Math.random() * 0.7;

        if (initial) {
            this.y = Math.random() * height;
        } else {
            const offscreenOffset = (this.size / 2) + BG_CONFIG.glowIntensity + 10;
            this.y = this.speed > 0 ? -offscreenOffset : height + offscreenOffset;
        }
    }

    update() {
        if (prefersReducedMotion) return;
        
        this.y += this.speed;
        this.x = linesX[this.lineIndex] || 0; 

        const offscreenOffset = (this.size / 2) + BG_CONFIG.glowIntensity + 10;
        
        if (this.speed > 0 && this.y > height + offscreenOffset) {
            this.reset();
        } else if (this.speed < 0 && this.y < -offscreenOffset) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.shadowBlur = BG_CONFIG.glowIntensity;
        ctx.shadowColor = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

function initGrid() {
    linesX = [];
    const spacing = width / (BG_CONFIG.linesCount + 1);
    
    for (let i = 1; i <= BG_CONFIG.linesCount; i++) {
        linesX.push(i * spacing);
    }
    
    if (nodes.length === 0) {
        for (let i = 0; i < BG_CONFIG.nodesCount; i++) {
            nodes.push(new LightNode());
        }
    } else {
        nodes.forEach(node => {
            if (node.lineIndex >= BG_CONFIG.linesCount) {
                node.lineIndex = Math.floor(Math.random() * BG_CONFIG.linesCount);
            }
        });
    }
}

function resizeCanvas() {
    width = premiumCanvas.width = window.innerWidth;
    height = premiumCanvas.height = window.innerHeight;
    initGrid();
    if (prefersReducedMotion) drawFrame(); 
}

function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    for (let i = 0; i < linesX.length; i++) {
        let x = Math.round(linesX[i]) + 0.5; 
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    ctx.strokeStyle = `rgba(255, 255, 255, ${BG_CONFIG.lineOpacity})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    nodes.forEach(node => {
        node.update();
        node.draw();
    });
}

function animateCanvas() {
    if (document.hidden || prefersReducedMotion) {
        isAnimating = false;
        return;
    }
    isAnimating = true;
    drawFrame();
    requestAnimationFrame(animateCanvas);
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !isAnimating && !prefersReducedMotion) {
        animateCanvas();
    }
});

resizeCanvas();
if (!prefersReducedMotion) animateCanvas();

// =========================================
// Почетна состојба на индикаторите
// =========================================
gsap.set(".line-ind", { width: "20px", backgroundColor: "#1A1A1A" });
gsap.set(".line-ind:nth-of-type(1)", { width: "40px", backgroundColor: "#D2FF00" });

// 5. GSAP & ScrollTrigger Animations
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);
    
    let mm = gsap.matchMedia();

    mm.add("(min-width: 1025px)", function() {
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

    mm.add("(max-width: 1024px)", function() {
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
        heroTlMobile.to(".reveal-text", { opacity: 1, letterSpacing: "5px", duration: 0.4, ease: "power2.out" }, 0.3);

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
applyHoverAnimation('open-btn');
applyHoverAnimation('submit-btn');
applyHoverAnimation('nav-home', '#D2FF00');
applyHoverAnimation('nav-work', '#D2FF00');
applyHoverAnimation('nav-contact', '#D2FF00');
applyHoverAnimation('nav-about', '#D2FF00');
applyHoverAnimation('close-btn', '#D2FF00');

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

const menuLinks = document.querySelectorAll('.nav-links .roll-link');

menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Ако е друга страница, дозволи нормално да се отвори
        if (!href.startsWith('#')) {
            return;
        }

        // Ако е секција (#hero, #about...)
        e.preventDefault();

        menuTl.reverse();
        lenis.start();

        setTimeout(() => {
            if (href === '#hero') {
                lenis.scrollTo(0, { duration: 1.5 });
            } else {
                lenis.scrollTo(href, { duration: 1.5 });
            }
        }, 600);
    });
});

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