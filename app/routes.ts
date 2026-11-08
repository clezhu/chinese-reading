import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("register", "routes/register.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("lessons", "routes/lessons.tsx"),
  route("lessons/:lessonId", "routes/lesson.tsx"),
  route("lessons/:lessonId/reader", "routes/reader.ts"),
] satisfies RouteConfig;
