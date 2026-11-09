import { cloudflareContext } from "../context";
import { usernameAvailable } from "../lib/auth.server";
import { usernameError } from "../lib/auth-validation";
import { readForm, requireSameOriginPost } from "../lib/http.server";
import type { Route } from "./+types/availability";

function reply(body: object, status = 200, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return Response.json(body, { status, headers });
}

export function loader() {
  return reply({ error: "Method not allowed" }, 405, { Allow: "POST" });
}

export async function action({ request, context }: Route.ActionArgs) {
  try {
    // Read-only but public: use the existing strict browser-origin boundary,
    // bounded form reader and no CORS/cache permission. Never accept credentials.
    requireSameOriginPost(request);
    const form = await readForm(request);
    const username = form.get("username") ?? "";
    if (form.size !== 1 || form.getAll("username").length !== 1 || usernameError(username)) {
      return reply({ error: "Invalid username" }, 400);
    }
    const available = await usernameAvailable(context.get(cloudflareContext).env.DB, username);
    return reply({ username, available });
  } catch (error) {
    if (error instanceof Response) return reply({ error: error.statusText || "Invalid request" }, error.status, error.headers);
    // Do not expose database details or pretend an unavailable service is a
    // taken/available result. The client offers an explicit retry, not a loop.
    return reply({ error: "Could not check. Try again." }, 503);
  }
}
