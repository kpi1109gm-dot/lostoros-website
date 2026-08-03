// LosToros お問い合わせフォーム受信API（Render の Web Service で動かす）
//
// 必要な環境変数（Renderのダッシュボードで設定する）:
//   SMTP_HOST  例: smtp.gmail.com
//   SMTP_PORT  例: 465
//   SMTP_USER  送信に使うメールアドレス（例: chida@lostoros.net）
//   SMTP_PASS  アプリパスワード（Googleアカウントで発行する16桁）
//   MAIL_TO    問い合わせの届け先（省略時は SMTP_USER）
//   ALLOWED_ORIGINS  カンマ区切り。省略時は下の既定値

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
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
  });
}

app.get('/', (req, res) => res.type('text/plain').send('LosToros contact API'));

// Renderのヘルスチェック用
app.get('/healthz', (req, res) => {
  res.json({ ok: true, mail: Boolean(buildTransport()) });
});

app.post('/api/contact', async (req, res) => {
  const body = req.body || {};

  // ボット対策の隠しフィールド。入力されていたら黙って成功を返す
  if (body.website) return res.json({ ok: true });

  const name = String(body.name || '').trim();
  const company = String(body.company || '').trim();
  const email = String(body.email || '').trim();
  const type = String(body.type || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: '必須項目が未入力です' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'メールアドレスの形式が正しくありません' });
  }
  if (name.length > 100 || company.length > 200 || message.length > 5000) {
    return res.status(400).json({ ok: false, error: '入力が長すぎます' });
  }

  if (rateLimited(req.ip)) {
    return res.status(429).json({ ok: false, error: '送信が集中しています。時間をおいてお試しください' });
  }

  const transport = buildTransport();
  if (!transport) {
    console.error('SMTPの環境変数が未設定のため送信できません');
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

  try {
    await transport.sendMail({
      from: `"LosToros サイト" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO || process.env.SMTP_USER,
      replyTo: `"${name}" <${email}>`,
      subject: `【お問い合わせ】${type || 'その他'} / ${name}`,
      text,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('送信失敗:', err && err.message);
    res.status(502).json({ ok: false, error: 'メール送信に失敗しました' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`contact api listening on ${port}`));
