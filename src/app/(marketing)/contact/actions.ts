"use server";

import { z } from "zod";
import { db } from "@/lib/db";

export type ContactState = { error?: string; success?: string };

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email"),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10, "Please write a little more").max(5000),
});

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  await db.contactMessage.create({ data: parsed.data });
  return { success: "Thanks – your message has been received. We reply within one working day." };
}
