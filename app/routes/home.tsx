import { redirect } from "react-router";
import { getUser } from "../lib/auth.server";
import { cloudflareContext } from "../context";
import type { Route } from "./+types/home";

export async function loader({ request, context }: Route.LoaderArgs) {
  return redirect(await getUser(request, context.get(cloudflareContext).env.DB) ? "/lessons" : "/login");
}
