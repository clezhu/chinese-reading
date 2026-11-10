import { useEffect, useRef, useState } from "react";
import { Form, Link, useNavigation } from "react-router";
import { confirmationError, passwordError, usernameError, type AuthError } from "../lib/auth-validation";

type Availability = { username: string; status: "idle" | "checking" | "available" | "taken" | "error" };
const CHECK_DELAY_MS = 350;
const CHECK_TIMEOUT_MS = 8_000;

export function AuthForm({ mode, submissionError }: { mode: "register" | "login"; submissionError?: AuthError }) {
  const registering = mode === "register";
  const pending = useNavigation().state !== "idle";
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const [username, setUsername] = useState(submissionError?.username ?? "");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationEdited, setConfirmationEdited] = useState(false);
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [passwordEdited, setPasswordEdited] = useState(false);
  const [dismissedError, setDismissedError] = useState<AuthError>();
  const [availability, setAvailability] = useState<Availability>({ username: "", status: "idle" });
  const [retry, setRetry] = useState(0);
  const requestVersion = useRef(0);
  const localUsernameError = usernameError(username);
  const localPasswordError = passwordError(password);
  const serverError = submissionError !== dismissedError ? submissionError : undefined;
  const currentAvailability = availability.username === username ? availability.status : "idle";

  useEffect(() => {
    if (!registering || usernameError(username)) return;
    const version = ++requestVersion.current;
    const controller = new AbortController();
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    setAvailability({ username, status: "checking" });
    const debounce = setTimeout(async () => {
      timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
      try {
        const response = await fetch("/availability", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ username }),
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Availability check failed");
        const result: unknown = await response.json();
        if (!result || typeof result !== "object" || !("username" in result) || result.username !== username
          || !("available" in result) || typeof result.available !== "boolean") throw new Error("Invalid availability result");
        if (!cancelled && version === requestVersion.current) {
          setAvailability({ username, status: result.available ? "available" : "taken" });
        }
      } catch {
        // A timed-out check is retryable; an obsolete/unmounted check is ignored.
        if (!cancelled && version === requestVersion.current) setAvailability({ username, status: "error" });
      } finally {
        clearTimeout(timeout);
      }
    }, CHECK_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
      clearTimeout(timeout);
      controller.abort();
    };
  }, [registering, username, retry]);

  const usernameServerError = serverError?.field === "username" && serverError.username === username ? serverError.error : undefined;
  const passwordServerError = serverError?.field === "password" ? serverError.error : undefined;
  const usernameMessage = registering
    ? (usernameEdited ? localUsernameError : undefined) ?? usernameServerError
      ?? (!localUsernameError && currentAvailability === "checking" ? "Checking availability…"
        : !localUsernameError && currentAvailability === "available" ? "✓ Username available"
        : !localUsernameError && currentAvailability === "taken" ? "Username taken"
        : !localUsernameError && currentAvailability === "error" ? "Could not check. Try again." : "")
    : "";
  const passwordMessage = registering ? (passwordEdited ? localPasswordError : undefined) ?? passwordServerError ?? "" : passwordServerError ?? "";
  const usernameInvalid = registering && (!!(usernameEdited && localUsernameError) || !!usernameServerError || currentAvailability === "taken");
  const usernameValid = registering && !usernameInvalid && !localUsernameError && currentAvailability === "available";
  const passwordInvalid = !!passwordMessage;
  const passwordValid = registering && passwordEdited && !localPasswordError && !passwordServerError;
  const checking = registering && !localUsernameError && currentAvailability === "checking";
  const checkFailed = registering && !localUsernameError && currentAvailability === "error" && !usernameServerError;
  const localConfirmationError = confirmationError(password, confirmPassword);
  const confirmationServerError = serverError?.field === "confirmPassword" ? serverError.error : undefined;
  const confirmationMessage = (confirmationEdited ? localConfirmationError : undefined) ?? confirmationServerError ?? "";
  const canSubmit = registering ? usernameValid && !localPasswordError && !passwordServerError && !localConfirmationError && !confirmationServerError : !!username.trim() && !!password;

  function editUsername(value: string) {
    // Invalidate synchronously, including A → B → A edits before effects run.
    ++requestVersion.current;
    setUsername(value);
    setUsernameEdited(true);
    setDismissedError(submissionError);
    setAvailability({ username: value, status: usernameError(value) ? "idle" : "checking" });
  }

  return (
    <div className={`auth-scene auth-scene--${mode}`}>
      <section className={`panel auth-panel auth-panel--${mode}`}>
        <h1>{registering ? "Create your account" : "Welcome back"}</h1>
        <Form method="post" className="auth-form" noValidate onSubmit={(event) => { if (!canSubmit) event.preventDefault(); }}>
          <div className="auth-field">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" className="auth-input" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false}
              value={username} onChange={(event) => editUsername(event.target.value)} disabled={!ready || pending} required
              aria-describedby="username-message" aria-invalid={usernameInvalid || undefined} aria-busy={checking || undefined}
              data-state={usernameInvalid ? "invalid" : usernameValid ? "valid" : "neutral"} />
            <div id="username-message" className="auth-message" data-state={usernameInvalid ? "invalid" : usernameValid ? "valid" : checkFailed ? "error" : "neutral"}
              role={usernameServerError || checkFailed ? "alert" : "status"} aria-live={usernameServerError || checkFailed ? "assertive" : "polite"} aria-atomic="true">
              {checkFailed ? <button className="auth-retry" type="button" onClick={() => {
                ++requestVersion.current;
                setAvailability({ username, status: "checking" });
                setRetry((value) => value + 1);
              }}>Could not check. Try again.</button> : usernameMessage}
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-password">
            <input id="password" name="password" className="auth-input" type={passwordVisible ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"}
              value={password} onChange={(event) => {
                setPassword(event.target.value);
                setPasswordEdited(true);
                // A uniqueness conflict belongs to the username, not password.
                if (submissionError?.field !== "username") setDismissedError(submissionError);
              }} disabled={!ready || pending} required aria-describedby="password-message"
              aria-invalid={passwordInvalid || undefined} data-state={passwordInvalid ? "invalid" : passwordValid ? "valid" : "neutral"} />
              <button className="auth-password-toggle" type="button" aria-label={passwordVisible ? "Hide password" : "Show password"}
                aria-controls="password" disabled={!ready || pending} onClick={() => setPasswordVisible((visible) => !visible)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  {passwordVisible && <path d="m3 3 18 18" />}
                </svg>
              </button>
            </div>
            <div id="password-message" className="auth-message" data-state={passwordInvalid ? "invalid" : "neutral"}
              role={passwordServerError ? "alert" : "status"} aria-live={passwordServerError ? "assertive" : "polite"} aria-atomic="true">{passwordMessage}</div>
          </div>
          {registering && <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="auth-password">
              <input id="confirmPassword" name="confirmPassword" className="auth-input" type={confirmationVisible ? "text" : "password"} autoComplete="new-password"
                value={confirmPassword} onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setConfirmationEdited(true);
                  if (submissionError?.field === "confirmPassword") setDismissedError(submissionError);
                }} disabled={!ready || pending} required aria-describedby="confirmation-message" aria-invalid={!!confirmationMessage || undefined}
                data-state={confirmationMessage ? "invalid" : confirmationEdited && !localConfirmationError ? "valid" : "neutral"} />
              <button className="auth-password-toggle" type="button" aria-label={confirmationVisible ? "Hide confirmation password" : "Show confirmation password"}
                aria-controls="confirmPassword" disabled={!ready || pending} onClick={() => setConfirmationVisible((visible) => !visible)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  {confirmationVisible && <path d="m3 3 18 18" />}
                </svg>
              </button>
            </div>
            <div id="confirmation-message" className="auth-message" data-state={confirmationMessage ? "invalid" : "neutral"}
              role={confirmationServerError ? "alert" : "status"} aria-live={confirmationServerError ? "assertive" : "polite"} aria-atomic="true">{confirmationMessage}</div>
          </div>}
          {registering && <p className="auth-footer" id="recovery-notice">No account recovery. We do not collect email addresses.<br />Keep your username and password safe.</p>}
          <button type="submit" disabled={pending || !canSubmit}>{pending ? "Please wait…" : registering ? "Create account" : "Log in"}</button>
        </Form>
        <p className="auth-switch">{registering ? "Already have an account?" : "New here?"} <Link to={registering ? "/login" : "/register"}>{registering ? "Log in" : "Create an account"}</Link></p>
        {!registering && <p className="auth-footer">Contact admin at chloe.chenge.zhu@gmail.com for help.</p>}
      </section>
    </div>
  );
}
