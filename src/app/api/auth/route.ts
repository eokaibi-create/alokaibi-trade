import { NextResponse } from "next/server";
import { getDb, parseBody } from "@/lib/db";
import { comparePassword, createToken, verifyToken, getAdminToken, setAdminCookie, clearAdminCookie } from "@/lib/auth";

// GET: Check if logged in via cookie
export async function GET() {
  try {
    const token = await getAdminToken();
    if (!token) return NextResponse.json({ authed: false }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ authed: false }, { status: 401 });

    return NextResponse.json({ authed: true, username: payload.username });
  } catch {
    return NextResponse.json({ authed: false }, { status: 401 });
  }
}

// POST: Login
export async function POST(req: Request) {
  try {
    const body = await parseBody(req);
    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const db = getDb();
    const result = await db.execute(
      "SELECT id, username, password_hash FROM admins WHERE username = ?",
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const admin = result.rows[0];
    if (!comparePassword(password, admin.password_hash as string)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createToken(admin.username as string);
    const response = NextResponse.json({
      token,
      admin: { id: admin.id, username: admin.username },
    });
    response.cookies.set(setAdminCookie(token));
    return response;
  } catch (err: any) {
    console.error("Auth error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
