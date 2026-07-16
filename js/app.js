/* ============================================================
   AURA SCANNER — App logic
   - camera permission + fallback
   - 3-second scanning animation
   - result reveal
   - share as image (Web Share API + canvas fallback)
   ============================================================ */

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const screens = {
    intro: $('screen-intro'),
    scan: $('screen-scan'),
    result: $('screen-result'),
  };

  const camera = $('camera');
  const cameraFallback = $('camera-fallback');
  const scanStatus = $('scan-status');
  const progressBar = $('progress-bar');
  const particles = $('particles');

  const resultTitle = $('result-title');
  const resultColorName = $('result-color-name');
  const resultReading = $('result-reading');
  const resultOrb = $('result-orb');
  const resultScreen = $('screen-result');

  const shareCanvas = $('share-canvas');

  const SCAN_DURATION = 3000;
  const STATUS_MESSAGES = [
    'Align yourself with the light…',
    'Reading your energy field…',
    'Tracing the colors within…',
    'Almost there…'
  ];

  // ---- Screen navigation ----
  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle('active', key === name);
    });
  }

  // ---- Camera setup ----
  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      document.body.classList.add('no-camera');
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false,
      });
      camera.srcObject = stream;
      await camera.play().catch(() => {});
      return true;
    } catch (err) {
      console.warn('Camera denied or unavailable:', err);
      document.body.classList.add('no-camera');
      return false;
    }
  }

  function stopCamera() {
    const stream = camera.srcObject;
    if (stream && stream.getTracks) {
      stream.getTracks().forEach(t => t.stop());
    }
    camera.srcObject = null;
  }

  // ---- Scanning animation ----
  function spawnParticles() {
    particles.innerHTML = '';
    const N = 18;
    for (let i = 0; i < N; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      const angle = (Math.PI * 2 * i) / N + Math.random() * 0.3;
      const dist = 80 + Math.random() * 60;
      p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      p.style.animationDelay = `${Math.random() * 2}s`;
      p.style.left = '50%';
      p.style.top = '50%';
      p.style.marginLeft = '-2px';
      p.style.marginTop = '-2px';
      particles.appendChild(p);
    }
  }

  function runScan() {
    return new Promise((resolve) => {
      screens.scan.classList.add('scanning');
      spawnParticles();
      const start = performance.now();

      // Cycle status messages
      let msgIdx = 0;
      scanStatus.textContent = STATUS_MESSAGES[0];
      const msgInterval = setInterval(() => {
        msgIdx = (msgIdx + 1) % STATUS_MESSAGES.length;
        scanStatus.textContent = STATUS_MESSAGES[msgIdx];
      }, SCAN_DURATION / STATUS_MESSAGES.length);

      function tick(now) {
        const elapsed = now - start;
        const pct = Math.min(100, (elapsed / SCAN_DURATION) * 100);
        progressBar.style.width = pct + '%';
        if (elapsed < SCAN_DURATION) {
          requestAnimationFrame(tick);
        } else {
          clearInterval(msgInterval);
          screens.scan.classList.remove('scanning');
          progressBar.style.width = '0%';
          resolve();
        }
      }
      requestAnimationFrame(tick);
    });
  }

  // ---- Result rendering ----
  function showResult(aura) {
    resultTitle.textContent = aura.title;
    resultColorName.textContent = aura.name;
    resultReading.textContent = aura.reading;

    // Color the orb
    resultScreen.style.setProperty('--aura-color', aura.color);
    resultScreen.style.setProperty('--aura-glow', aura.glow);
    resultOrb.style.setProperty('--aura-color', aura.color);
    resultOrb.style.setProperty('--aura-glow', aura.glow);

    showScreen('result');
    stopCamera();
  }

  // ---- Share as image ----
  async function shareResult(aura) {
    // Wait for fonts so Cinzel renders correctly in the exported PNG
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (_) {}
    }

    const ctx = shareCanvas.getContext('2d');
    const W = shareCanvas.width;
    const H = shareCanvas.height;

    // Background
    const bg = ctx.createRadialGradient(W / 2, H * 0.4, 50, W / 2, H / 2, W * 0.7);
    bg.addColorStop(0, '#1a0d2e');
    bg.addColorStop(1, '#0a0612');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = Math.random() * 1.5;
      ctx.globalAlpha = 0.3 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Orb glow
    const orbX = W / 2;
    const orbY = H * 0.42;
    const orbR = 140;
    const glow = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, orbR * 2.2);
    glow.addColorStop(0, aura.glow);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Orb core
    const core = ctx.createRadialGradient(
      orbX - orbR * 0.3, orbY - orbR * 0.3, 5,
      orbX, orbY, orbR
    );
    core.addColorStop(0, 'rgba(255,255,255,0.95)');
    core.addColorStop(0.3, aura.color);
    core.addColorStop(0.7, shadeColor(aura.color, -50));
    core.addColorStop(1, '#0a0612');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2);
    ctx.fill();

    // Title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f3eaff';
    ctx.font = '500 28px "Cinzel", serif';
    ctx.letterSpacing = '8px';
    ctx.fillText('YOUR AURA REVEALS', W / 2, H * 0.72);

    ctx.fillStyle = aura.color;
    ctx.font = '600 64px "Cinzel", serif';
    ctx.shadowColor = aura.glow;
    ctx.shadowBlur = 30;
    ctx.fillText(aura.name.toUpperCase(), W / 2, H * 0.78);
    ctx.shadowBlur = 0;

    // Footer
    ctx.fillStyle = '#6c5f8a';
    ctx.font = 'italic 18px "Cormorant Garamond", serif';
    ctx.fillText('For entertainment purposes only', W / 2, H * 0.92);

    // Brand
    ctx.fillStyle = '#b4a4d4';
    ctx.font = '500 16px "Cinzel", serif';
    ctx.fillText('AURA SCANNER', W / 2, H * 0.96);

    // Export
    const blob = await new Promise(res => shareCanvas.toBlob(res, 'image/png'));
    const file = new File([blob], `aura-${aura.id}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: aura.title,
          text: `My aura is ${aura.name}. Discover yours.`,
          files: [file],
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    // Fallback: download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-${aura.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function shadeColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + percent));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
    const b = Math.max(0, Math.min(255, (num & 0xff) + percent));
    return `rgb(${r}, ${g}, ${b})`;
  }

  // ---- Flow ----
  let currentAura = null;

  async function beginScanning() {
    showScreen('scan');
    await startCamera();
    await runScan();
    currentAura = pickRandomAura();
    showResult(currentAura);
  }

  // ---- Wire up ----
  $('btn-start').addEventListener('click', beginScanning);
  $('btn-again').addEventListener('click', beginScanning);
  $('btn-share').addEventListener('click', () => {
    if (currentAura) shareResult(currentAura);
  });

  // ---- Demo mode: ?demo=intro|scan|result[&aura=gold|violet|...]
  // Used for QA / screenshots without granting camera permission.
  const params = new URLSearchParams(location.search);
  const demo = params.get('demo');
  if (demo) {
    const auraName = (params.get('aura') || 'violet').toLowerCase();
    const aura = AURAS.find(a => a.id === auraName) || AURAS[1];
    if (demo === 'intro') {
      showScreen('intro');
    } else if (demo === 'scan') {
      // Show scan screen with the status text + rings, no camera
      document.body.classList.add('no-camera');
      screens.scan.classList.add('scanning');
      spawnParticles();
      progressBar.style.width = '60%';
      scanStatus.textContent = STATUS_MESSAGES[2];
      showScreen('scan');
    } else if (demo === 'result') {
      currentAura = aura;
      showResult(aura);
    }
  }

  // Service worker (optional, PWA install)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
