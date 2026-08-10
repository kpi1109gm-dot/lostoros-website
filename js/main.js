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
  // 送信先は Render の Web Service（server/index.js）。
  // Renderでサービス名を変えた場合はこのURLも合わせて変更する。
  // 空にするとメールソフト起動方式のフォールバックで動く。
  var FORM_ENDPOINT = 'https://lostoros-api.onrender.com/api/contact';
  var CONTACT_EMAIL = 'chida@lostoros.net';

  // お問い合わせフォームと Business Supporter 申込フォームの2つを同じ処理で扱う
  function setupForm(opts) {
    var form = document.getElementById(opts.formId);
    var status = document.getElementById(opts.statusId);
    if (!form) return;

    function setStatus(message, state) {
      if (!status) return;
      status.textContent = message;
      status.setAttribute('data-state', state || '');
    }

    function firstInvalid() {
      var fields = form.querySelectorAll('[required]');
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        var bad;
        if (f.type === 'checkbox') {
          bad = !f.checked;
        } else {
          bad = !f.value.trim() ||
            (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
        }
        f.setAttribute('aria-invalid', String(bad));
        if (bad) return f;
      }
      return null;
    }

    function val(name) {
      var f = form.elements[name];
      return f && typeof f.value === 'string' ? f.value.trim() : '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var invalid = firstInvalid();
      if (invalid) {
        setStatus(opts.invalidMessage, 'error');
        invalid.focus();
        return;
      }

      var data = {
        name: val('name'),
        company: val('company'),
        email: val('email'),
        type: opts.fixedType || val('type'),
        message: opts.buildMessage ? opts.buildMessage(val) : val('message'),
        website: val('website')
      };

      if (!FORM_ENDPOINT) {
        // メールソフト起動方式（送信サービス未設定時のフォールバック）
        var body = [
          'お名前: ' + data.name,
          '会社・団体名: ' + (data.company || '—'),
          'メールアドレス: ' + data.email,
          '種別: ' + data.type,
          '',
          data.message
        ].join('\n');
        window.location.href = 'mailto:' + CONTACT_EMAIL +
          '?subject=' + encodeURIComponent('【' + data.type + '】' + data.name) +
          '&body=' + encodeURIComponent(body);
        setStatus('メールソフトを起動しました。送信を完了してください。', 'ok');
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setStatus('送信中…', '');

      // サーバーが休止から復帰する場合に備えて案内を出す
      var slowNotice = setTimeout(function () {
        setStatus('送信中です。接続に少し時間がかかっています…', '');
      }, 4000);

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        form.reset();
        setStatus(opts.successMessage, 'ok');
      }).catch(function () {
        setStatus('送信に失敗しました。お手数ですが ' + CONTACT_EMAIL + ' まで直接ご連絡ください。', 'error');
      }).then(function () {
        clearTimeout(slowNotice);
        if (submitBtn) submitBtn.disabled = false;
      });
    });

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
    form.addEventListener('change', function (e) {
      if (e.target.type === 'checkbox' && e.target.checked) {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }

  setupForm({
    formId: 'contactForm',
    statusId: 'formStatus',
    invalidMessage: '未入力の項目があります。ご確認ください。',
    successMessage: '送信しました。折り返しご連絡いたします。'
  });

  setupForm({
    formId: 'supporterForm',
    statusId: 'supporterStatus',
    fixedType: 'Business Supporter 申込',
    invalidMessage: '未入力の項目、または未同意の項目があります。ご確認ください。',
    successMessage: 'お申し込みを受け付けました。担当より振込先をご案内いたします。',
    buildMessage: function (val) {
      return [
        '■ Business Supporter 申込',
        '電話番号: ' + (val('tel') || '—'),
        '',
        '【ご連絡事項】',
        val('message') || '（記載なし）'
      ].join('\n');
    }
  });

  // 事業ごとの「この事業について相談する」から、問い合わせ種別を引き継ぐ
  var typeSelect = document.getElementById('cf-type');
  document.querySelectorAll('[data-inquiry]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (!typeSelect) return;
      var want = link.getAttribute('data-inquiry');
      for (var i = 0; i < typeSelect.options.length; i++) {
        if (typeSelect.options[i].value === want) {
          typeSelect.selectedIndex = i;
          break;
        }
      }
    });
  });

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
