// script.js - VERSIÓN FINAL CORREGIDA

document.addEventListener('DOMContentLoaded', () => {
    // 1. Animaciones de entrada (Hero)
    const animElements = [
        { id: 'logo', delay: 400 }, { id: 'txt1', delay: 800 },
        { id: 'txt2', delay: 1150 }, { id: 'contactBtn', delay: 1700 }
    ];
    animElements.forEach(item => {
        const el = document.getElementById(item.id);
        if(el) setTimeout(() => {
            el.classList.remove('text-anim');
            el.classList.add(item.id==='logo'?'opacity-100':'fade-in-up');
            if(item.id==='contactBtn') el.classList.add('opacity-100');
        }, item.delay);
    });
    
    const u = document.getElementById('txt2underline');
    if(u) setTimeout(() => u.classList.add('active'), 1900);

    // Flecha Scroll Down (Aparece antes en móvil gracias al CSS, aquí reforzamos)
    const arrow = document.getElementById('scrollDownArrow');
    if(arrow) setTimeout(() => arrow.classList.add('visible'), 2000);
    if(arrow) {
        arrow.addEventListener('click', () => {
            window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
        });
    }

    // 2. INICIAR CARRUSELES 
    if(document.getElementById('offer-carousel-wrapper')) {
        new InfiniteSlider('offer-carousel-wrapper', { speed: 0.5, direction: 'right', isFullWidthSlide: true });
    }
    if(document.getElementById('carousel-categorias')) {
        new InfiniteSlider('carousel-categorias', { speed: 0.8, direction: 'left' });
    }
    if(document.getElementById('carousel-productos')) {
        new InfiniteSlider('carousel-productos', { speed: 0.8, direction: 'right' });
    }

    // 3. Menú Sándwich
    const menuBtn = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                navMenu.classList.add('hidden');
            }
        });
    }

    // 4. Temporizador
    if (document.querySelector('.time-val')) {
        startUrynolTimer(86400);
    }
});

// --- TEMPORIZADOR ---
function startUrynolTimer(duration) {
    let timer = duration;
    let savedTime = localStorage.getItem('herbalaxTimerVFinal');
    if (savedTime) {
        let now = new Date().getTime();
        let diff = Math.floor((now - parseInt(savedTime)) / 1000);
        timer = duration - diff;
        if (timer < 0) { timer = duration; localStorage.setItem('herbalaxTimerVFinal', new Date().getTime().toString()); }
    } else {
        localStorage.setItem('herbalaxTimerVFinal', new Date().getTime().toString());
    }

    setInterval(function () {
        let hours = parseInt(timer / 3600, 10);
        let minutes = parseInt((timer % 3600) / 60, 10);
        let seconds = parseInt(timer % 60, 10);
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.querySelectorAll('.timer-container').forEach(container => {
             const h = container.querySelectorAll('.time-val')[0];
             const m = container.querySelectorAll('.time-val')[1];
             const s = container.querySelectorAll('.time-val')[2];
             if(h) h.textContent = hours;
             if(m) m.textContent = minutes;
             if(s) s.textContent = seconds;
        });

        if (--timer < 0) {
            timer = duration; 
            localStorage.setItem('herbalaxTimerVFinal', new Date().getTime().toString());
        }
    }, 1000);
}

// --- CLASE INFINITE SLIDER ---
class InfiniteSlider {
    constructor(containerId, options = {}) {
        this.wrapper = document.getElementById(containerId);
        if (!this.wrapper) return;

        this.scroller = this.wrapper.querySelector('.scroller');
        this.prevBtn = this.wrapper.querySelector('.prev');
        this.nextBtn = this.wrapper.querySelector('.next');
        this.options = Object.assign({ speed: 1, direction: 'left', isFullWidthSlide: false }, options);

        this.scrollAmount = 0;
        this.isHovered = false;
        this.isDragging = false;
        this.startX = 0;
        this.startScrollLeft = 0;
        this.isManual = false; 
        this.manualTimeout = null;

        this.setupInfiniteLoop();
        this.addEventListeners();
        this.animate();
    }

