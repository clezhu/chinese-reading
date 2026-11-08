// Every mutation (including login/logout) requires a same-origin browser POST.
export function requireSameOriginPost(request: Request) {
  if (request.method !== "POST") throw new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  if (request.headers.get("Origin") !== new URL(request.url).origin || request.headers.get("Sec-Fetch-Site") === "cross-site") {
    throw new Response("Invalid request origin", { status: 403 });
  }
}

export async function readForm(request: Request): Promise<URLSearchParams> {
  if (request.headers.get("Content-Type")?.split(";")[0].trim() !== "application/x-www-form-urlencoded") {
    throw new Response("Expected a form submission", { status: 415 });
  }
  const maxBytes = 4096;
  if (Number(request.headers.get("Content-Length")) > maxBytes) throw new Response("Form too large", { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return new URLSearchParams();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new Response("Form too large", { status: 413 });
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally { reader.releaseLock(); }
  return new URLSearchParams(text);
}
