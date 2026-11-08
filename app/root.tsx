import { isRouteErrorResponse, Links, Link, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import "./styles.css";

export const meta: Route.MetaFunction = () => [
  { title: "Chinese Reader" },
  { name: "description", content: "Connect the Mandarin you know to the characters you read." },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta /><Links />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <header className="site-header"><Link to="/lessons" className="brand">Chinese Reader <span lang="zh-Hans">中文阅读</span></Link></header>
        <main id="main" tabIndex={-1}>{children}</main>
        <footer>Familiar language. New characters. One lesson at a time.</footer>
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
