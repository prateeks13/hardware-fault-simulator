export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { addHours } from "date-fns";
import { db } from "@/lib/db";

const requestSchema = z.object({ email: z.string().email() });
const resetSchema   = z.object({ token: z.string(), password: z.string().min(8) });

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Step 1: Request token
  const req1 = requestSchema.safeParse(body);
  if (req1.success) {
    const user = await db.user.findUnique({ where: { email: req1.data.email } });
    if (user) {
      await db.passwordReset.deleteMany({ where: { userId: user.id, used: false } });
      await db.passwordReset.create({
        data: { userId: user.id, expires: addHours(new Date(), 1) },
      });
      // In production: send email with reset link. For now, log the token.
      console.info(`[reset] Token created for user ${user.id}`);
    }
    return NextResponse.json({ success: true });
  }

  // Step 2: Use token
  const req2 = resetSchema.safeParse(body);
  if (!req2.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const reset = await db.passwordReset.findUnique({ where: { token: req2.data.token } });
  if (!reset || reset.used || reset.expires < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(req2.data.password, 12);
  await db.$transaction([
    db.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    db.passwordReset.update({ where: { id: reset.id }, data: { used: true } }),
  ]);

  return NextResponse.json({ success: true });
}
