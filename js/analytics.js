// LosToros — アクセス解析（Googleアナリティクス 4）
//
// 下の GA_MEASUREMENT_ID に「G-」で始まる測定IDを入れると計測が始まる。
// 空のままなら何も読み込まず、サイトの動作にも一切影響しない。
//
// 標準の計測（ページの閲覧数・スクロール・外部リンクのクリック等）に加えて、
// 加入導線の効果を測るため、次のイベントを送る。
//
//   begin_checkout   Squareの決済ページへ進むボタンを押した（年額50,000円）
//   supporter_cta    「加入内容・申込へ」系のボタンを押した（どこのボタンかを location で区別）
//   inquiry_cta      「この事業について相談する」等を押した（種別を inquiry_type で区別）
//   generate_lead    お問い合わせフォームの送信が成功した
//   section_view     各セクションが画面に入った（どこまで読まれたか・どこで離脱したか）
//
// GA側で begin_checkout と generate_lead を「キーイベント」に指定すると、成果として集計できる。

(function () {
  'use strict';

  var GA_MEASUREMENT_ID = '';

  var enabled = /^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID);

  // 他のスクリプトから呼べる計測関数。無効時は何もしない
  window.lostorosTrack = function (name, params) {
    if (!enabled || typeof window.gtag !== 'function') return;
    window.gtag('event', name, params || {});
  };

  if (!enabled) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(s);

  var track = window.lostorosTrack;

  // クリックがどのセクションで起きたか（ボタンの設置場所の比較に使う）
  function locationOf(el) {
    var explicit = el.closest('[data-track-location]');
    if (explicit) return explicit.getAttribute('data-track-location');
    var sec = el.closest('section[id], section[class], aside[id], header, footer');
    if (!sec) return 'other';
    if (sec.id) return sec.id;
    return sec.className.split(' ')[0] || sec.tagName.toLowerCase();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';

    if (href.indexOf('checkout.square.site') !== -1) {
      // 同じタブでSquareへ移動するため、ページを離れても届く送信方式を使う
      track('begin_checkout', {
        currency: 'JPY',
        value: 50000,
        items: [{ item_name: 'Business Supporter', price: 50000, quantity: 1 }],
        link_location: locationOf(a),
        transport_type: 'beacon'
      });
    } else if (/(^|\/)#supporter$|^\/supporter\/?$/.test(href)) {
      track('supporter_cta', { location: locationOf(a), link_url: href });
    } else if (a.hasAttribute('data-inquiry')) {
      track('inquiry_cta', { location: locationOf(a), inquiry_type: a.getAttribute('data-inquiry') });
    }
  });

  // どのセクションまで読まれたか。各セクションにつき1回だけ送る。
  // ボタンでページ内を移動したときに通過しただけのセクションを数えないよう、
  // 1秒以上画面に留まったときだけ送る
  if ('IntersectionObserver' in window) {
    var timers = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        var id = el.id || el.className.split(' ')[0];
        if (!entry.isIntersecting) {
          clearTimeout(timers[id]);
          return;
        }
        timers[id] = setTimeout(function () {
          track('section_view', { section: id });
          io.unobserve(el);
        }, 1000);
      });
    // 縦に長いセクションは30%も同時に画面に入らないため、割合ではなく
    // 「セクションの上端が画面の上6割に入った」時点で読まれたとみなす
    }, { threshold: 0, rootMargin: '0px 0px -40% 0px' });
    document.querySelectorAll('main > section').forEach(function (sec) { io.observe(sec); });
  }
})();
