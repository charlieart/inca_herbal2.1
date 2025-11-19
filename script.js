// script.js - VERSIÓN MAESTRA FINAL

document.addEventListener('DOMContentLoaded', () => {
    // 1. Animaciones Hero
    const animIds = ['logo', 'txt1', 'txt2', 'contactBtn'];
    const delays = [400, 800, 1150, 1700];
    animIds.forEach((id, i) => {
        const el = document.getElementById(id);
        if(el) setTimeout(() => {
            el.classList.remove('text-anim');
            el.classList.add(id==='logo'?'opacity-100':'fade-in-up');
            if(id==='contactBtn') el.classList.add('opacity-100');
        }, delays[i]);
    });
    const u = document.getElementById('txt2underline');
    if(u) setTimeout(() => u.classList.add('active'), 1900);

    // Flecha Scroll
    const arrow = document.getElementById('scrollDownArrow');
    if(arrow) {
        setTimeout(() => arrow.classList.add('visible'), 2500);
        arrow.addEventListener('click', () => {
            const promo = document.getElementById('promociones') || document.querySelector('.promotions-section');
            if(promo) promo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // 2. Iniciar Carruseles
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
    const mb = document.getElementById('menu-toggle'), nm = document.getElementById('nav-menu');
    if(mb && nm) {
        mb.addEventListener('click', (e) => { e.stopPropagation(); nm.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if(!nm.contains(e.target) && !mb.contains(e.target)) nm.classList.add('hidden'); });
    }

    // 4. Timer
    if(document.querySelector('.time-val')) startUrynolTimer(86400);
});

function startUrynolTimer(duration) {
    let timer = duration, saved = localStorage.getItem('timerPromoV2');
    if(saved) {
        let diff = Math.floor((new Date().getTime() - parseInt(saved))/1000);
        timer = duration - diff;
        if(timer < 0) { timer = duration; localStorage.setItem('timerPromoV2', new Date().getTime().toString()); }
    } else localStorage.setItem('timerPromoV2', new Date().getTime().toString());

    setInterval(() => {
        let h = parseInt(timer/3600,10), m = parseInt((timer%3600)/60,10), s = parseInt(timer%60,10);
        h=h<10?"0"+h:h; m=m<10?"0"+m:m; s=s<10?"0"+s:s;
        document.querySelectorAll('.timer-container').forEach(c => {
            const v = c.querySelectorAll('.time-val');
            if(v.length>=3){ v[0].textContent=h; v[1].textContent=m; v[2].textContent=s; }
        });
        if(--timer<0) { timer = duration; localStorage.setItem('timerPromoV2', new Date().getTime().toString()); }
    }, 1000);
}

class InfiniteSlider {
    constructor(cid, opts={}) {
        this.wrap = document.getElementById(cid);
        if(!this.wrap) return;
        this.scroller = this.wrap.querySelector('.scroller');
        this.prev = this.wrap.querySelector('.prev');
        this.next = this.wrap.querySelector('.next');
        this.opts = Object.assign({speed:1, direction:'left', isFullWidthSlide: false}, opts);

        this.hover = false; this.drag = false; this.manual = false;
        this.startX = 0; this.startL = 0; this.tm = null;

        this.setup();
        this.events();
        this.animate();
    }

    setup() {
        const html = this.scroller.innerHTML;
        const numCopies = this.opts.isFullWidthSlide ? 3 : 4; 
        this.scroller.innerHTML = html.repeat(numCopies); 
        setTimeout(() => {
            this.maxScroll = this.scroller.scrollWidth / numCopies;
            if (this.options.direction === 'right' || this.options.isFullWidthSlide) {
                this.scroller.scrollLeft = this.maxScroll; 
            }
        }, 200);
    }

    events() {
        this.wrap.addEventListener('mouseenter', () => this.hover = true);
        this.wrap.addEventListener('mouseleave', () => { this.hover = false; this.stopDrag(); });
        
        this.scroller.addEventListener('mousedown', e => this.startDrag(e.pageX));
        this.scroller.addEventListener('mouseup', () => this.stopDrag());
        this.scroller.addEventListener('mouseleave', () => this.stopDrag());
        this.scroller.addEventListener('mousemove', e => this.moveDrag(e));
        
        this.scroller.addEventListener('touchstart', e => this.startDrag(e.touches[0].pageX), {passive:true});
        this.scroller.addEventListener('touchend', () => this.stopDrag());
        this.scroller.addEventListener('touchmove', e => {
            if(this.drag) this.moveDrag({pageX: e.touches[0].pageX, preventDefault:()=>{}});
        }, {passive:true});

        const links = this.scroller.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (this.scroller.classList.contains('active')) { e.preventDefault(); e.stopPropagation(); }
            });
            const img = link.querySelector('img');
            if(img) img.addEventListener('dragstart', e => e.preventDefault());
        });

        if(this.prev) {
            const move = this.opts.isFullWidthSlide ? this.wrap.offsetWidth : 320;
            this.prev.addEventListener('click', () => this.moveManual(-move));
        }
        if(this.next) {
            const move = this.opts.isFullWidthSlide ? this.wrap.offsetWidth : 320;
            this.next.addEventListener('click', () => this.moveManual(move));
        }
    }

    startDrag(x) {
        this.drag = true; this.manual = true;
        this.scroller.classList.add('active');
        this.startX = x - this.scroller.offsetLeft;
        this.startL = this.scroller.scrollLeft;
        clearTimeout(this.tm);
    }

    stopDrag() {
        if(!this.drag) return;
        this.drag = false;
        this.scroller.classList.remove('active');
        this.resetTimer();
    }

    moveDrag(e) {
        if(!this.drag) return;
        e.preventDefault();
        const x = e.pageX - this.scroller.offsetLeft;
        const walk = (x - this.startX) * 1.5;
        this.scroller.scrollLeft = this.startL - walk;
    }

    moveManual(amount) {
        this.manual = true;
        clearTimeout(this.tm);
        this.scroller.scrollBy({ left: amount, behavior: 'smooth' });
        this.resetTimer();
    }

    resetTimer() {
        clearTimeout(this.tm);
        this.tm = setTimeout(() => this.manual = false, 4000);
    }

    animate() {
        if(!this.hover && !this.drag && !this.manual) {
            const s = this.opts.speed;
            if(this.opts.direction === 'left') this.scroller.scrollLeft += s;
            else this.scroller.scrollLeft -= s;
        }
        if(this.scroller.scrollLeft >= (this.maxScroll * 2)) {
            this.scroller.scrollLeft = this.maxScroll;
        } else if(this.scroller.scrollLeft <= 0) {
            this.scroller.scrollLeft = this.maxScroll;
        }
        requestAnimationFrame(this.animate.bind(this));
    }
}
