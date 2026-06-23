(() => {
  // Static hosting can only use a client-side time gate. This target is 24 June 2026, 12:00 AM IST (UTC+05:30).
  const RELEASE_AT = Date.UTC(2026, 5, 23, 18, 30, 0);
  const releaseGate = document.getElementById('waitGate');
  const anniversaryApp = document.getElementById('anniversaryApp');

  function pad(number) {
    return String(number).padStart(2, '0');
  }

  function renderReleaseCountdown(remaining) {
    const safe = Math.max(0, remaining);
    const totalSeconds = Math.floor(safe / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    document.getElementById('releaseDays').textContent = pad(days);
    document.getElementById('releaseHours').textContent = pad(hours);
    document.getElementById('releaseMinutes').textContent = pad(minutes);
    document.getElementById('releaseSeconds').textContent = pad(seconds);
  }

  function beginReleaseGate() {
    document.body.classList.add('countdown-lock');
    anniversaryApp?.setAttribute('aria-hidden', 'true');
    releaseGate.hidden = false;
    const note = document.getElementById('releaseNote');
    const heartbeat = window.setInterval(() => {
      const remaining = RELEASE_AT - Date.now();
      renderReleaseCountdown(remaining);
      if (remaining <= 0) {
        window.clearInterval(heartbeat);
        note.textContent = 'It is time. Opening your surprise… ✦';
        releaseGate.classList.add('is-opening');
        window.setTimeout(() => window.location.reload(), 1150);
      }
    }, 250);
    renderReleaseCountdown(RELEASE_AT - Date.now());
  }

  if (Date.now() < RELEASE_AT) {
    beginReleaseGate();
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const prelude = document.getElementById('prelude');
  const preludeCopy = document.getElementById('preludeCopy');
  const typewriterLine = document.getElementById('typewriterLine');
  const infinityStage = document.getElementById('infinityStage');
  const mainStory = document.getElementById('mainStory');
  const music = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  let musicOn = false;
  let chaseFrame = null;
  let chaseStartedAt = 0;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function setMusic(on) {
    musicOn = on;
    music.volume = 0.032;
    music.playbackRate = 0.93;
    if (on) music.play().catch(() => {});
    else music.pause();
    musicToggle.classList.toggle('active', on);
    musicToggle.setAttribute('aria-pressed', String(on));
    musicToggle.setAttribute('aria-label', on ? 'Pause background music' : 'Play background music');
    musicToggle.querySelector('b').textContent = on ? 'Music on' : 'Music';
  }

  musicToggle.addEventListener('click', () => setMusic(!musicOn));
  document.addEventListener('pointerdown', (event) => {
    if (!musicOn && !event.target.closest('#musicToggle')) setMusic(true);
  }, { once: true, passive: true });

  async function typeText(text, speed = 70) {
    typewriterLine.textContent = '';
    for (const character of text) {
      typewriterLine.textContent += character;
      await wait(prefersReducedMotion ? 0 : speed);
    }
  }

  async function deleteText(speed = 38) {
    while (typewriterLine.textContent.length) {
      typewriterLine.textContent = typewriterLine.textContent.slice(0, -1);
      await wait(prefersReducedMotion ? 0 : speed);
    }
  }

  function startInfinityChase() {
    const path = document.getElementById('infinityPath');
    const dotOne = document.querySelector('.dot-one');
    const dotTwo = document.querySelector('.dot-two');
    if (!path || !dotOne || !dotTwo || !path.getTotalLength) return;

    const length = path.getTotalLength();
    chaseStartedAt = performance.now();

    const follow = (now) => {
      const elapsed = (now - chaseStartedAt) / 1000;
      const pace = length / 6.6;
      const onePoint = path.getPointAtLength((elapsed * pace) % length);
      const twoPoint = path.getPointAtLength((length * 0.52 + elapsed * pace * 1.035) % length);
      dotOne.setAttribute('cx', onePoint.x.toFixed(2));
      dotOne.setAttribute('cy', onePoint.y.toFixed(2));
      dotTwo.setAttribute('cx', twoPoint.x.toFixed(2));
      dotTwo.setAttribute('cy', twoPoint.y.toFixed(2));
      chaseFrame = requestAnimationFrame(follow);
    };
    chaseFrame = requestAnimationFrame(follow);
  }

  function finishInfinityChase() {
    if (chaseFrame) cancelAnimationFrame(chaseFrame);
    const dotOne = document.querySelector('.dot-one');
    const dotTwo = document.querySelector('.dot-two');
    dotOne?.setAttribute('cx', '280');
    dotOne?.setAttribute('cy', '198');
    dotTwo?.setAttribute('cx', '280');
    dotTwo?.setAttribute('cy', '198');
  }

  function easeInOutQuart(value) {
    return value < 0.5
      ? 8 * value * value * value * value
      : 1 - Math.pow(-2 * value + 2, 4) / 2;
  }

  function animateCount(node, target, duration = 2000) {
    if (!node) return;
    const start = performance.now();
    const pad = Number(node.dataset.pad || 0);
    const render = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const value = Math.round(target * easeInOutQuart(progress));
      node.textContent = pad ? String(value).padStart(pad, '0') : String(value);
      if (progress < 1) {
        requestAnimationFrame(render);
      } else {
        node.textContent = pad ? String(target).padStart(pad, '0') : String(target);
        node.closest('article')?.classList.add('counted');
      }
    };
    requestAnimationFrame(render);
  }

  function startHubSequence() {
    const hub = document.getElementById('hub');
    if (!hub || hub.dataset.played === 'true') return;
    hub.dataset.played = 'true';
    hub.classList.add('hub-live');

    const offset = prefersReducedMotion ? 0 : 0;
    window.setTimeout(() => animateCount(document.getElementById('heroYears'), 2, 1900), offset + 1500);

    const metrics = [...document.querySelectorAll('.anniversary-count b[data-target]')];
    const durations = [1600, 1800, 2000, 2200, 2400];
    const starts = [4800, 6700, 8800, 11100, 13600];
    metrics.forEach((node, index) => {
      window.setTimeout(() => animateCount(node, Number(node.dataset.target), durations[index]), prefersReducedMotion ? 0 : starts[index]);
    });
  }

  async function revealMainStory() {
    finishInfinityChase();
    infinityStage.classList.add('collide');
    await wait(prefersReducedMotion ? 180 : 1350);
    prelude.classList.add('is-gone');
    mainStory.classList.add('ready');
    mainStory.removeAttribute('aria-hidden');
    body.classList.remove('prelude-open');
    startHubSequence();
    await wait(prefersReducedMotion ? 0 : 180);
    document.getElementById('hub').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  async function runPrelude() {
    await wait(prefersReducedMotion ? 50 : 850);
    preludeCopy.classList.add('type-ready');
    const messages = [
      'Two years of choosing each other.',
      'Two years of becoming home.',
      'Two years of us.'
    ];

    for (let index = 0; index < messages.length; index += 1) {
      const finalLine = index === messages.length - 1;
      typewriterLine.parentElement.classList.toggle('final-line', finalLine);
      await typeText(messages[index], finalLine ? 78 : 68);
      await wait(prefersReducedMotion ? 90 : (finalLine ? 1350 : 1050));
      if (!finalLine) {
        typewriterLine.parentElement.classList.add('fade-delete');
        await wait(prefersReducedMotion ? 0 : 340);
        await deleteText(38);
        typewriterLine.parentElement.classList.remove('fade-delete');
        await wait(prefersReducedMotion ? 0 : 440);
      }
    }

    preludeCopy.classList.add('zoom-away');
    await wait(prefersReducedMotion ? 60 : 1100);
    infinityStage.classList.add('active');
    startInfinityChase();
    await wait(prefersReducedMotion ? 380 : 6600);
    revealMainStory();
  }
  runPrelude();

  // Scroll progress.
  const progress = document.querySelector('.progress span');
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Puzzle flow.
  const puzzleOverlay = document.getElementById('puzzleOverlay');
  document.body.appendChild(puzzleOverlay);
  const puzzlePanel = puzzleOverlay.querySelector('.puzzle-panel');
  const secretCard = document.getElementById('secretCard');
  const closePuzzle = document.getElementById('closePuzzle');
  const puzzleBackdrop = document.getElementById('puzzleBackdrop');
  const form = document.getElementById('puzzleForm');
  const steps = [...document.querySelectorAll('.quiz-step')];
  const progressNodes = [...document.querySelectorAll('.puzzle-progress span')];
  const previous = document.getElementById('previousQuestion');
  const next = document.getElementById('nextQuestion');
  const thinkingHint = document.getElementById('thinkingHint');
  const contactHint = document.getElementById('contactHint');
  const dateHint = document.getElementById('dateHint');
  const locked = document.getElementById('lockedContent');
  let currentStep = 1;

  function currentQuizStep() {
    return steps.find((step) => Number(step.dataset.step) === currentStep);
  }

  function focusCurrentStep() {
    const active = currentQuizStep();
    const target = active?.querySelector('input[type="text"], input[type="radio"]');
    target?.focus({ preventScroll: true });
  }

  function openPuzzle() {
    if (!musicOn) setMusic(true);
    puzzleOverlay.classList.add('open');
    puzzleOverlay.setAttribute('aria-hidden', 'false');
    body.classList.add('puzzle-open');
    requestAnimationFrame(() => window.setTimeout(focusCurrentStep, 180));
  }

  function closeQuiz() {
    puzzleOverlay.classList.remove('open');
    puzzleOverlay.setAttribute('aria-hidden', 'true');
    body.classList.remove('puzzle-open');
    secretCard.focus({ preventScroll: true });
  }

  secretCard.addEventListener('click', openPuzzle);
  secretCard.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPuzzle();
    }
  });
  closePuzzle.addEventListener('click', closeQuiz);
  puzzleBackdrop.addEventListener('click', closeQuiz);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && puzzleOverlay.classList.contains('open')) closeQuiz();
  });

  function renderStep() {
    steps.forEach((step) => step.classList.toggle('active', Number(step.dataset.step) === currentStep));
    progressNodes.forEach((node, index) => node.classList.toggle('active', index < currentStep));
    previous.disabled = currentStep === 1;
    next.innerHTML = currentStep === 4
      ? 'Unlock our forever <span aria-hidden="true">✦</span>'
      : 'Continue <span aria-hidden="true">→</span>';
    puzzlePanel.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    requestAnimationFrame(() => window.setTimeout(focusCurrentStep, 180));
  }

  function normalizeAnswer(value) {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function validateStep() {
    if (currentStep === 1) {
      return document.querySelector('input[name="loveMost"]:checked')?.value === 'd';
    }
    if (currentStep === 2) {
      const accepted = ['lipi', 'mousumi', 'mousumi monalisha', 'maakdi', 'me'];
      const valid = accepted.includes(normalizeAnswer(document.getElementById('thinkingAnswer').value));
      thinkingHint.textContent = valid ? '' : 'It’s you, dumbo — type your name to move forward.';
      return valid;
    }
    if (currentStep === 3) {
      const valid = document.querySelector('input[name="contactName"]:checked')?.value === 'c';
      contactHint.textContent = valid ? '' : 'Not quite. Pick the most unserious nickname. ✦';
      return valid;
    }
    const answer = document.getElementById('dateAnswer').value.trim().replace(/[.\-\s]/g, '/').replace(/\/+/, '/');
    const valid = answer === '20/06/2024';
    dateHint.textContent = valid ? '' : 'Almost. Think of the first day we called a date. ✦';
    return valid;
  }

  function nudgeInvalid() {
    const active = currentQuizStep();
    active.classList.add('is-invalid');
    active.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-8px)' },
      { transform: 'translateX(8px)' },
      { transform: 'translateX(0)' }
    ], { duration: 520, easing: 'cubic-bezier(.22,.61,.36,1)' });
    window.setTimeout(() => active.classList.remove('is-invalid'), 680);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateStep()) {
      nudgeInvalid();
      return;
    }
    if (currentStep < 4) {
      currentStep += 1;
      renderStep();
      return;
    }
    closeQuiz();
    locked.classList.add('unlocked');
    locked.removeAttribute('aria-hidden');
    window.setTimeout(() => {
      document.getElementById('letter').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }, 500);
  });

  previous.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep -= 1;
      renderStep();
    }
  });

  // Scroll reveals.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal-card, .reveal-on-scroll').forEach((el) => observer.observe(el));

  // Stardust at touch/click locations.
  function stardust(x, y) {
    if (prefersReducedMotion) return;
    const colors = ['#f8d388', '#d98b98', '#a9c5f3', '#fff1c6'];
    for (let i = 0; i < 13; i += 1) {
      const dot = document.createElement('i');
      dot.className = 'stardust';
      const angle = Math.random() * Math.PI * 2;
      const distance = 22 + Math.random() * 70;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      dot.style.setProperty('--dust-x', `${Math.cos(angle) * distance}px`);
      dot.style.setProperty('--dust-y', `${Math.sin(angle) * distance}px`);
      dot.style.setProperty('--dust-color', colors[i % colors.length]);
      document.body.appendChild(dot);
      window.setTimeout(() => dot.remove(), 1250);
    }
  }
  window.addEventListener('pointerdown', (event) => stardust(event.clientX, event.clientY), { passive: true });
})();
