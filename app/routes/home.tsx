import { Link, redirect } from "react-router";
import { getUser } from "../lib/auth.server";
import { cloudflareContext } from "../context";
import type { Route } from "./+types/home";

export async function loader({ request, context }: Route.LoaderArgs) {
  if (await getUser(request, context.get(cloudflareContext).env.DB)) return redirect("/lessons");
  return null;
}

export default function Home() {
  return <section className="home-hero">
    <div className="home-scene" aria-hidden="true"><div className="scene-layer scene-backdrop" /><div className="scene-layer scene-fog scene-fog--back" /><div className="scene-layer scene-temple" /><div className="scene-layer scene-fog scene-fog--front" /><div className="scene-layer scene-blossoms" /></div>
    <div className="home-copy"><h1>Learn to read<br className="desktop-break" /> Chinese for free!</h1><Link className="button" to="/register">Get Started</Link></div>
  </section>;
}
