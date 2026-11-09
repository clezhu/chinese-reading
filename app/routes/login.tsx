import { data, redirect } from "react-router";
import { AuthForm } from "../components/auth-form";
import { cloudflareContext } from "../context";
import { authenticate, createSession, getUser } from "../lib/auth.server";
import { INCORRECT_CREDENTIALS, validateLogin } from "../lib/auth-validation";
import { readForm, requireSameOriginPost } from "../lib/http.server";
import type { Route } from "./+types/login";

export async function loader({ request, context }: Route.LoaderArgs) {
  if (await getUser(request, context.get(cloudflareContext).env.DB)) return redirect("/lessons");
  return null;
}

export async function action({ request, context }: Route.ActionArgs) {
  requireSameOriginPost(request);
  const credentials = validateLogin(await readForm(request));
  if ("error" in credentials) return data(credentials, { status: 400 });
  const db = context.get(cloudflareContext).env.DB;
  const user = await authenticate(db, credentials.username, credentials.password);
  if (!user) return data({ error: INCORRECT_CREDENTIALS, field: "password" as const, username: credentials.username }, { status: 400 });
  return redirect("/lessons", { status: 303, headers: { "Set-Cookie": await createSession(request, db, user.id) } });
}

export default function Login({ actionData }: Route.ComponentProps) { return <AuthForm mode="login" submissionError={actionData} />; }
