(() => {
  const loader = document.querySelector('.site-loader');
  const progressBar = document.querySelector('.scroll-progress span');
  const cursorGlow = document.querySelector('.cursor-glow');
  const soundToggle = document.querySelector('.sound-toggle');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('load', () => {
    window.setTimeout(() => {
      document.body.classList.add('loaded');
      loader?.classList.add('is-hidden');
    }, 420);
  });

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progressBar) progressBar.style.width = `${pct}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  window.addEventListener('pointermove', (event) => {
    if (prefersReducedMotion || !cursorGlow) return;
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });

  // Small original ambient pad, generated only after a deliberate click.
  let audioCtx;
  let masterGain;
  let ambienceOn = false;

  function createAmbientPad() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.0001;
    masterGain.connect(audioCtx.destination);

    [146.83, 220.0, 293.66].forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();

      osc.type = index === 1 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      gain.gain.value = index === 1 ? 0.045 : 0.022;
      lfo.frequency.value = 0.05 + (index * 0.018);
      lfoGain.gain.value = 0.013;

      lfo.connect(lfoGain).connect(gain.gain);
      osc.connect(gain).connect(masterGain);
      osc.start();
      lfo.start();
    });
  }

  soundToggle?.addEventListener('click', async () => {
    if (!audioCtx) createAmbientPad();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    ambienceOn = !ambienceOn;
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(ambienceOn ? 0.028 : 0.0001, audioCtx.currentTime + 0.45);

    soundToggle.classList.toggle('active', ambienceOn);
    soundToggle.setAttribute('aria-pressed', String(ambienceOn));
    soundToggle.setAttribute('aria-label', ambienceOn ? 'Turn ambience off' : 'Turn ambience on');
    const label = soundToggle.querySelector('.sound-label');
    if (label) label.textContent = ambienceOn ? 'sound on' : 'ambience';
  });

  // Countdown: Indian Standard Time (UTC+05:30), 24 June 2026 at 00:00.
  const deadline = new Date('2026-06-23T18:30:00Z').getTime();
  const timer = document.querySelector('.timer');
  const afterCountdown = document.querySelector('.after-countdown');
  const output = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
  };

  const pad = (number) => String(number).padStart(2, '0');
  function tick() {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      Object.values(output).forEach((el) => { if (el) el.textContent = '00'; });
      timer?.setAttribute('hidden', '');
      afterCountdown?.removeAttribute('hidden');
      return;
    }

    const total = Math.floor(remaining / 1000);
    const values = {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60
    };

    Object.entries(values).forEach(([key, value]) => {
      const node = output[key];
      if (!node) return;
      const next = pad(value);
      if (node.textContent !== next) {
        node.textContent = next;
        node.animate(
          [{ opacity: .35, transform: 'translateY(-3px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 220, easing: 'ease-out' }
        );
      }
    });
  }
  tick();
  window.setInterval(tick, 1000);

  // Tilt preserves each card's original scrapbook rotation through CSS custom properties.
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--tilt-x', `${-y * 4.5}deg`);
        card.style.setProperty('--tilt-y', `${x * 5.5}deg`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  // Scroll reveals only change classes. This keeps every base rotation and CSS Grid position intact.
  if (!prefersReducedMotion) {
    const items = document.querySelectorAll('.reveal-card, .reveal-group, .chapter-mark');
    const reveal = (element) => element.classList.add('is-visible');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          obs.unobserve(entry.target);
        });
      }, { threshold: .10, rootMargin: '0px 0px -42px 0px' });
      items.forEach((item) => observer.observe(item));
    } else {
      items.forEach(reveal);
    }
  } else {
    document.querySelectorAll('.reveal-card, .reveal-group, .chapter-mark').forEach((item) => item.classList.add('is-visible'));
  }
})();
