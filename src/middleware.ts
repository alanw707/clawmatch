import { auth } from "@/server/auth";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");
  const isPublicPage = nextUrl.pathname === "/" || isAuthPage || nextUrl.pathname.startsWith("/api");

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL("/", nextUrl));
  }

  // Redirect unauthenticated users to login (except public pages)
  if (!isLoggedIn && !isPublicPage) {
    return Response.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
