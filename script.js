/* ===================================================================
   CONFIG — the only line you need to touch for RSVP-to-Google-Sheet
   =================================================================== */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwffZd-VOOD_VAW_RDxtbqnQH6ISD7-bUYkS0uaeXZmdsN_2QvFcfywUzUTspXoUlXW/exec";

/* ===================================================================
   0. Envelope intro
   =================================================================== */
const envelopeScreen = document.getElementById('envelopeScreen');
const envelope = document.getElementById('envelope');
const invite = document.getElementById('invite');

function openEnvelope(){
  envelope.classList.add('is-open');
  setTimeout(() => {
    invite.hidden = false;
    document.body.style.overflow = '';
    envelopeScreen.classList.add('is-hidden');
  }, 700);
}
document.body.style.overflow = 'hidden';
envelope.addEventListener('click', openEnvelope);

/* ===================================================================
   0b. Floating ambient shapes
   =================================================================== */
const shapeField = document.getElementById('shapeField');
const shapeColors = ['#f7c9d6', '#ffd9b0', '#e2d3fb', '#cdeedd', '#fff0b3'];
const shapeSVGs = {
  triangle: (c) => `<svg viewBox="0 0 40 40"><polygon points="20,4 36,34 4,34" fill="${c}"/></svg>`,
  circle: (c) => `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="${c}"/></svg>`
};
function makeShapes(count){
  for(let i = 0; i < count; i++){
    const el = document.createElement('div');
    el.className = 'shape';
    const size = 20 + Math.random() * 34;
    const color = shapeColors[Math.floor(Math.random() * shapeColors.length)];
    const kind = Math.random() > 0.5 ? 'triangle' : 'circle';
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${Math.random() * 100}vw`;
    el.style.top = `${Math.random() * 100}vh`;
    el.innerHTML = shapeSVGs[kind](color);
    el.dataset.speed = (2 + Math.random() * 5).toFixed(2);
    el.dataset.sway = (10 + Math.random() * 20).toFixed(2);
    el.dataset.rot = Math.random() * 360;
    el.dataset.offset = Math.random() * 1000;
    shapeField.appendChild(el);
  }
}
makeShapes(window.innerWidth < 640 ? 8 : 14);

let shapeTicks = 0;
function animateShapes(){
  shapeTicks += 0.4;
  document.querySelectorAll('.shape').forEach((el) => {
    const speed = parseFloat(el.dataset.speed);
    const sway = parseFloat(el.dataset.sway);
    const rot = parseFloat(el.dataset.rot);
    const offset = parseFloat(el.dataset.offset);
    const drift = Math.sin((shapeTicks + offset) / 40) * sway;
    const rise = -((shapeTicks * speed * 0.2 + offset) % (window.innerHeight + 120));
    el.style.transform = `translate(${drift}px, ${rise}px) rotate(${rot + shapeTicks}deg)`;
  });
  requestAnimationFrame(animateShapes);
}
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  requestAnimationFrame(animateShapes);
}

/* ===================================================================
   0c. Scratch-to-reveal date card
   =================================================================== */
const scratchWrap = document.getElementById('scratchWrap');
const scratchCanvas = document.getElementById('scratchCanvas');
if(scratchCanvas){
  const sctx = scratchCanvas.getContext('2d');
  function sizeScratch(){
    const rect = scratchWrap.getBoundingClientRect();
    scratchCanvas.width = rect.width;
    scratchCanvas.height = rect.height;
    sctx.fillStyle = '#e08a97';
    sctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
  }
  sizeScratch();

  let scratching = false;
  let scratchedPixels = 0;

  function scratchAt(x, y){
    sctx.globalCompositeOperation = 'destination-out';
    sctx.beginPath();
    sctx.arc(x, y, 16, 0, Math.PI * 2);
    sctx.fill();
  }

  function getPos(e){
    const rect = scratchCanvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function checkRevealed(){
    scratchedPixels++;
    if(scratchedPixels > 6){
      scratchWrap.classList.add('is-revealed');
    }
  }

  scratchCanvas.addEventListener('pointerdown', (e) => { scratching = true; const p = getPos(e); scratchAt(p.x, p.y); checkRevealed(); });
  scratchCanvas.addEventListener('pointermove', (e) => { if(scratching){ const p = getPos(e); scratchAt(p.x, p.y); checkRevealed(); } });
  window.addEventListener('pointerup', () => { scratching = false; });
}

/* ===================================================================
   0d. RSVP modal open/close
   =================================================================== */
const rsvpOpenBtn = document.getElementById('rsvpOpenBtn');
const rsvpModal = document.getElementById('rsvpModal');
const rsvpModalBackdrop = document.getElementById('rsvpModalBackdrop');
const rsvpModalClose = document.getElementById('rsvpModalClose');

function openRsvpModal(){ rsvpModal.classList.add('is-open'); }
function closeRsvpModal(){ rsvpModal.classList.remove('is-open'); }
rsvpOpenBtn.addEventListener('click', openRsvpModal);
rsvpModalBackdrop.addEventListener('click', closeRsvpModal);
rsvpModalClose.addEventListener('click', closeRsvpModal);

/* ===================================================================
   1. Confetti — falls across the whole page, the whole time
   =================================================================== */
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
const confettiColors = ['#f7c9d6', '#ffd9b0', '#e2d3fb', '#cdeedd', '#fff0b3', '#e08a97', '#d9a441'];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let pieces = [];
function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function makePiece(randomY){
  return {
    x: Math.random() * canvas.width,
    y: randomY ? Math.random() * canvas.height : -20,
    size: 6 + Math.random() * 8,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    speedY: 0.8 + Math.random() * 1.6,
    speedX: (Math.random() - 0.5) * 1.2,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 6,
    shape: Math.random() > 0.5 ? 'rect' : 'circle'
  };
}

const PIECE_COUNT = window.innerWidth < 640 ? 55 : 110;
for(let i = 0; i < PIECE_COUNT; i++){ pieces.push(makePiece(true)); }

function drawPiece(p){
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot * Math.PI / 180);
  ctx.fillStyle = p.color;
  if(p.shape === 'rect'){
    ctx.fillRect(-p.size/2, -p.size/3, p.size, p.size * 0.66);
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function tickConfetti(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => {
    p.y += p.speedY;
    p.x += p.speedX + Math.sin(p.y / 60) * 0.6;
    p.rot += p.rotSpeed;
    if(p.y > canvas.height + 20){
      Object.assign(p, makePiece(false));
    }
    drawPiece(p);
  });
  requestAnimationFrame(tickConfetti);
}

if(reduceMotion){
  pieces.forEach(drawPiece);
} else {
  requestAnimationFrame(tickConfetti);
}

/* ===================================================================
   2. Countdown to Oct 4, 2026, 6:00 PM (Eastern time venue)
   =================================================================== */
const WEDDING_DATE = new Date('2026-10-04T18:00:00-04:00');

function updateCountdown(){
  const now = new Date();
  let diff = WEDDING_DATE - now;
  if(diff < 0) diff = 0;

  const days = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff / (1000*60*60)) % 24);
  const mins = Math.floor((diff / (1000*60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  const set = (id, val) => {
    const el = document.getElementById(id);
    if(el) el.textContent = String(val).padStart(2, '0');
  };
  set('cd-days', days);
  set('cd-hours', hours);
  set('cd-mins', mins);
  set('cd-secs', secs);
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ===================================================================
   3. RSVP submission -> Google Sheet (via Apps Script Web App)
   =================================================================== */
const rsvpForm = document.getElementById('rsvpForm');
const rsvpStatus = document.getElementById('rsvpStatus');
const rsvpSubmit = document.getElementById('rsvpSubmit');

rsvpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if(GOOGLE_SCRIPT_URL.includes('PASTE_YOUR')){
    rsvpStatus.textContent = "RSVP isn't connected yet — see README.md to link your Google Sheet.";
    rsvpStatus.className = 'rsvp-status error';
    return;
  }

  const formData = new FormData(rsvpForm);
  const payload = {
    name: formData.get('name'),
    attending: formData.get('attending'),
    submittedAt: new Date().toISOString()
  };

  rsvpSubmit.disabled = true;
  rsvpSubmit.textContent = 'Sending...';
  rsvpStatus.textContent = '';
  rsvpStatus.className = 'rsvp-status';

  try{
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    rsvpStatus.textContent = 'Thank you! Your RSVP has been received. 💐';
    rsvpStatus.className = 'rsvp-status success';
    rsvpForm.reset();
    setTimeout(closeRsvpModal, 1800);
  }catch(err){
    rsvpStatus.textContent = "Something went wrong — please try again, or reach out directly.";
    rsvpStatus.className = 'rsvp-status error';
  }finally{
    rsvpSubmit.disabled = false;
    rsvpSubmit.textContent = 'Send RSVP';
  }
});
