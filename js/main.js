// LOSTOROS — interactions
// スクロール連動の出現アニメーションとモバイルナビゲーション

(function () {
  'use strict';

  // ---- scroll reveal ----
  var revealTargets = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ---- hero lanes: subtle parallax ----
  var lanes = document.querySelector('.hero-lanes');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (lanes && !reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        lanes.style.transform = 'translateY(' + window.scrollY * 0.18 + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }

  // ---- hero video: 動きを減らす設定のユーザーには自動再生しない ----
  var heroVideo = document.querySelector('.hero-media video');
  if (heroVideo && reduceMotion) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  }

  // ---- header: hide on scroll down, show on scroll up ----
  var header = document.querySelector('.site-header');
  var lastY = window.scrollY;

  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (header) {
      if (y > lastY && y > 160) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
    }
    lastY = y;
  }, { passive: true });

  // ---- mobile nav ----
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
