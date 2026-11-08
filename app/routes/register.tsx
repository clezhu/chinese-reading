import { data, redirect } from "react-router";
import { AuthForm } from "../components/auth-form";
import { cloudflareContext } from "../context";
import { createSession, getUser, register, validateCredentials } from "../lib/auth.server";
import { readForm, requireSameOriginPost } from "../lib/http.server";
import type { Route } from "./+types/register";

export async function loader({ request, context }: Route.LoaderArgs) {
  if (await getUser(request, context.get(cloudflareContext).env.DB)) return redirect("/lessons");
  return null;
}

export async function action({ request, context }: Route.ActionArgs) {
  requireSameOriginPost(request);
  const credentials = validateCredentials(await readForm(request));
  if ("error" in credentials) return data({ error: credentials.error }, { status: 400 });
  const db = context.get(cloudflareContext).env.DB;
  const user = await register(db, credentials.username, credentials.password);
  if (!user) return data({ error: "That username is already taken. Please choose another." }, { status: 409 });
  return redirect("/lessons", { status: 303, headers: { "Set-Cookie": await createSession(request, db, user.id) } });
}

export default function Register({ actionData }: Route.ComponentProps) { return <AuthForm mode="register" error={actionData?.error} />; }
