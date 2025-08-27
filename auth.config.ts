import { NextAuthConfig } from "next-auth";
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      console.log(auth, request);
      const isLoggedIn = !!auth?.user;
      const isOnDashBoard = request.nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashBoard) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
