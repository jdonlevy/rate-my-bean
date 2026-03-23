import bcrypt from "bcryptjs";
import { createCredentialsUser, getUserByEmail } from "@/lib/db";

export async function POST(request) {
  const body = await request.json();
  const email = body?.email?.toString().trim().toLowerCase();
  const password = body?.password?.toString();
  const name = body?.name?.toString().trim() || "";

  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing?.id) {
    return Response.json({ error: "Email already registered." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createCredentialsUser({ email, name, passwordHash });

  return Response.json({ id: user.id, email: user.email, name: user.name });
}
