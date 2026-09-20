export const RULESET_VERSION = 'lease-legal@2026-09-17'

export type RuleHit = { id: string; title: string; severity: "low" | "medium" | "high"; passed: boolean; remediation?: string; ref?: string }

export function runDeterministicChecks(inputs: Record<string, string>): RuleHit[] {
  const blob = Object.values(inputs || {}).join("\n").trim()
  return [
    {
      id: "IN-01",
      title: "Primary input provided",
      severity: "high",
      passed: blob.length >= 8,
      remediation: "Provide enough context for a useful run.",
    },
  ]
}
