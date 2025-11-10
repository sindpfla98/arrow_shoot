const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const TARGET_X = 200;
const TARGET_Y = 130;
const BOW_X = 200;
const BOW_Y = 450;
const MAX_PULL = 100;

let isPulling = false;
let pullY = 0;
let arrow = null;
let arrowReady = true;
let particles = [];
let arrowHit = false;


// --------------------- 타겟 그리기 ---------------------
function drawTarget() {
    const rings = [
        { radius: 50, color: '#fff' },
        { radius: 40, color: '#000' },
        { radius: 30, color: '#4285f4' },
        { radius: 20, color: '#ea4335' },
        { radius: 10, color: '#fbbc04' },
        { radius: 5, color: '#34a853' }
    ];
    
    rings.forEach(ring => {
        ctx.beginPath();
        ctx.arc(TARGET_X, TARGET_Y, ring.radius, 0, Math.PI * 2);
        ctx.fillStyle = ring.color;
        ctx.fill();
    });
}

// --------------------- 활 그리기 ---------------------
function drawBow() {
    // 활대
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    // 왼쪽 활대
    ctx.beginPath();
    ctx.moveTo(BOW_X, BOW_Y);
    ctx.bezierCurveTo(BOW_X - 50, BOW_Y - 30, BOW_X - 100, BOW_Y - 20, BOW_X - 140, BOW_Y + 20);
    ctx.stroke();

    // 오른쪽 활대
    ctx.beginPath();
    ctx.moveTo(BOW_X, BOW_Y);
    ctx.bezierCurveTo(BOW_X + 50, BOW_Y - 30, BOW_X + 100, BOW_Y - 20, BOW_X + 140, BOW_Y + 20);
    ctx.stroke();

    // 강조선
    ctx.strokeStyle = '#A0522D';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(BOW_X, BOW_Y);
    ctx.bezierCurveTo(BOW_X - 50, BOW_Y - 28, BOW_X - 100, BOW_Y - 18, BOW_X - 140, BOW_Y + 22);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(BOW_X, BOW_Y);
    ctx.bezierCurveTo(BOW_X + 50, BOW_Y - 28, BOW_X + 100, BOW_Y - 18, BOW_X + 140, BOW_Y + 22);
    ctx.stroke();

    // 중앙 그립
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(BOW_X - 15, BOW_Y - 5, 30, 10);

    const topEnd = { x: BOW_X - 140, y: BOW_Y + 20 };
    const bottomEnd = { x: BOW_X + 140, y: BOW_Y + 20 };

    // 활시위
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    let pullBowY = BOW_Y + 20 + pullY;
    if (isPulling || arrowReady) {
        ctx.beginPath();
        ctx.moveTo(topEnd.x, topEnd.y);
        ctx.lineTo(BOW_X, pullBowY);
        ctx.lineTo(bottomEnd.x, bottomEnd.y);
        ctx.stroke();
        drawArrowOnBow(pullBowY);
    } else {
        ctx.beginPath();
        ctx.moveTo(topEnd.x, topEnd.y);
        ctx.lineTo(bottomEnd.x, bottomEnd.y);
        ctx.stroke();
    }
}

// --------------------- 활에 장착된 화살 그리기 ---------------------
function drawArrowOnBow(pullYPos) {
    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(BOW_X, pullYPos - 125);
    ctx.lineTo(BOW_X, pullYPos + 20);
    ctx.stroke();

    // 화살촉
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(BOW_X, pullYPos - 140);
    ctx.lineTo(BOW_X - 5, pullYPos - 120);
    ctx.lineTo(BOW_X + 5, pullYPos - 120);
    ctx.closePath();
    ctx.fill();

    // 화살 깃
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(BOW_X - 5, pullYPos + 20);
    ctx.lineTo(BOW_X, pullYPos + 10);
    ctx.lineTo(BOW_X + 5, pullYPos + 20);
    ctx.stroke();
}