    setupInfiniteLoop() {
        const content = this.scroller.innerHTML;
        // Duplicar contenido (x3 si es full width para márgenes seguros)
        const numCopies = this.options.isFullWidthSlide ? 3 : 4; 
        this.scroller.innerHTML = content.repeat(numCopies); 
        setTimeout(() => {
            this.maxScroll = this.scroller.scrollWidth / numCopies;
            if (this.options.direction === 'right' || this.options.isFullWidthSlide) {
                // Iniciar en el segundo set para poder ir atrás
                this.scroller.scrollLeft = this.maxScroll; 
            }
        }, 100);
    }

    addEventListeners() {
        this.wrapper.addEventListener('mouseenter', () => this.isHovered = true);
        this.wrapper.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.isDragging = false;
            this.scroller.classList.remove('active');
        });

        // Mouse
        this.scroller.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.isManual = true;
            this.scroller.classList.add('active');
            this.startX = e.pageX - this.scroller.offsetLeft;
            this.startScrollLeft = this.scroller.scrollLeft;
            clearTimeout(this.manualTimeout);
        });
        this.scroller.addEventListener('mouseup', () => { this.isDragging = false; this.scroller.classList.remove('active'); this.resetManualTimer(); });
        this.scroller.addEventListener('mouseleave', () => { if(this.isDragging) { this.isDragging = false; this.scroller.classList.remove('active'); this.resetManualTimer(); } });
        
        this.scroller.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            const x = e.pageX - this.scroller.offsetLeft;
            const walk = (x - this.startX) * 1.5;
            this.scroller.scrollLeft = this.startScrollLeft - walk;
        });

        // Touch (Móvil)
        this.scroller.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.isManual = true;
            this.startX = e.touches[0].pageX - this.scroller.offsetLeft;
            this.startScrollLeft = this.scroller.scrollLeft;
            clearTimeout(this.manualTimeout);
        }, {passive: true});
        this.scroller.addEventListener('touchend', () => { this.isDragging = false; this.resetManualTimer(); });
        this.scroller.addEventListener('touchmove', (e) => {
            if(!this.isDragging) return;
            const x = e.touches[0].pageX - this.scroller.offsetLeft;
            const walk = (x - this.startX) * 1.5;
            this.scroller.scrollLeft = this.startScrollLeft - walk;
        }, {passive: true});

        // Botones
        if(this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                // Si es full width, mover 1 pantalla completa (clientWidth). Si no, 320px.
                const moveAmount = this.options.isFullWidthSlide ? this.wrapper.clientWidth : 320;
                this.moveManual(-moveAmount);
            });
        }
        if(this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                const moveAmount = this.options.isFullWidthSlide ? this.wrapper.clientWidth : 320;
                this.moveManual(moveAmount);
            });
        }
    }

    moveManual(amount) {
        this.isManual = true;
        this.scroller.scrollBy({ left: amount, behavior: 'smooth' });
        this.resetManualTimer();
    }

    resetManualTimer() {
        clearTimeout(this.manualTimeout);
        this.manualTimeout = setTimeout(() => { this.isManual = false; }, 4000);
    }

    animate() {
        if (!this.isHovered && !this.isDragging && !this.isManual) {
            if (this.options.direction === 'left') this.scroller.scrollLeft += this.options.speed;
            else this.scroller.scrollLeft -= this.options.speed;
        }
        
        // BUCLE
        if (this.scroller.scrollLeft >= (this.maxScroll * 2)) {
            this.scroller.scrollLeft = this.maxScroll;
        } else if (this.scroller.scrollLeft <= 0) {
            this.scroller.scrollLeft = this.maxScroll;
        }
        requestAnimationFrame(this.animate.bind(this));
    }
}