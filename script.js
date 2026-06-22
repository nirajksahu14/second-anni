(() => {
  const loader = document.querySelector('.site-loader');
  const progress = document.querySelector('.scroll-progress span');
  const cursorGlow = document.querySelector('.cursor-glow');
  const soundToggle = document.querySelector('.sound-toggle');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('load', () => {
    window.setTimeout(() => {
      document.body.classList.add('loaded');
      loader?.classList.add('is-hidden');
    }, 440);
  });

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${pct}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  window.addEventListener('pointermove', (event) => {
    if (reduceMotion || !cursorGlow) return;
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });

  // Soft original ambience, generated in-browser after an intentional click.
  let audioCtx;
  let masterGain;
  let ambienceOn = false;
  function createAmbience() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.0001;
    masterGain.connect(audioCtx.destination);

    [130.81, 196.00, 261.63].forEach((frequency, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      osc.type = index === 1 ? 'sine' : 'triangle';
      osc.frequency.value = frequency;
      gain.gain.value = index === 1 ? 0.04 : 0.02;
      lfo.frequency.value = .045 + index * .02;
      lfoGain.gain.value = .012;
      lfo.connect(lfoGain).connect(gain.gain);
      osc.connect(gain).connect(masterGain);
      osc.start();
      lfo.start();
    });
  }

  soundToggle?.addEventListener('click', async () => {
    if (!audioCtx) createAmbience();
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    ambienceOn = !ambienceOn;
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(ambienceOn ? .026 : .0001, audioCtx.currentTime + .45);
    soundToggle.classList.toggle('active', ambienceOn);
    soundToggle.setAttribute('aria-pressed', String(ambienceOn));
    soundToggle.setAttribute('aria-label', ambienceOn ? 'Turn ambience off' : 'Turn ambience on');
    const label = soundToggle.querySelector('.sound-label');
    if (label) label.textContent = ambienceOn ? 'sound on' : 'ambience';
  });

  // 24 June 2026, 12:00 AM IST is 23 June 2026, 18:30 UTC.
  const deadline = new Date('2026-06-23T18:30:00Z').getTime();
  const timer = document.querySelector('.timer');
  const after = document.querySelector('.after-countdown');
  const fields = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
  };
  const pad = (value) => String(value).padStart(2, '0');
  function updateTimer() {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      Object.values(fields).forEach((field) => { if (field) field.textContent = '00'; });
      timer?.setAttribute('hidden', '');
      after?.removeAttribute('hidden');
      return;
    }
    const sec = Math.floor(remaining / 1000);
    const values = {
      days: Math.floor(sec / 86400),
      hours: Math.floor((sec % 86400) / 3600),
      minutes: Math.floor((sec % 3600) / 60),
      seconds: sec % 60
    };
    Object.entries(values).forEach(([key, value]) => {
      const field = fields[key];
      if (!field) return;
      const next = pad(value);
      if (field.textContent !== next) {
        field.textContent = next;
        field.animate([
          { opacity: .35, transform: 'translateY(-3px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 220, easing: 'ease-out' });
      }
    });
  }
  updateTimer();
  window.setInterval(updateTimer, 1000);

  // Tilt uses CSS variables; it never overwrites the card's original positioning or rotation.
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty('--tilt-x', `${-y * 4.5}deg`);
        card.style.setProperty('--tilt-y', `${x * 5.5}deg`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  // Intersection-based reveals avoid transform conflicts with scrapbook cards.
  const revealables = document.querySelectorAll('.reveal-card, .reveal-group, .chapter-mark');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: .10, rootMargin: '0px 0px -44px 0px' });
    revealables.forEach((item) => observer.observe(item));
  }
})();
