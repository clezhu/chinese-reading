import { createContext } from "react-router";

// React Router v8 uses typed request context, not v7's AppLoadContext object.
export const cloudflareContext = createContext<{ env: Env; ctx: ExecutionContext }>();
