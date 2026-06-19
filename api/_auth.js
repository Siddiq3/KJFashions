import crypto from 'node:crypto';

const COOKIE_NAME = 'khwaja_admin_session';
const ONE_DAY_SECONDS = 60 * 60 * 24;

const base64Url = (value) => Buffer.from(value).toString('base64url');

const sign = (payload, secret) =>
  crypto.createHmac('sha256', secret).update(payload).digest('base64url');

const getSecret = () => process.env.ADMIN_SESSION_SECRET || process.env.GITHUB_TOKEN || 'local-admin-secret';

const parseCookies = (cookieHeader = '') =>
  cookieHeader.split(';').reduce((cookies, part) => {
    const [key, ...value] = part.trim().split('=');
    if (key) cookies[key] = decodeURIComponent(value.join('='));
    return cookies;
  }, {});

export const createAdminCookie = (email) => {
  const payload = base64Url(
    JSON.stringify({
      email,
      exp: Math.floor(Date.now() / 1000) + ONE_DAY_SECONDS,
    }),
  );
  const token = `${payload}.${sign(payload, getSecret())}`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';

  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${ONE_DAY_SECONDS}${secure}`;
};

export const clearAdminCookie = () =>
  `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;

export const verifyAdminRequest = (req) => {
  const token = parseCookies(req.headers.cookie || '')[COOKIE_NAME];
  if (!token) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = sign(payload, getSecret());
  const validSignature = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!validSignature) return false;

  const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  return Number(session.exp) > Math.floor(Date.now() / 1000);
};