// --------------------- 발사된 화살 그리기 ---------------------
function drawArrow() {
    if (!arrow) return;
    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(arrow.x, arrow.y);
    ctx.lineTo(arrow.x, arrow.y + 40);
    ctx.stroke();

    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(arrow.x, arrow.y);
    ctx.lineTo(arrow.x - 2, arrow.y + 5);
    ctx.lineTo(arrow.x + 2, arrow.y + 5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(arrow.x - 2, arrow.y + 40);
    ctx.lineTo(arrow.x, arrow.y + 35);
    ctx.lineTo(arrow.x + 2, arrow.y + 40);
    ctx.stroke();
}

// --------------------- 폭죽 ---------------------
function createParticles(x, y) {
    particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 1.5) * 5,
            alpha: 1,
            radius: Math.random() * 3 + 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }
}

function animateParticles() {
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // 중력
        p.alpha -= 0.02;
    });
    particles = particles.filter(p => p.alpha > 0);
    draw();
    if (particles.length > 0) requestAnimationFrame(animateParticles);
}

// --------------------- 헬퍼 ---------------------
function hexToRgb(hex) {
    if (hex.startsWith("hsl")) return hslToRgb(hex);
    let bigint = parseInt(hex.replace("#",""),16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return `${r},${g},${b}`;
}

function hslToRgb(hsl) {
    const sep = hsl.indexOf(",") > -1 ? "," : " ";
    const hslValues = hsl.substr(4).split(")")[0].split(sep).map(s=>parseFloat(s));
    let h = hslValues[0]/360, s = hslValues[1]/100, l = hslValues[2]/100;
    let r, g, b;
    if(s === 0) r = g = b = l;
    else {
        const hue2rgb = (p, q, t) => {
            if(t < 0) t+=1;
            if(t > 1) t-=1;
            if(t<1/6) return p + (q-p)*6*t;
            if(t<1/2) return q;
            if(t<2/3) return p + (q-p)*(2/3-t)*6;
            return p;
        }
        const q = l<0.5 ? l*(1+s) : l+s-l*s;
        const p = 2*l - q;
        r = hue2rgb(p,q,h+1/3);
        g = hue2rgb(p,q,h);
        b = hue2rgb(p,q,h-1/3);
    }
    return `${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)}`;
}

// --------------------- draw ---------------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTarget();
    drawBow();
    drawArrow();
    // 폭죽
    particles.forEach(p => {
        ctx.fillStyle = `rgba(${hexToRgb(p.color)},${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        ctx.fill();
    });
}

// --------------------- 화살 애니메이션 ---------------------
function animateArrow() {
    if (!arrow) return;
    const dx = TARGET_X - arrow.x;
    const dy = TARGET_Y - arrow.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const step = arrow.speed;

    if(dist < step) {
        arrow.x = TARGET_X;
        arrow.y = TARGET_Y;
        arrowHit = true;
        createParticles(TARGET_X, TARGET_Y);
        animateParticles();
        draw();
        return;
    }

    arrow.x += (dx / dist) * step;
    arrow.y += (dy / dist) * step;
    draw();
    requestAnimationFrame(animateArrow);
}

// --------------------- 이벤트 ---------------------
// 마우스
canvas.addEventListener('mousedown', (e) => {
    if (arrowReady && !arrow) {
        const rect = canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        if (Math.abs(mouseY - BOW_Y) < 50) isPulling = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isPulling) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    pullY = Math.min(Math.max(mouseY - BOW_Y, 0), MAX_PULL);
    draw();
});

canvas.addEventListener('mouseup', () => {
    if (isPulling && pullY > 0) {
        arrow = { x: BOW_X, y: BOW_Y + 20 + pullY, speed: (pullY / MAX_PULL)*10 + 5 };
        arrowReady = false;
        animateArrow();
    }
    isPulling = false;
    pullY = 0;
});

canvas.addEventListener('mouseleave', () => {
    isPulling = false;
    pullY = 0;
    draw();
});

// 터치
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchY = touch.clientY - rect.top;
    if (Math.abs(touchY - BOW_Y) < 50) isPulling = true;
});

canvas.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchY = touch.clientY - rect.top;
    pullY = Math.min(Math.max(touchY - BOW_Y, 0), MAX_PULL);
    draw();
});

canvas.addEventListener('touchend', () => {
    if (isPulling && pullY > 0) {
        arrow = { x: BOW_X, y: BOW_Y + 20 + pullY, speed: (pullY / MAX_PULL)*10 + 5 };
        arrowReady = false;
        animateArrow();
    }
    isPulling = false;
    pullY = 0;
});

// --------------------- 초기 draw ---------------------
draw();

