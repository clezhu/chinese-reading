import { redirect } from "react-router";
import { cloudflareContext } from "../context";
import { destroySession } from "../lib/auth.server";
import { requireSameOriginPost } from "../lib/http.server";
import type { Route } from "./+types/logout";

export function loader() { throw new Response("Use the Log out button to log out.", { status: 405, headers: { Allow: "POST" } }); }

export async function action({ request, context }: Route.ActionArgs) {
  requireSameOriginPost(request);
  return redirect("/login", { status: 303, headers: { "Set-Cookie": await destroySession(request, context.get(cloudflareContext).env.DB) } });
}
