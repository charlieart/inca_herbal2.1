// script.js - VERSIÓN BUCLE INFINITO PERFECTO

document.addEventListener('DOMContentLoaded', () => {
    // Animaciones Hero
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

    // Flecha
    const arrow = document.getElementById('scrollDownArrow');
    if(arrow) {
        setTimeout(() => arrow.classList.add('visible'), 2500);
        arrow.addEventListener('click', () => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' }));
    }

    // Carruseles
    if(document.getElementById('offer-carousel-wrapper')) {
        new InfiniteSlider('offer-carousel-wrapper', { speed: 0.5, direction: 'right', isFullWidth: true });
    }
    if(document.getElementById('carousel-categorias')) {
        new InfiniteSlider('carousel-categorias', { speed: 0.8, direction: 'left' });
    }
    if(document.getElementById('carousel-productos')) {
        new InfiniteSlider('carousel-productos', { speed: 0.8, direction: 'right' });
    }

    // Menú Sándwich
    const mb = document.getElementById('menu-toggle'), nm = document.getElementById('nav-menu');
    if(mb && nm) {
        mb.addEventListener('click', (e) => { e.stopPropagation(); nm.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if(!nm.contains(e.target) && !mb.contains(e.target)) nm.classList.add('hidden'); });
    }

    // Timer
    if(document.querySelector('.time-val')) startUrynolTimer(86400);
});

function startUrynolTimer(duration) {
    let timer = duration, saved = localStorage.getItem('timerPromo');
    if(saved) {
        let diff = Math.floor((new Date().getTime() - parseInt(saved))/1000);
        timer = duration - diff;
        if(timer < 0) { timer = duration; localStorage.setItem('timerPromo', new Date().getTime().toString()); }
    } else localStorage.setItem('timerPromo', new Date().getTime().toString());

    setInterval(() => {
        let h = parseInt(timer/3600,10), m = parseInt((timer%3600)/60,10), s = parseInt(timer%60,10);
        h=h<10?"0"+h:h; m=m<10?"0"+m:m; s=s<10?"0"+s:s;
        document.querySelectorAll('.timer-container').forEach(c => {
            const v = c.querySelectorAll('.time-val');
            if(v.length>=3){ v[0].textContent=h; v[1].textContent=m; v[2].textContent=s; }
        });
        if(--timer<0) { timer = duration; localStorage.setItem('timerPromo', new Date().getTime().toString()); }
    }, 1000);
}

class InfiniteSlider {
    constructor(cid, opts={}) {
        this.wrap = document.getElementById(cid);
        if(!this.wrap) return;
        this.scroller = this.wrap.querySelector('.scroller');
        this.prev = this.wrap.querySelector('.prev');
        this.next = this.wrap.querySelector('.next');
        this.opts = Object.assign({speed:1, direction:'left', isFullWidth: false}, opts);

        this.hover = false; this.drag = false; this.manual = false;
        this.startX = 0; this.startL = 0; this.tm = null;

        this.setup();
        this.events();
        this.animate();
    }

    setup() {
        const html = this.scroller.innerHTML;
        // Duplicamos x3 para garantizar bucle infinito fluido
        this.scroller.innerHTML = html + html + html;
        
        // Esperar render para calcular el punto de reinicio (ancho de 1 set completo)
        setTimeout(() => {
            this.resetPoint = this.scroller.scrollWidth / 3;
            this.scroller.scrollLeft = this.resetPoint; // Empezar en el medio
        }, 100);
    }

    events() {
        this.wrap.addEventListener('mouseenter', () => this.hover = true);
        this.wrap.addEventListener('mouseleave', () => { this.hover = false; this.stopDrag(); });
        
        this.scroller.addEventListener('mousedown', e => this.startDrag(e.pageX));
        this.scroller.addEventListener('mouseup', () => this.stopDrag());
        this.scroller.addEventListener('mousemove', e => this.moveDrag(e));
        
        this.scroller.addEventListener('touchstart', e => this.startDrag(e.touches[0].pageX), {passive:true});
        this.scroller.addEventListener('touchend', () => this.stopDrag());
        this.scroller.addEventListener('touchmove', e => {
            if(this.drag) this.moveDrag({pageX: e.touches[0].pageX, preventDefault:()=>{}});
        }, {passive:true});

        if(this.prev) this.prev.addEventListener('click', () => this.moveManual(-1));
        if(this.next) this.next.addEventListener('click', () => this.moveManual(1));
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

    moveManual(dir) {
        this.manual = true;
        clearTimeout(this.tm);
        
        // Calcular ancho de desplazamiento
        const moveAmount = this.opts.isFullWidth ? this.wrap.clientWidth : 320;
        
        this.scroller.classList.add('smooth-scroll');
        this.scroller.scrollLeft += (dir * moveAmount);
        
        setTimeout(() => this.scroller.classList.remove('smooth-scroll'), 500);
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

        // BUCLE INFINITO MATEMÁTICO
        // Si pasamos el punto de reinicio (fin del set 2), volvemos al inicio del set 2
        if(this.scroller.scrollLeft >= (this.resetPoint * 2)) {
            this.scroller.scrollLeft -= this.resetPoint;
        }
        // Si retrocedemos antes del set 2, saltamos al final del set 2
        else if(this.scroller.scrollLeft <= 0) {
            this.scroller.scrollLeft += this.resetPoint;
        }

        requestAnimationFrame(this.animate.bind(this));
    }
}