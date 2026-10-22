// LosToros お問い合わせフォーム受信API（Render の Web Service で動かす）
//
// 送信方式は2通り。環境変数の設定内容で自動的に切り替わる。
//
// 【A】HTTP API方式（Renderの無料プランでも動く。推奨）
//   RESEND_API_KEY  Resend（https://resend.com）のAPIキー
//   MAIL_FROM       送信元 例: LosToros <noreply@lostoros.net>
//   MAIL_TO         届け先。カンマ区切りで複数指定できる
//
// 【B】SMTP方式（Renderの有料プランが必要。無料プランはSMTPが遮断される）
//   SMTP_HOST  例: smtp.gmail.com
//   SMTP_PORT  例: 465
//   SMTP_USER  送信に使うメールアドレス
//   SMTP_PASS  アプリパスワード（Googleアカウントで発行する16桁）
//   MAIL_TO    届け先（省略時は SMTP_USER）
//
// 共通:
//   ALLOWED_ORIGINS  カンマ区切り。省略時は下の既定値

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.disable('x-powered-by'); // 使っている部品名を外部に知らせない
app.set('trust proxy', 1);
app.use(express.json({ limit: '32kb' }));

const ALLOWED = (process.env.ALLOWED_ORIGINS ||
  'https://lostoros.net,https://www.lostoros.net,https://kpi1109gm-dot.github.io')
  .split(',').map((s) => s.trim()).filter(Boolean);

app.use(cors({
  origin: function (origin, cb) {
    // originなし（curl等）は許可。ブラウザからは許可リストのみ
    if (!origin) return cb(null, true);
    const ok = ALLOWED.includes(origin) || /\.onrender\.com$/.test(new URL(origin).hostname);
    cb(ok ? null : new Error('origin not allowed'), ok);
  },
  methods: ['POST', 'OPTIONS'],
}));

// ざっくりした連投防止（1IPあたり10分で5件まで）
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear(); // メモリ肥大の保険
  return list.length > MAX_PER_WINDOW;
}

function buildTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  });
}

function recipients() {
  const raw = process.env.MAIL_TO || process.env.SMTP_USER || '';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function senderAddress() {
  return process.env.MAIL_FROM ||
    (process.env.SMTP_USER ? `LosToros サイト <${process.env.SMTP_USER}>` : '');
}

// 現在有効な送信方式を返す
function mailMode() {
  if (process.env.RESEND_API_KEY && senderAddress() && recipients().length) return 'resend';
  if (buildTransport()) return 'smtp';
  return null;
}

// ---- 入力の安全化 ----
//
// フォームの値はメールの「返信先」と「件名」に入る。ここに記号や改行が混ざると、
// 返信先に第三者のアドレスを紛れ込ませたり（返信を押すと攻撃者に届く）、
// メール送信部品に極端に重い処理をさせたりできてしまう（2026-10-22に実際に確認して対処）。

// 制御文字（改行・タブなど）を1つの空白にまとめる。1行で使う値（名前・会社名・種別）用
function oneLine(value) {
  return String(value || '').replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim();
}

// 本文用。改行は残し、それ以外の制御文字だけを除く
function multiLine(value) {
  return String(value || '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim();
}

// メールアドレスに使える文字だけを許す。返信先の区切りに使われる " < > ( ) , ; : [ ] \ を含むものは拒否
const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
const EMAIL_MAX = 254; // メールアドレスの規格上の上限

// 返信先の表示名から、宛先の区切りとして解釈されうる記号を取り除く
function displayName(name) {
  return name.replace(/["<>()\[\]\\,;:@]/g, '').trim() || 'お問い合わせ';
}

// Resend（HTTP API）で送る。RenderのSMTP遮断を受けない
async function sendViaResend(mail) {
  const url = process.env.RESEND_API_URL || 'https://api.resend.com/emails';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: mail.from,
      to: mail.to,
      // 表示名は displayName() で " や < > を除いてあるので、引用符で囲んでも崩れない
      reply_to: `"${mail.replyTo.name}" <${mail.replyTo.address}>`,
      subject: mail.subject,
      text: mail.text,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`resend ${res.status}: ${detail.slice(0, 200)}`);
  }
}

app.get('/', (req, res) => res.type('text/plain').send('LosToros contact API'));

// Renderのヘルスチェック用
app.get('/healthz', (req, res) => {
  const mode = mailMode();
  res.json({ ok: true, mail: Boolean(mode), mode: mode || 'none' });
});

app.post('/api/contact', async (req, res) => {
  const body = req.body || {};

  // ボット対策の隠しフィールド。入力されていたら黙って成功を返す
  if (body.website) return res.json({ ok: true });

  const name = oneLine(body.name);
  const company = oneLine(body.company);
  const email = String(body.email || '').trim();
  const type = oneLine(body.type);
  const message = multiLine(body.message);

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: '必須項目が未入力です' });
  }
  // 長さを先に確かめる。長すぎる値を正規表現やメール送信部品に渡さないため
  if (email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'メールアドレスの形式が正しくありません' });
  }
  if (name.length > 100 || company.length > 200 || type.length > 100 || message.length > 5000) {
    return res.status(400).json({ ok: false, error: '入力が長すぎます' });
  }

  if (rateLimited(req.ip)) {
    return res.status(429).json({ ok: false, error: '送信が集中しています。時間をおいてお試しください' });
  }

  const mode = mailMode();
  if (!mode) {
    console.error('メール送信の環境変数が未設定です');
    return res.status(503).json({ ok: false, error: 'メール送信が未設定です' });
  }

  const text = [
    '合同会社LosToros サイトのお問い合わせフォームより',
    '',
    `お名前　　　: ${name}`,
    `会社・団体名: ${company || '（未記入）'}`,
    `メール　　　: ${email}`,
    `種別　　　　: ${type || '（未選択）'}`,
    '',
    '--- お問い合わせ内容 ---',
    message,
  ].join('\n');

  const mail = {
    from: senderAddress(),
    to: recipients(),
    // 文字列で組み立てず「名前」と「アドレス」を分けて渡す。
    // 送信部品が入力を解析し直さないので、名前に記号が入っても宛先が増えない
    replyTo: { name: displayName(name), address: email },
    subject: `【お問い合わせ】${type || 'その他'} / ${name}`,
    text,
  };

  try {
    if (mode === 'resend') {
      await sendViaResend(mail);
    } else {
      await buildTransport().sendMail({ ...mail, to: mail.to.join(', ') });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('送信失敗:', err && err.message);
    res.status(502).json({ ok: false, error: 'メール送信に失敗しました' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`contact api listening on ${port}`));
