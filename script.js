(() => {
  const loader = document.querySelector('.site-loader');
  const progressBar = document.querySelector('.scroll-progress span');
  const cursorGlow = document.querySelector('.cursor-glow');
  const soundToggle = document.querySelector('.sound-toggle');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('load', () => {
    setTimeout(() => {
      document.body.classList.add('loaded');
      loader.classList.add('is-hidden');
    }, 480);
  });

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = `${pct}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  window.addEventListener('pointermove', (event) => {
    if (prefersReducedMotion || !cursorGlow) return;
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });

  // A tiny, original ambient pad generated in-browser. It starts only after an intentional click.
  let audioCtx;
  let masterGain;
  let ambienceOn = false;
  let oscillators = [];
  function createAmbientPad() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.028;
    masterGain.connect(audioCtx.destination);

    [146.83, 220.0, 293.66].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      osc.type = i === 1 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      gain.gain.value = i === 1 ? 0.045 : 0.022;
      lfo.frequency.value = 0.05 + (i * 0.018);
      lfoGain.gain.value = 0.013;
      lfo.connect(lfoGain).connect(gain.gain);
      osc.connect(gain).connect(masterGain);
      osc.start(); lfo.start();
      oscillators.push(osc, lfo);
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
    soundToggle.querySelector('.sound-label').textContent = ambienceOn ? 'sound on' : 'ambience';
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
      Object.values(output).forEach(el => { if (el) el.textContent = '00'; });
      timer?.setAttribute('hidden', '');
      afterCountdown?.removeAttribute('hidden');
      return;
    }
    const total = Math.floor(remaining / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    output.days.textContent = pad(days);
    output.hours.textContent = pad(hours);
    output.minutes.textContent = pad(minutes);
    output.seconds.textContent = pad(seconds);
  }
  tick();
  setInterval(tick, 1000);

  // Gentle physical tilt only where a fine pointer is available.
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const originalTransform = getComputedStyle(card).transform;
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-5px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // Scroll cinematics with GSAP when available; content remains fully readable without it.
  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.stagger-lines p').forEach((line) => {
      gsap.from(line, {
        y: 26,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: line, start: 'top 87%', once: true }
      });
    });
    gsap.utils.toArray('.chapter-mark').forEach((mark) => {
      gsap.from(mark, { x: -20, opacity: 0, duration: .8, scrollTrigger: { trigger: mark, start: 'top 92%', once: true } });
    });
    gsap.from('.hero-copy > *', { y: 35, opacity: 0, duration: 1.05, stagger: .13, delay: .55, ease: 'power3.out' });
    gsap.from('.route-card', { y: 55, opacity: 0, rotate: -8, duration: 1.15, scrollTrigger: { trigger: '.confession', start: 'top 65%', once: true }});
    gsap.from('.call-stage', { y: 80, opacity: 0, rotate: 14, duration: 1.2, scrollTrigger: { trigger: '.calls', start: 'top 55%', once: true }});
    gsap.from('.realization', { x: 48, opacity: 0, stagger: .16, duration: .9, scrollTrigger: { trigger: '.small-realizations', start: 'top 84%', once: true }});
    gsap.from('.photo-one', { y: 80, opacity: 0, rotate: -14, duration: 1.1, scrollTrigger: { trigger: '.memory-gallery', start: 'top 75%', once: true }});
    gsap.from('.photo-two', { y: 80, opacity: 0, rotate: 13, duration: 1.1, delay:.18, scrollTrigger: { trigger: '.memory-gallery', start: 'top 75%', once: true }});
    gsap.from('.calendar-stack span', { y: -65, opacity: 0, stagger: .12, duration: .8, scrollTrigger: { trigger: '.distance', start: 'top 58%', once: true }});
    gsap.from('.silence-card', { y: 55, opacity: 0, duration: 1, scrollTrigger: { trigger: '.silence-card', start: 'top 87%', once: true }});
    gsap.from('.phone-message', { y: 80, opacity: 0, rotate: 12, duration: 1.1, scrollTrigger: { trigger: '.holi', start: 'top 55%', once: true }});
    gsap.from('.locked-book', { y: 80, opacity: 0, duration: 1.15, scrollTrigger: { trigger: '.epilogue', start: 'top 60%', once: true }});

    gsap.to('.bus-window', { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero-bus', start: 'top top', end: 'bottom top', scrub: 1.2 } });
    gsap.to('.phone-glow', { y: 48, rotation: -17, ease: 'none', scrollTrigger: { trigger: '.hero-bus', start: 'top top', end: 'bottom top', scrub: 1.2 } });
    gsap.to('.sun-bleed', { y: 140, x: -80, ease: 'none', scrollTrigger: { trigger: '.scrapbook', start: 'top bottom', end: 'bottom top', scrub: 1.3 } });
  }
})();
