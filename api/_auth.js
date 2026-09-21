import crypto from 'node:crypto';

const sessionCookie = 'kontur_session';
const csrfCookie = 'kontur_csrf';
const maxAge = 60 * 60 * 8;

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const index = part.indexOf('=');
    const value = part.slice(index + 1).trim();
    try {
      return [part.slice(0, index).trim(), decodeURIComponent(value)];
    } catch {
      return [part.slice(0, index).trim(), ''];
    }
  }));
}

function secret() {
  if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET is not configured');
  return process.env.SESSION_SECRET;
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

export function issueSession(response) {
  const csrf = crypto.randomBytes(32).toString('base64url');
  const payload = `${Date.now() + maxAge * 1000}.${csrf}`;
  const token = `${payload}.${sign(payload)}`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader('Set-Cookie', [
    `${sessionCookie}=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${secure}`,
    `${csrfCookie}=${encodeURIComponent(csrf)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`
  ]);
}

export function clearSession(response) {
  response.setHeader('Set-Cookie', [
    `${sessionCookie}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`,
    `${csrfCookie}=; Max-Age=0; Path=/; SameSite=Lax`
  ]);
}

export function requireSession(request, response) {
  const cookies = parseCookies(request);
  const token = cookies[sessionCookie] || '';
  let decodedToken;
  try {
    decodedToken = decodeURIComponent(token);
  } catch {
    response.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  const [expires, csrf, signature] = decodedToken.split('.');
  const payload = `${expires}.${csrf}`;
  if (!expires || !csrf || !signature || Number(expires) < Date.now()) {
    response.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  const expected = sign(payload);
  const actualSignature = Buffer.from(signature);
  const expectedSignature = Buffer.from(expected);
  if (actualSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(actualSignature, expectedSignature)) {
    response.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export function requireCsrf(request, response) {
  const cookies = parseCookies(request);
  const header = request.headers['x-csrf-token'];
  if (!header || !cookies[csrfCookie] || header !== cookies[csrfCookie]) {
    response.status(403).json({ error: 'Invalid CSRF token' });
    return false;
  }
  return true;
}

export function isPasswordValid(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== 'string') return false;
  const provided = Buffer.from(password);
  const stored = Buffer.from(expected);
  return provided.length === stored.length && crypto.timingSafeEqual(provided, stored);
}

export function getCsrfToken(request) {
  return parseCookies(request)[csrfCookie] || '';
}
