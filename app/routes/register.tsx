import { data, redirect } from "react-router";
import { AuthForm } from "../components/auth-form";
import { cloudflareContext } from "../context";
import { createSession, getUser, register } from "../lib/auth.server";
import { validateSignup } from "../lib/auth-validation";
import { readForm, requireSameOriginPost } from "../lib/http.server";
import type { Route } from "./+types/register";

export async function loader({ request, context }: Route.LoaderArgs) {
  if (await getUser(request, context.get(cloudflareContext).env.DB)) return redirect("/lessons");
  return null;
}

export async function action({ request, context }: Route.ActionArgs) {
  requireSameOriginPost(request);
  const credentials = validateSignup(await readForm(request));
  if ("error" in credentials) return data(credentials, { status: 400 });
  const db = context.get(cloudflareContext).env.DB;
  const user = await register(db, credentials.username, credentials.password);
  if (!user) return data({ error: "Username taken", field: "username" as const, username: credentials.username }, { status: 409 });
  return redirect("/lessons", { status: 303, headers: { "Set-Cookie": await createSession(request, db, user.id) } });
}

export default function Register({ actionData }: Route.ComponentProps) { return <AuthForm mode="register" submissionError={actionData} />; }
