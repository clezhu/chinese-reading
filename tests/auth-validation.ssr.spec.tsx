import { expect, test } from "@playwright/test";
import { INCORRECT_CREDENTIALS, passwordError, usernameError, validateLogin, validateSignup } from "../app/lib/auth-validation";
import { authenticate } from "../app/lib/auth.server";
import { scryptSync } from "node:crypto";

const valid = { username: "Garden_reader", password: "Garden1!" };

test("username reports exactly the highest-priority creation rule without trimming", () => {
  for (const [value, message] of [
    ["", "Enter a username."], [" ", "No spaces."], ["ab ", "No spaces."],
    ["a".repeat(33) + " ", "No spaces."], ["\treader", "No spaces."],
    ["!", "Use 3–32 characters."], ["a".repeat(33) + "!", "Use 3–32 characters."],
    ["你好啊", "Use letters, numbers or _."], ["réader", "Use letters, numbers or _."],
    ["bad!", "Use letters, numbers or _."],
  ]) {
    expect(usernameError(value), value).toBe(message);
    expect(validateSignup(new URLSearchParams({ ...valid, username: value }))).toEqual({ username: value, field: "username", error: message });
  }
  for (const username of ["a_B", "a".repeat(32), valid.username]) expect(usernameError(username)).toBeUndefined();
});

test("password creation priority, maximum and ASCII character classes match server validation", () => {
  for (const [password, message] of [
    ["", "Enter a password."], ["A1!a", "Use at least 8 characters."],
    ["lower1!!", "Add an uppercase letter."], ["UPPER1!!", "Add a lowercase letter."],
    ["Garden!!", "Add a number."], ["Garden12", "Add a symbol."],
    ["Garden1 ", "Add a symbol."], ["Garden1é", "Add a symbol."],
    ["Garden1中", "Add a symbol."], ["Garden1🌸", "Add a symbol."],
    ["a".repeat(129), "Use at most 128 characters."],
  ]) {
    expect(passwordError(password), password).toBe(message);
    expect(validateSignup(new URLSearchParams({ ...valid, password }))).toEqual({ username: valid.username, field: "password", error: message });
  }
  for (const symbol of "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~") expect(passwordError(`Garden1${symbol}`)).toBeUndefined();
  for (const password of ["Garden1!", "Garden12!", "Garden123!", "Garden1234!", `Garden1!${"a".repeat(120)}`]) {
    expect(passwordError(password)).toBeUndefined();
    expect(validateSignup(new URLSearchParams({ ...valid, password }))).toEqual({ ...valid, password });
    expect(validateLogin(new URLSearchParams({ ...valid, password }))).toEqual({ ...valid, password });
  }
});

test("signup rejects missing/duplicate fields and all errors omit passwords", () => {
  for (const body of [
    "", "username=reader", "password=Garden1!", "username=reader&username=other&password=Garden1!",
    "username=reader&password=Garden1!&password=Garden1!",
  ]) {
    const result = validateSignup(new URLSearchParams(body));
    expect(result).toHaveProperty("error");
    expect(result).not.toHaveProperty("password");
  }
});

test("login has only bounded credential validation and generic errors, not signup complexity", () => {
  for (const password of ["legacy lowercase passphrase", "old password with spaces", "Garden1!", "Garden1234!"]) {
    expect(validateLogin(new URLSearchParams({ username: " Garden_reader ", password }))).toEqual({ username: valid.username, password });
  }
  for (const body of ["", "username=ab&password=Garden1!", "username=reader&password=", `username=reader&password=${"a".repeat(129)}`,
    "username=reader&username=other&password=Garden1!", "username=reader&password=Garden1!&password=other"]) {
    const result = validateLogin(new URLSearchParams(body));
    expect(result).toHaveProperty("error", INCORRECT_CREDENTIALS);
    expect(result).not.toHaveProperty("password");
  }
});

test("existing non-complex hashes and new short passwords verify without changing scrypt", async () => {
  for (const password of ["legacy lowercase passphrase", "Garden1!", "Garden12!", "Garden123!", "Garden1234!"]) {
    const salt = Buffer.alloc(16, 7);
    const key = scryptSync(password, salt, 32, { N: 32768, r: 8, p: 3, maxmem: 48 * 1024 * 1024 });
    const stored = { id: "existing-user", username: valid.username, password_hash: `scrypt$32768$8$3$${salt.toString("hex")}$${key.toString("hex")}` };
    const db = { prepare: () => ({ bind: () => ({ first: async () => stored }) }) } as unknown as D1Database;
    expect(await authenticate(db, valid.username, password)).toEqual({ id: stored.id, username: valid.username });
    expect(await authenticate(db, valid.username, `${password}wrong`)).toBeNull();
  }
});
