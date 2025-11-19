// script.js - VERSIÓN DEFINITIVA

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ANIMACIONES HERO (CORREGIDO) ---
    const animIds = ['logo', 'txt1', 'txt2', 'contactBtn'];
    const delays = [300, 600, 900, 1400]; // Tiempos ajustados

    animIds.forEach((id, i) => {
        const el = document.getElementById(id);
        if(el) {
            setTimeout(() => {
                // Quitar clase que oculta y agregar animación
                el.classList.remove('start-hidden', 'opacity-0', 'text-anim'); 
                el.classList.add('animate-enter'); // Clase de animación CSS
                el.style.opacity = "1"; // Forzar visibilidad
            }, delays[i]);
        }
    });
    const u = document.getElementById('txt2underline');
    if(u) setTimeout(() => u.classList.add('active'), 1600);

    // Flecha Scroll
    const arrow = document.getElementById('scrollDownArrow');
    if(arrow) {
        setTimeout(() => arrow.classList.add('visible'), 2200);
        arrow.addEventListener('click', () => {
            const promo = document.getElementById('promociones');
            if(promo) promo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // --- 2. MENÚ SÁNDWICH (MÓVIL) ---
    const menuBtn = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!navMenu.classList.contains('hidden') && !navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                navMenu.classList.add('hidden');
            }
        });
    }

    // --- 3. INICIAR CARRUSELES ---
    // Carrusel Grande de Ofertas
    if(document.getElementById('offer-carousel-wrapper')) {
        new InfiniteSlider('offer-carousel-wrapper', { 
            speed: 0.5, 
            direction: 'right', 
            isFullWidthSlide: true 
        });
    }
    // Carruseles Pequeños
    if(document.getElementById('carousel-categorias')) {
        new InfiniteSlider('carousel-categorias', { speed: 0.8, direction: 'left' });
    }
    if(document.getElementById('carousel-productos')) {
        new InfiniteSlider('carousel-productos', { speed: 0.8, direction: 'right' });
    }

    // 4. Timer
    if(document.querySelector('.time-val')) startUrynolTimer(86400);
});


// --- CLASE CARRUSEL INFINITO (LÓGICA ROBUSTA) ---
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
        const numCopies = this.options.isFullWidthSlide ? 3 : 4; 
        this.scroller.innerHTML = content.repeat(numCopies); 
        
        // Esperar render para calcular
        setTimeout(() => {
            this.maxScroll = this.scroller.scrollWidth / numCopies;
            // Posicionar en el medio (Set 2) para tener espacio a ambos lados
            if (this.options.direction === 'right' || this.options.isFullWidthSlide) {
                this.scroller.scrollLeft = this.maxScroll; 
            }
        }, 200);
    }

    addEventListeners() {
        this.wrapper.addEventListener('mouseenter', () => this.isHovered = true);
        this.wrapper.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.isDragging = false;
            this.scroller.classList.remove('active');
        });

        // Touch / Mouse Drag
        this.scroller.addEventListener('mousedown', e => this.startDrag(e.pageX));
        this.scroller.addEventListener('touchstart', e => this.startDrag(e.touches[0].pageX), {passive:true});
        
        this.scroller.addEventListener('mousemove', e => { if(this.isDragging) { e.preventDefault(); this.moveDrag(e.pageX); }});
        this.scroller.addEventListener('touchmove', e => { if(this.isDragging) this.moveDrag(e.touches[0].pageX); }, {passive:true});
        
        this.scroller.addEventListener('mouseup', () => this.stopDrag());
        this.scroller.addEventListener('mouseleave', () => this.stopDrag());
        this.scroller.addEventListener('touchend', () => this.stopDrag());

        // Prevenir clicks al arrastrar
        const links = this.scroller.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (this.scroller.classList.contains('active')) { 
                    e.preventDefault(); e.stopPropagation(); 
                }
            });
            const img = link.querySelector('img');
            if(img) img.addEventListener('dragstart', e => e.preventDefault());
        });

        // Botones
        if(this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.snapMove(-1));
        }
        if(this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.snapMove(1));
        }
    }

    startDrag(x) {
        this.isDragging = true;
        this.isManual = true;
        this.scroller.classList.add('active');
        this.startX = x - this.scroller.offsetLeft;
        this.startScrollLeft = this.scroller.scrollLeft;
        clearTimeout(this.manualTimeout);
    }

    stopDrag() {
        if(!this.isDragging) return;
        this.isDragging = false;
        this.scroller.classList.remove('active');
        this.resetManualTimer();
        
        // Snap al soltar en móvil/escritorio (Opcional, mejora UX en ofertas)
        if(this.options.isFullWidthSlide) {
             this.snapToNearest();
        }
    }

    moveDrag(x) {
        const walk = (x - this.startX) * 1.5;
        this.scroller.scrollLeft = this.startScrollLeft - walk;
    }

    // Función especial para mover y centrar (SNAP)
    snapMove(direction) {
        this.isManual = true;
        clearTimeout(this.manualTimeout);

        const slideWidth = this.options.isFullWidthSlide ? this.wrapper.offsetWidth : 320;
        const currentScroll = this.scroller.scrollLeft;
        
        // Calcular el índice del siguiente slide
        const currentIndex = Math.round(currentScroll / slideWidth);
        const targetScroll = (currentIndex + direction) * slideWidth;

        this.scroller.scrollTo({ left: targetScroll, behavior: 'smooth' });
        this.resetManualTimer();
    }

    snapToNearest() {
         const slideWidth = this.wrapper.offsetWidth;
         const currentIndex = Math.round(this.scroller.scrollLeft / slideWidth);
         this.scroller.scrollTo({ left: currentIndex * slideWidth, behavior: 'smooth' });
    }

    resetManualTimer() {
        clearTimeout(this.manualTimeout);
        this.manualTimeout = setTimeout(() => { this.isManual = false; }, 4000);
    }

    animate() {
        if (!this.isHovered && !this.isDragging && !this.isManual) {
            const s = this.options.speed;
            if (this.options.direction === 'left') this.scroller.scrollLeft += s;
            else this.scroller.scrollLeft -= s;
        }
        
        // Bucle Infinito
        if (this.scroller.scrollLeft >= (this.maxScroll * 2)) {
            this.scroller.scrollLeft = this.maxScroll; // Reset al medio
        } else if (this.scroller.scrollLeft <= 10) { // Margen pequeño
            this.scroller.scrollLeft = this.maxScroll;
        }
        
        requestAnimationFrame(this.animate.bind(this));
    }
}

// --- TEMPORIZADOR ---
function startUrynolTimer(duration) {
    let timer = duration, saved = localStorage.getItem('timerVFinal');
    if(saved) {
        let diff = Math.floor((new Date().getTime() - parseInt(saved))/1000);
        timer = duration - diff;
        if(timer < 0) { timer = duration; localStorage.setItem('timerVFinal', new Date().getTime().toString()); }
    } else localStorage.setItem('timerVFinal', new Date().getTime().toString());

    setInterval(() => {
        let h = parseInt(timer/3600,10), m = parseInt((timer%3600)/60,10), s = parseInt(timer%60,10);
        h=h<10?"0"+h:h; m=m<10?"0"+m:m; s=s<10?"0"+s:s;
        document.querySelectorAll('.timer-container').forEach(c => {
            const v = c.querySelectorAll('.time-val');
            if(v.length>=3){ v[0].textContent=h; v[1].textContent=m; v[2].textContent=s; }
        });
        if(--timer<0) { timer = duration; localStorage.setItem('timerVFinal', new Date().getTime().toString()); }
    }, 1000);
}