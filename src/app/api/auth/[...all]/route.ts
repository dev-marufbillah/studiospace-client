import { auth } from "@/lib/auth";

/** Better Auth HTTP handler: /api/auth/* (sign-in, sign-up, OAuth, session). */
const handler = auth.handler;

export { handler as GET, handler as POST };
