// THROWAWAY #2. No framework, dependencies, persistence, or production server.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

if (process.env.NODE_ENV === 'production') {
  throw new Error('This prototype and its switcher must not ship to production.');
}
const files = {
  '/prototype/reader': ['index.html', 'text/html'],
  '/prototype/reader/': ['index.html', 'text/html'],
  '/prototype/reader/reader.css': ['reader.css', 'text/css'],
  '/prototype/reader/reader.js': ['reader.js', 'text/javascript'],
};
createServer(async (req, res) => {
  if (req.url === '/') {
    res.writeHead(302, { Location: '/prototype/reader?variant=B' }).end();
    return;
  }
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404).end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8`, 'Cache-Control': 'no-store' });
  res.end(await readFile(new URL(file[0], import.meta.url)));
}).listen(4173, '127.0.0.1', () => {
  console.log('THROWAWAY reader: http://127.0.0.1:4173/prototype/reader?variant=B');
});
