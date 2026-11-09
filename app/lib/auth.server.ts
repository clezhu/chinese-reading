import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { redirect } from "react-router";

// OWASP scrypt profile: N=2^15, r=8, p=3. Workers' native node:crypto is
// supported with our compatibility date/flag; verify in local workerd, not Node.
// https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/
const SCRYPT = { N: 32768, r: 8, p: 3, maxmem: 48 * 1024 * 1024 };
const SESSION_SECONDS = 60 * 60 * 24 * 30;
const DUMMY_HASH = `scrypt$32768$8$3$${"00".repeat(16)}$${"00".repeat(32)}`;

export type User = { id: string; username: string };
type Account = User & { password_hash: string };

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 32, SCRYPT, (error, key) => error ? reject(error) : resolve(key));
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$32768$8$3$${salt.toString("hex")}$${key.toString("hex")}`;
}

async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const match = /^scrypt\$32768\$8\$3\$([a-f0-9]{32})\$([a-f0-9]{64})$/.exec(encoded);
  if (!match) return false;
  const key = await derive(password, Buffer.from(match[1], "hex"));
  return timingSafeEqual(key, Buffer.from(match[2], "hex"));
}

export async function usernameAvailable(db: D1Database, username: string): Promise<boolean> {
  // The schema's NOCASE unique collation is shared by this lookup and INSERT.
  const account = await db.prepare("SELECT id FROM users WHERE username = ? LIMIT 1")
    .bind(username).first<{ id: string }>();
  return account === null;
}

export async function register(db: D1Database, username: string, password: string): Promise<User | null> {
  const id = crypto.randomUUID();
  const hash = await hashPassword(password);
  // A single atomic INSERT handles concurrent registrations without a race.
  const result = await db.prepare(
    "INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(username) DO NOTHING",
  ).bind(id, username, hash, Date.now()).run();
  return result.meta.changes === 1 ? { id, username } : null;
}

export async function authenticate(db: D1Database, username: string, password: string): Promise<User | null> {
  const account = await db.prepare("SELECT id, username, password_hash FROM users WHERE username = ?")
    .bind(username).first<Account>();
  // Missing usernames still incur a full password derivation.
  const valid = await verifyPassword(password, account?.password_hash ?? DUMMY_HASH);
  return account && valid ? { id: account.id, username: account.username } : null;
}

function cookieOptions(request: Request) {
  const url = new URL(request.url);
  const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  return {
    name: localHttp ? "reader_session" : "__Host-reader_session",
    attributes: `Path=/; HttpOnly; SameSite=Lax${localHttp ? "" : "; Secure"}`,
  };
}

function sessionToken(request: Request): string | null {
  const { name } = cookieOptions(request);
  const matches = (request.headers.get("Cookie") ?? "").split(";")
    .map((part) => part.trim()).filter((part) => part.startsWith(`${name}=`));
  if (matches.length !== 1) return null;
  const token = matches[0].slice(name.length + 1);
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function getUser(request: Request, db: D1Database): Promise<User | null> {
  const token = sessionToken(request);
  if (!token) return null;
  return db.prepare(
    "SELECT users.id, users.username FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?",
  ).bind(tokenHash(token), Date.now()).first<User>();
}

export async function requireUser(request: Request, db: D1Database): Promise<User> {
  const user = await getUser(request, db);
  if (!user) throw redirect("/register");
  return user;
}

export async function createSession(request: Request, db: D1Database, userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const previous = sessionToken(request);
  const operations = [db.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(Date.now())];
  if (previous) operations.push(db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash(previous)));
  operations.push(db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(tokenHash(token), userId, Date.now() + SESSION_SECONDS * 1000));
  await db.batch(operations);
  const { name, attributes } = cookieOptions(request);
  return `${name}=${token}; ${attributes}; Max-Age=${SESSION_SECONDS}`;
}

export async function destroySession(request: Request, db: D1Database): Promise<string> {
  const token = sessionToken(request);
  if (token) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash(token)).run();
  const { name, attributes } = cookieOptions(request);
  return `${name}=; ${attributes}; Max-Age=0`;
}
