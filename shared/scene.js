(function () {
  'use strict';

  var clockTimer = null;
  var eventTimer = null;
  var eventCycle = 0;
  var startedAt = Date.now();
  var tenMinuteTarget = document.querySelector('[data-ten]');
  var eventMessage = document.querySelector('[data-event]');
  var eventMessages = [
    'o cogumelo inchou',
    'o relógio travou em 13h',
    'as cartas viraram sozinhas',
    'a rosa abriu'
  ];

  function updateClock() {
    var seconds = Math.floor((Date.now() - startedAt) / 1000);
    var minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    var secs = String(seconds % 60).padStart(2, '0');
    var value = minutes + ':' + secs;

    document.querySelectorAll('[data-clock]').forEach(function (el) {
      el.textContent = value;
    });
  }

  function startClock() {
    if (clockTimer || document.hidden) return;
    updateClock();
    clockTimer = window.setInterval(updateClock, 1000);
  }

  function stopClock() {
    if (!clockTimer) return;
    window.clearInterval(clockTimer);
    clockTimer = null;
  }

  function runTenMinuteEvent() {
    if (!tenMinuteTarget || document.hidden) return;

    eventCycle += 1;
    tenMinuteTarget.classList.add('event');
    window.setTimeout(function () {
      tenMinuteTarget.classList.remove('event');
    }, 4200);

    if (eventMessage) {
      eventMessage.textContent = eventMessages[eventCycle % eventMessages.length];
    }

    scheduleTenMinuteEvent();
  }

  function scheduleTenMinuteEvent() {
    if (!tenMinuteTarget || document.hidden || eventTimer) return;
    eventTimer = window.setTimeout(function () {
      eventTimer = null;
      runTenMinuteEvent();
    }, 600000);
  }

  function stopTenMinuteEvent() {
    if (!eventTimer) return;
    window.clearTimeout(eventTimer);
    eventTimer = null;
  }

  function setRuntimePaused(paused) {
    document.documentElement.classList.toggle('obs-paused', paused);

    if (window.gsap && window.gsap.globalTimeline) {
      window.gsap.globalTimeline.paused(paused);
    }

    if (paused) {
      stopClock();
      stopTenMinuteEvent();
    } else {
      startClock();
      scheduleTenMinuteEvent();
    }
  }

  if (window.gsap) {
    gsap.from('.top,.safe,.panel,.title>*', {
      opacity: 0,
      y: 22,
      stagger: 0.08,
      duration: 0.9,
      ease: 'power3.out'
    });

    gsap.to('.float', {
      y: -15,
      rotation: 5,
      duration: 3.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.2
    });

    gsap.to('.lantern', {
      opacity: 0.45,
      duration: 1.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.25
    });

    gsap.to('.ornament', {
      rotation: 360,
      duration: 45,
      ease: 'none',
      repeat: -1
    });
  }

  document.addEventListener('visibilitychange', function () {
    setRuntimePaused(document.hidden);
  });

  window.addEventListener('pagehide', function () {
    stopClock();
    stopTenMinuteEvent();
  });

  setRuntimePaused(document.hidden);
})();
