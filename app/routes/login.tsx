import { data, redirect } from "react-router";
import { AuthForm } from "../components/auth-form";
import { cloudflareContext } from "../context";
import { authenticate, createSession, getUser, validateCredentials } from "../lib/auth.server";
import { readForm, requireSameOriginPost } from "../lib/http.server";
import type { Route } from "./+types/login";

export async function loader({ request, context }: Route.LoaderArgs) {
  if (await getUser(request, context.get(cloudflareContext).env.DB)) return redirect("/lessons");
  return null;
}

export async function action({ request, context }: Route.ActionArgs) {
  requireSameOriginPost(request);
  const credentials = validateCredentials(await readForm(request));
  if ("error" in credentials) return data({ error: credentials.error }, { status: 400 });
  const db = context.get(cloudflareContext).env.DB;
  const user = await authenticate(db, credentials.username, credentials.password);
  if (!user) return data({ error: "Incorrect username or password." }, { status: 400 });
  return redirect("/lessons", { status: 303, headers: { "Set-Cookie": await createSession(request, db, user.id) } });
}

export default function Login({ actionData }: Route.ComponentProps) { return <AuthForm mode="login" error={actionData?.error} />; }
