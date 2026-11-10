// Creation rules are shared by the browser and server. Login deliberately does
// not apply the creation policy to existing passwords.
export const MAX_PASSWORD_LENGTH = 128;
export const INCORRECT_CREDENTIALS = "Incorrect username or password.";
export type AuthField = "username" | "password" | "confirmPassword";
export type AuthError = { error: string; field: AuthField; username: string };

export function usernameError(username: string): string | undefined {
  if (!username) return "Enter a username.";
  if (/\s/u.test(username)) return "No spaces.";
  if (username.length < 3 || username.length > 32) return "Use 3–32 characters.";
  if (!/^[A-Za-z0-9_]+$/.test(username)) return "Use letters, numbers or _.";
}

export function passwordError(password: string): string | undefined {
  if (!password) return "Enter a password.";
  // Check the safety cap before character classes, even for an otherwise invalid
  // password. Length is measured in UTF-16 code units, as in native inputs.
  if (password.length > MAX_PASSWORD_LENGTH) return "Use at most 128 characters.";
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Add an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Add a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Add a number.";
  // Symbols are ASCII punctuation, not whitespace, emoji or non-ASCII letters.
  if (!/[!-/:-@\[-`{-~]/.test(password)) return "Add a symbol.";
}

type Credentials = { username: string; password: string };

export function confirmationError(password: string, confirmation: string): string | undefined {
  if (!confirmation) return "Enter your password again.";
  if (password !== confirmation) return "Passwords do not match.";
}

export function validateSignup(form: URLSearchParams): Credentials | AuthError {
  const username = form.get("username") ?? "";
  const password = form.get("password") ?? "";
  const usernameMessage = usernameError(username);
  if (form.getAll("username").length !== 1 || usernameMessage) {
    return { error: usernameMessage ?? "Use letters, numbers or _.", field: "username", username } as const;
  }
  const passwordMessage = passwordError(password);
  if (form.getAll("password").length !== 1 || passwordMessage) {
    return { error: passwordMessage ?? "Enter a password.", field: "password", username } as const;
  }
  const confirmationMessage = confirmationError(password, form.get("confirmPassword") ?? "");
  if (form.getAll("confirmPassword").length !== 1 || confirmationMessage) {
    return { error: confirmationMessage ?? "Enter your password again.", field: "confirmPassword", username } as const;
  }
  return { username, password } as const;
}

export function validateLogin(form: URLSearchParams): Credentials | AuthError {
  // Older registrations trimmed usernames. Preserve that login convenience,
  // without trimming signup input or ever modifying the password.
  const username = (form.get("username") ?? "").trim();
  const password = form.get("password") ?? "";
  if (form.getAll("username").length !== 1 || usernameError(username)
    || form.getAll("password").length !== 1 || !password || password.length > MAX_PASSWORD_LENGTH) {
    return { error: INCORRECT_CREDENTIALS, field: "password", username } as const;
  }
  return { username, password } as const;
}
