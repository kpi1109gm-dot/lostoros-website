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
  var heroVideo = document.querySelector('.hero-video video');
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

  // ---- お問い合わせフォーム ----
  //
  // FORM_ENDPOINT が空のあいだは、送信ボタンでメールソフトを起動する方式で動く。
  // フォーム送信サービス（Formspree等）に登録してエンドポイントURLを貼れば、
  // 入力内容がそのまま CONTACT_EMAIL 宛のメールとして届くようになる。
  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'chida@lostoros.net';

  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    status.setAttribute('data-state', state || '');
  }

  function firstInvalid() {
    var fields = form.querySelectorAll('[required]');
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var empty = !f.value.trim();
      var badEmail = f.type === 'email' && f.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value);
      f.setAttribute('aria-invalid', String(empty || badEmail));
      if (empty || badEmail) return f;
    }
    return null;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var invalid = firstInvalid();
      if (invalid) {
        setStatus('未入力の項目があります。ご確認ください。', 'error');
        invalid.focus();
        return;
      }

      var data = {
        name: form.name.value.trim(),
        company: form.company.value.trim(),
        email: form.email.value.trim(),
        type: form.type.value,
        message: form.message.value.trim()
      };

      if (!FORM_ENDPOINT) {
        // メールソフト起動方式（サービス未設定時）
        var body = [
          'お名前: ' + data.name,
          '会社・団体名: ' + (data.company || '—'),
          'メールアドレス: ' + data.email,
          '種別: ' + data.type,
          '',
          data.message
        ].join('\n');
        window.location.href = 'mailto:' + CONTACT_EMAIL +
          '?subject=' + encodeURIComponent('【お問い合わせ】' + data.type + ' / ' + data.name) +
          '&body=' + encodeURIComponent(body);
        setStatus('メールソフトを起動しました。送信を完了してください。', 'ok');
        return;
      }

      setStatus('送信中…', '');
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        form.reset();
        setStatus('送信しました。折り返しご連絡いたします。', 'ok');
      }).catch(function () {
        setStatus('送信に失敗しました。お手数ですが ' + CONTACT_EMAIL + ' まで直接ご連絡ください。', 'error');
      });
    });

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }

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
