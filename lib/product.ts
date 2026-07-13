export interface InputField {
  key: string
  label: string
  type: 'input' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export const PRODUCT = {
  name: "LeaseCraft",
  slug: "leasecraft",
  tagline: "Clear lease clauses for any situation - late rent, pets, deposits.",
  description: "Pick the clause you need and your state, and get plain-English lease language you can drop straight into your agreement - marked as a template, not legal advice.",
  toolTitle: "Draft a lease clause",
  resultLabel: "Your lease clause",
  ctaLabel: "Draft clause",
  features: [
  "Plain-English clauses",
  "State-aware framing",
  "Landlord & tenant sides",
  "Drop-in ready"
],
  inputs: [
  {
    "key": "clausetype",
    "label": "Clause",
    "type": "select",
    "options": [
      "Late rent",
      "Pets",
      "Security deposit",
      "Subletting",
      "Maintenance",
      "Entry notice"
    ]
  },
  {
    "key": "state",
    "label": "State / region",
    "type": "select",
    "options": [
      "CA",
      "NY",
      "TX",
      "FL",
      "IL",
      "Other US",
      "Canada",
      "UK",
      "AU"
    ]
  },
  {
    "key": "party",
    "label": "Written for",
    "type": "select",
    "options": [
      "Landlord",
      "Tenant",
      "Both"
    ]
  },
  {
    "key": "detail",
    "label": "Specifics (optional)",
    "type": "textarea",
    "placeholder": "e.g. 5% late fee after 5 days, max 2 pets"
  }
] as InputField[],
  systemPrompt: "You are a landlord-tenant documentation writer. Given a clause type, a state/region, who it is written for, and optional specifics, write a plain-English lease clause that reflects common practice for that region. Keep it neutral and drop-in ready. Add a one-line note that this is a template, not legal advice, and that local law controls. In demo mode, return a realistic sample clause following this structure.",
  pricing: [
  {
    "tier": "Free",
    "price": "$0",
    "desc": "5 clauses/mo"
  },
  {
    "tier": "Pro",
    "price": "$15/mo",
    "desc": "Unlimited, save history"
  }
],
  mock: (inputs: Record<string, string>): string => {
  const ct = inputs['clausetype'] || 'Late rent'
  const st = inputs['state'] || 'Other US'
  const p = inputs['party'] || 'Both'
  const d = (inputs['detail'] || '').trim()
  let out = 'LEASE CLAUSE - ' + ct + ' (' + st + ' | for: ' + p + ')\n\n'
  if (ct === 'Late rent') {
    out += 'If rent is not received within 5 days of the due date, a late fee of 5% of the overdue amount applies. Repeated late payments may be grounds for notice per ' + st + ' law.\n'
  } else if (ct === 'Pets') {
    out += 'Tenant may keep up to 2 pets with a one-time pet fee and monthly pet rent. Service and assistance animals are exempt from pet fees per applicable law.\n'
  } else if (ct === 'Security deposit') {
    out += 'A security deposit equal to one month\'s rent is held per ' + st + ' rules and returned within the statutory window after move-out, less documented damages.\n'
  } else {
    out += 'The parties agree to the terms for "' + ct + '" as set out in the body of this agreement, consistent with ' + st + ' practice.\n'
  }
  if (d) out += '\nSpecifics provided: ' + d + '\n'
  out += '\nNote: template only, not legal advice; local law controls.\n'
  out += '\n--- (Mock demo. Pick the clause + state for a tailored draft.)'
  return out
}
}
