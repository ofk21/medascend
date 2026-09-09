"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FormError, FormSuccess } from "@/components/ui/form";
import { submitContact, type ContactState } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, {});
  return (
    <form action={action} className="rounded-2xl border border-line bg-card p-6 shadow-soft sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required placeholder="Dr Jane Smith" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="you@hospital.nhs.uk" />
        </div>
      </div>
      <div className="mt-5">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required placeholder="How can we help?" />
      </div>
      <div className="mt-5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required minLength={10} placeholder="Tell us a bit more…" />
      </div>
      <div className="mt-5 space-y-3">
        <FormError message={state.error} />
        <FormSuccess message={state.success} />
        <Button type="submit" loading={pending} className="w-full sm:w-auto">
          Send message
        </Button>
      </div>
    </form>
  );
}
