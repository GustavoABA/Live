(() => {
  const params = new URLSearchParams(location.search);
  const body = document.body;
  const scene = document.querySelector('.scene');
  const timers = [...document.querySelectorAll('[data-stopwatch]')];
  const countdowns = [...document.querySelectorAll('[data-countdown]')];
  const characters = [...document.querySelectorAll('[data-character]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionOff = params.get('motion') === '0' || reducedMotion;
  const started = Date.now();
  let tickId;
  let blinkId;

  if (params.get('guide') === '1') body.classList.add('is-guide');
  if (motionOff) body.classList.add('motion-off');

  const formatTime = seconds => {
    const safe = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
  };

  const renderTimers = () => {
    const elapsed = (Date.now() - started) / 1000;
    timers.forEach(element => { element.textContent = formatTime(elapsed); });
    countdowns.forEach(element => {
      const minutes = Number(params.get('minutes') || element.dataset.countdown || 10);
      element.textContent = formatTime(minutes * 60 - elapsed);
    });
  };

  const createAtmosphere = () => {
    if (!scene || motionOff || scene.querySelector('.atmosphere')) return;

    const atmosphere = document.createElement('div');
    atmosphere.className = 'atmosphere';
    atmosphere.setAttribute('aria-hidden', 'true');

    for (let index = 0; index < 14; index += 1) {
      const mote = document.createElement('i');
      const duration = 16 + (index % 6) * 2.8;
      const drift = -7 + (index % 5) * 3.5;
      const alpha = .18 + (index % 5) * .07;
      mote.className = 'mote';
      mote.dataset.duration = String(duration);
      mote.dataset.delay = String(-index * 1.9);
      mote.dataset.drift = String(drift);
      mote.dataset.alpha = String(alpha);
      mote.style.setProperty('--x', `${4 + ((index * 37) % 92)}%`);
      mote.style.setProperty('--size', `${2 + (index % 4)}px`);
      mote.style.setProperty('--alpha', String(alpha));
      mote.style.setProperty('--duration', `${duration}s`);
      mote.style.setProperty('--delay', `${-index * 1.9}s`);
      mote.style.setProperty('--drift', `${drift}vw`);
      atmosphere.appendChild(mote);
    }

    for (let index = 0; index < 2; index += 1) {
      const star = document.createElement('i');
      star.className = 'shooting-star';
      star.dataset.delay = String(3 + index * 7);
      star.dataset.repeatDelay = String(10 + index * 5);
      star.style.setProperty('--x', `${16 + index * 42}%`);
      star.style.setProperty('--y', `${15 + index * 22}%`);
      star.style.setProperty('--duration', `${13 + index * 7}s`);
      star.style.setProperty('--delay', `${-4 - index * 9}s`);
      atmosphere.appendChild(star);
    }

    scene.insertBefore(atmosphere, scene.querySelector('.noise'));
  };

  const animateMotes = gsap => {
    document.querySelectorAll('.mote').forEach(mote => {
      const duration = Number(mote.dataset.duration);
      const drift = Number(mote.dataset.drift);
      const alpha = Number(mote.dataset.alpha);
      const delay = Number(mote.dataset.delay);
      const timeline = gsap.timeline({ repeat: -1, delay });
      timeline
        .fromTo(mote, { x: 0, y: '5vh', scale: .45, autoAlpha: 0 }, { autoAlpha: alpha, duration: duration * .12, ease: 'power1.out' })
        .to(mote, { x: `${drift}vw`, y: '-82vh', scale: 1, duration: duration * .7, ease: 'none' })
        .to(mote, { y: '-112vh', scale: 1.18, autoAlpha: 0, duration: duration * .18, ease: 'power1.in' });
    });
  };

  const animateShootingStars = gsap => {
    document.querySelectorAll('.shooting-star').forEach(star => {
      const timeline = gsap.timeline({
        repeat: -1,
        repeatDelay: Number(star.dataset.repeatDelay),
        delay: Number(star.dataset.delay)
      });
      timeline
        .set(star, { x: '-16vw', autoAlpha: 0 })
        .to(star, { autoAlpha: 1, duration: .08 })
        .to(star, { x: '48vw', autoAlpha: 0, duration: 1.15, ease: 'power2.in' });
    });
  };

  const initGsap = () => {
    const gsap = window.gsap;
    if (!gsap || motionOff) {
      body.dataset.animationEngine = motionOff ? 'disabled' : 'css-fallback';
      return;
    }

    body.classList.add('gsap-ready');
    body.dataset.animationEngine = `gsap-${gsap.version}`;
    gsap.defaults({ force3D: true });

    if (window.SplitText) gsap.registerPlugin(window.SplitText);

    const entrance = gsap.timeline({ defaults: { duration: .8, ease: 'power3.out' } });
    const headings = [...document.querySelectorAll('.brand, .scene-index')];
    const workspace = document.querySelector('.workspace');
    const heroDetails = [...document.querySelectorAll('.eyebrow, .subtitle, .countdown')];
    if (headings.length) entrance.fromTo(headings, { y: -16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .1 });
    if (workspace) entrance.fromTo(workspace, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, '-=.46');
    if (characters.length) entrance.fromTo(characters, { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.15 }, '-=.52');
    if (heroDetails.length) entrance.fromTo(heroDetails, { y: 15, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .11 }, '-=.72');

    const title = document.querySelector('.title');
    if (title && window.SplitText) {
      const split = window.SplitText.create(title, {
        type: 'words',
        wordsClass: 'title-word++',
        aria: 'auto'
      });
      entrance.fromTo(split.words, { yPercent: 72, rotationX: -18, autoAlpha: 0 }, {
        yPercent: 0,
        rotationX: 0,
        autoAlpha: 1,
        duration: .82,
        stagger: .08,
        ease: 'back.out(1.35)'
      }, '-=.7');
    } else if (title) {
      entrance.fromTo(title, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, '-=.7');
    }

    gsap.fromTo('.backdrop', { scale: 1.025, xPercent: -.4, yPercent: 0 }, {
      scale: 1.055,
      xPercent: .6,
      yPercent: -.35,
      duration: 14,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });

    const stars = [...document.querySelectorAll('.stars i')];
    if (stars.length) {
      gsap.to(stars, {
        scale: 1.5,
        autoAlpha: 1,
        duration: 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: { each: .32, from: 'random' }
      });
    }

    characters.forEach(character => {
      gsap.to(character, {
        y: '-1.1vh',
        rotation: .25,
        duration: 2.9,
        delay: entrance.duration() + .1,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    });

    const ornament = document.querySelector('.ornament-border');
    const rule = document.querySelector('.rule');
    const countdown = document.querySelector('.countdown');
    const startTitle = document.querySelector(".scene[data-scene='0'] .title");
    if (ornament) gsap.to(ornament, { borderColor: 'rgba(230, 198, 144, .34)', duration: 3.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
    if (rule) gsap.to(rule, { autoAlpha: 1, filter: 'drop-shadow(0 0 9px rgba(230, 198, 144, .42))', duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
    if (countdown) gsap.to(countdown, { borderColor: 'rgba(230, 198, 144, .65)', boxShadow: '0 0 26px rgba(175, 128, 207, .16)', duration: 2.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
    if (startTitle) gsap.to(startTitle, { textShadow: '0 10px 34px #000, 0 0 54px rgba(213, 176, 237, .34)', duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true });

    animateMotes(gsap);
    animateShootingStars(gsap);
  };

  const scheduleBlink = () => {
    clearTimeout(blinkId);
    blinkId = setTimeout(() => {
      const gsap = window.gsap;
      characters.forEach(character => {
        const open = character.querySelector('.open');
        const blink = character.querySelector('.blink');
        if (gsap && open && blink) {
          gsap.timeline()
            .to(open, { autoAlpha: 0, duration: .085, ease: 'sine.inOut', overwrite: true })
            .to(blink, { autoAlpha: 1, duration: .085, ease: 'sine.inOut', overwrite: true }, '<')
            .to({}, { duration: .055 })
            .to(open, { autoAlpha: 1, duration: .12, ease: 'sine.inOut', overwrite: true })
            .to(blink, { autoAlpha: 0, duration: .12, ease: 'sine.inOut', overwrite: true }, '<');
        } else {
          character.classList.add('is-blinking');
          setTimeout(() => character.classList.remove('is-blinking'), 195);
        }
      });
      scheduleBlink();
    }, 2600 + Math.random() * 4200);
  };

  const start = () => {
    if (!tickId) {
      renderTimers();
      tickId = setInterval(renderTimers, 1000);
    }
    if (characters.length && !motionOff) scheduleBlink();
  };

  const stop = () => {
    clearInterval(tickId);
    clearTimeout(blinkId);
    tickId = null;
    blinkId = null;
  };

  const updateVisibility = () => {
    body.classList.toggle('obs-paused', document.hidden);
    if (window.gsap && !motionOff) {
      document.hidden ? window.gsap.globalTimeline.pause() : window.gsap.globalTimeline.resume();
    }
    document.hidden ? stop() : start();
  };

  document.addEventListener('visibilitychange', updateVisibility);
  window.addEventListener('pageshow', updateVisibility);
  window.addEventListener('pagehide', stop);

  createAtmosphere();
  initGsap();
  start();
})();
