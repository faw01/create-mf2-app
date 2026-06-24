"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import type { Dictionary } from "@repo/internationalization";
import { Check, MoveRight } from "lucide-react";
import { useActionState } from "react";
import { type ContactFormState, contact } from "../actions/contact";

type ContactFormProps = {
  dictionary: Dictionary;
};

const initialState: ContactFormState = { status: "idle" };

export const ContactForm = ({ dictionary }: ContactFormProps) => {
  const [state, formAction, isPending] = useActionState(contact, initialState);
  const form = dictionary.web.contact.hero.form;

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h4 className="max-w-xl text-left font-regular text-3xl tracking-tighter md:text-5xl">
                  {dictionary.web.contact.meta.title}
                </h4>
                <p className="max-w-sm text-left text-lg text-muted-foreground leading-relaxed tracking-tight">
                  {dictionary.web.contact.meta.description}
                </p>
              </div>
            </div>
            {dictionary.web.contact.hero.benefits.map((benefit) => (
              <div
                className="flex flex-row items-start gap-6 text-left"
                key={benefit.title}
              >
                <Check className="mt-2 h-4 w-4 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>{benefit.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center">
            <form
              action={formAction}
              className="flex w-full max-w-sm flex-col gap-4 rounded-md border p-8"
            >
              <p>{form.title}</p>
              <div className="grid w-full max-w-sm items-center gap-1">
                <Label htmlFor="name">{form.name}</Label>
                <Input id="name" name="name" required type="text" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1">
                <Label htmlFor="email">{form.email}</Label>
                <Input id="email" name="email" required type="email" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1">
                <Label htmlFor="message">{form.message}</Label>
                <Textarea id="message" name="message" required rows={4} />
              </div>

              {state.status === "error" ? (
                <p className="text-destructive text-sm">{state.error}</p>
              ) : null}
              {state.status === "success" ? (
                <p className="text-muted-foreground text-sm">{form.success}</p>
              ) : null}

              <Button className="w-full gap-4" disabled={isPending}>
                {form.cta} <MoveRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
