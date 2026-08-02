/* ===================================================================
   CONFIG — the only line you need to touch for RSVP-to-Google-Sheet
   =================================================================== */
// Paste the URL you get from deploying the Apps Script (see README.md) here:
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwffZd-VOOD_VAW_RDxtbqnQH6ISD7-bUYkS0uaeXZmdsN_2QvFcfywUzUTspXoUlXW/exec";

/* ===================================================================
   1. Opening card (3D flip)
   =================================================================== */
const opener = document.getElementById('opener');
const openerCard = document.getElementById('openerCard');
const openBtn = document.getElementById('openBtn');
const invite = document.getElementById('invite');

function openInvitation(){
  openerCard.classList.add('is-open');
  invite.hidden = false;
  document.body.style.overflow = '';
  setTimeout(() => {
    opener.classList.add('is-hidden');
    revealOnScroll(); // trigger initial reveal check
  }, 650);
}
document.body.style.overflow = 'hidden';
openBtn.addEventListener('click', (e) => { e.stopPropagation(); openInvitation(); });
opener.addEventListener('click', openInvitation);

/* ===================================================================
   2. Scroll reveal
   =================================================================== */
function revealOnScroll(){
  document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight * 0.88){
      el.classList.add('is-visible');
    }
  });
}
window.addEventListener('scroll', revealOnScroll, { passive: true });
window.addEventListener('resize', revealOnScroll);

/* ===================================================================
   3. Countdown to Oct 4, 2026, 6:00 PM (Eastern time venue)
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
   4. Floating pastel petals (generated, layered for a soft 3D drift)
   =================================================================== */
const petalField = document.getElementById('petalField');
const petalColors = ['#f6dde3', '#e7dbf6', '#dceee1', '#d9a6a0', '#c9a876'];

function makePetals(count){
  for(let i = 0; i < count; i++){
    const p = document.createElement('div');
    p.className = 'petal';
    const size = 10 + Math.random() * 22;
    const depth = Math.random(); // 0 = far/small/slow, 1 = near/big/fast
    p.style.width = `${size}px`;
    p.style.height = `${size * 0.8}px`;
    p.style.left = `${Math.random() * 100}vw`;
    p.style.top = `${Math.random() * 100}vh`;
    p.style.background = petalColors[Math.floor(Math.random() * petalColors.length)];
    p.style.opacity = 0.25 + depth * 0.4;
    p.dataset.depth = depth.toFixed(2);
    p.dataset.baseY = p.style.top;
    p.dataset.driftSpeed = (4 + depth * 10).toFixed(2);
    p.dataset.rot = Math.random() * 360;
    petalField.appendChild(p);
  }
}
makePetals(window.innerWidth < 640 ? 12 : 22);

let ticks = 0;
function animatePetals(){
  ticks += 0.5;
  document.querySelectorAll('.petal').forEach((p, i) => {
    const depth = parseFloat(p.dataset.depth);
    const speed = parseFloat(p.dataset.driftSpeed);
    const rot = parseFloat(p.dataset.rot);
    const sway = Math.sin((ticks + i * 10) / (30 - depth * 15)) * (10 + depth * 20);
    const fall = ((ticks * speed * 0.15) + i * 40) % (window.innerHeight + 100) - 100;
    const z = depth * 60;
    p.style.transform = `translate3d(${sway}px, ${fall}px, ${z}px) rotate(${rot + ticks}deg)`;
  });
  requestAnimationFrame(animatePetals);
}
requestAnimationFrame(animatePetals);

/* ===================================================================
   5. Pointer-tilt 3D cards (hero date/venue card + venue motif)
   =================================================================== */
function attachTilt(el, strength = 10){
  if(!el) return;
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateY(${x * strength}deg) rotateX(${-y * strength}deg)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}
attachTilt(document.querySelector('.hero-card-inner'), 8);
attachTilt(document.getElementById('venueTilt'), 14);

/* ===================================================================
   6. RSVP submission -> Google Sheet (via Apps Script Web App)
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
      mode: 'no-cors', // Apps Script web apps don't return CORS headers to fetch
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    // no-cors means we can't read the response, so we optimistically confirm
    rsvpStatus.textContent = 'Thank you! Your RSVP has been received. 💐';
    rsvpStatus.className = 'rsvp-status success';
    rsvpForm.reset();
  }catch(err){
    rsvpStatus.textContent = "Something went wrong — please try again, or reach out directly.";
    rsvpStatus.className = 'rsvp-status error';
  }finally{
    rsvpSubmit.disabled = false;
    rsvpSubmit.textContent = 'Send RSVP';
  }
});
