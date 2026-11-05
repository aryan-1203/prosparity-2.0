export const leadTypes = ["dealer", "battery", "lender", "investor", "callback", "contact", "newsletter"] as const;
export type LeadType = (typeof leadTypes)[number];

export interface Field {
  name: string;
  kind: "text" | "tel" | "email" | "number" | "select" | "textarea";
  required: boolean;
  autoComplete?: string;
  options?: readonly string[];
}

const name: Field = { name: "name", kind: "text", required: true, autoComplete: "name" };
const phone: Field = { name: "phone", kind: "tel", required: true, autoComplete: "tel" };
const email: Field = { name: "email", kind: "email", required: true, autoComplete: "email" };
const emailOptional: Field = { ...email, required: false };
const phoneOptional: Field = { ...phone, required: false };
const city: Field = { name: "city", kind: "text", required: true, autoComplete: "address-level2" };
const message: Field = { name: "message", kind: "textarea", required: true };
const messageOptional: Field = { ...message, required: false };

/** Mirrored by apps/api/app/schemas.py. Change both together. */
export const fields: Record<LeadType, readonly Field[]> = {
  dealer: [
    { name: "businessName", kind: "text", required: true, autoComplete: "organization" },
    city,
    { name: "state", kind: "select", required: true, options: ["up", "mp", "cg", "other"] },
    { name: "brands", kind: "text", required: true },
    { name: "monthlyEvSales", kind: "number", required: true },
    name,
    phone,
    emailOptional,
  ],
  battery: [
    { name: "company", kind: "text", required: true, autoComplete: "organization" },
    name,
    phone,
    email,
    messageOptional,
  ],
  lender: [
    { name: "institution", kind: "text", required: true, autoComplete: "organization" },
    { name: "institutionType", kind: "select", required: true, options: ["bank", "nbfc", "fund", "other"] },
    name,
    phone,
    email,
    messageOptional,
  ],
  investor: [name, { name: "firm", kind: "text", required: true, autoComplete: "organization" }, email, phoneOptional, messageOptional],
  callback: [
    name,
    phone,
    city,
    { name: "vehicleType", kind: "select", required: true, options: ["e3w", "cargo", "e2w", "battery", "notSure"] },
    { name: "preferredLanguage", kind: "select", required: true, options: ["hi", "en"] },
  ],
  contact: [
    name,
    email,
    phoneOptional,
    { name: "topic", kind: "select", required: true, options: ["loanStatus", "payEmi", "updateDetails", "grievance", "dealer", "other"] },
    message,
  ],
  newsletter: [email],
};
