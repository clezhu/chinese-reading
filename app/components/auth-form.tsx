import { Form, Link, useNavigation } from "react-router";

export function AuthForm({ mode, error }: { mode: "register" | "login"; error?: string }) {
  const registering = mode === "register";
  const pending = useNavigation().state !== "idle";
  return (
    <section className="panel auth-panel">
      <p className="eyebrow">Read the language you already speak</p>
      <h1>{registering ? "Create your account" : "Welcome back"}</h1>
      <p>{registering ? "Save your place as you learn simplified Chinese characters." : "Log in to return to your lessons."}</p>
      <aside className="notice" id="recovery-notice"><strong>No account recovery.</strong> We don’t collect email addresses. There is no password reset or account recovery, so keep your username and password somewhere safe.</aside>
      <Form method="post" aria-describedby="recovery-notice">
        {error && <p className="form-error" role="alert">{error}</p>}
        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} minLength={3} maxLength={32} pattern="[A-Za-z0-9_]{3,32}" required aria-describedby="username-hint" />
        <p className="input-hint" id="username-hint">3–32 letters, numbers, or underscores. Not case-sensitive.</p>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} minLength={12} maxLength={128} required aria-describedby="password-hint" />
        <p className="input-hint" id="password-hint">12–128 characters. A long, unique passphrase works well.</p>
        <button type="submit" disabled={pending}>{pending ? "Please wait…" : registering ? "Create account" : "Log in"}</button>
      </Form>
      <p className="auth-switch">{registering ? "Already have an account?" : "New here?"} <Link to={registering ? "/login" : "/register"}>{registering ? "Log in" : "Create an account"}</Link></p>
    </section>
  );
}
