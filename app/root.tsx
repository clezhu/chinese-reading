import { isRouteErrorResponse, Links, Link, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from "react-router";
import type { Route } from "./+types/root";
import "./styles.css";
import "./garden.css";

export const meta: Route.MetaFunction = () => [
  { title: "Hanzi Garden" },
  { name: "description", content: "Learn to read Chinese for free!" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const inLesson = pathname.startsWith("/lessons/");
  const home = pathname === "/";
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta /><Links />
        <link rel="icon" type="image/png" sizes="32x32" href="/art/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/art/favicon-16.png" />
      </head>
      <body className={inLesson ? "page-lesson" : home ? "page-home" : pathname === "/lessons" ? "page-lessons" : "page-auth"}>
        <a className="skip-link" href="#main">Skip to content</a>
        {!inLesson && <header className="site-header"><Link to="/" className="brand">Hanzi Garden</Link>{home && <nav aria-label="Account"><Link to="/login">Login</Link><Link to="/register" className="button signup-link">Sign up</Link></nav>}</header>}
        <main id="main" tabIndex={-1}>{children}</main>
        <ScrollRestoration /><Scripts />
      </body>
    </html>
  );
}

export default function App() { return <Outlet />; }

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const locked = isRouteErrorResponse(error) && error.status === 403 && error.data === "Lesson locked";
  const message = locked ? "This lesson is locked. Complete the previous lesson first."
    : status === 403 ? "This request could not be verified. Reload this site and try again."
    : status === 404 ? "We couldn’t find that page."
    : status === 400 ? "That request is not supported. No progress was changed."
    : status === 405 ? "That action is not available."
    : "Something went wrong. Please try again. Your progress has not been confirmed as saved.";
  return <section className="panel"><h1>{locked ? "Lesson locked" : "Unable to open this page"}</h1><p role="alert">{message}</p><Link to="/lessons">Back to lessons</Link></section>;
}
