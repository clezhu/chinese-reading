import { createRequestHandler, RouterContextProvider } from "react-router";
import { cloudflareContext } from "../app/context";

const handler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    const context = new RouterContextProvider();
    context.set(cloudflareContext, { env, ctx });
    const response = await handler(request, context);
    // Never cache authenticated documents, loader data, redirects, or auth errors.
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "same-origin");
    response.headers.set("X-Frame-Options", "DENY");
    if (new URL(request.url).protocol === "https:") {
      response.headers.set("Strict-Transport-Security", "max-age=31536000");
    }
    return response;
  },
} satisfies ExportedHandler<Env>;
