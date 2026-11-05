import { z } from "zod";
import { fields, type LeadType } from "./forms";

export const PHONE = /^(?:\+?91|0)?[6-9]\d{9}$/;

/** Loaded on first submit, so zod stays out of the page's initial JavaScript. */
export function validate(type: LeadType, values: Record<string, string>) {
  const shape: Record<string, z.ZodType> = {};
  for (const field of fields[type]) {
    let rule: z.ZodType = z.string().trim().min(1, "required");
    if (field.kind === "email") rule = z.string().trim().min(1, "required").email("email");
    if (field.kind === "tel") rule = z.string().trim().min(1, "required").transform((v) => v.replace(/[\s-]/g, "")).pipe(z.string().regex(PHONE, "phone"));
    if (field.kind === "number") rule = z.string().trim().min(1, "required").regex(/^\d+$/, "number");
    shape[field.name] = field.required ? rule : z.union([z.literal(""), rule]);
  }
  const result = z.object(shape).safeParse(values);
  if (result.success) return { errors: {}, data: result.data as Record<string, string> };
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0]);
    errors[key] ??= issue.message;
  }
  return { errors, data: null };
}
