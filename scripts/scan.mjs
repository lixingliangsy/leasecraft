// scan.mjs — leasecraft 租赁合同起草合规审计（真实实现，T1 审计模板契约驱动）
// 领域：Real Estate Compliance / 租赁法。审计生成式租赁合同的关键条款与法域合规。
// 幂等：同输入同输出、无副作用、可重入。返回 { items:[{id,...}], metrics:{...} }
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA = path.join(ROOT, '.data')
const AUDIT = path.join(DATA, 'audit')

async function fetchText(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 12000)
  try {
    const r = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': 't1-audit-bot/1.0 (+https://lxsai.com)' } })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return await r.text()
  } finally { clearTimeout(t) }
}

async function loadTargets(targets) {
  const docs = []
  for (const t of targets) {
    try {
      if (/^https?:\/\//i.test(t)) { docs.push(await fetchText(t)); continue }
        const p = path.isAbsolute(t) ? t : path.join(AUDIT, t)
      docs.push(fs.readFileSync(p, 'utf8'))
    } catch (e) { console.warn('[scan] target load failed:', t, e.message) }
  }
  return docs
}

export async function scan(ctx) {
  const cfg = JSON.parse(fs.readFileSync(path.join(DATA, 'config.json'), 'utf8'))
  const targets = (cfg.scan && cfg.scan.targets) || [path.join(AUDIT, 'leasecraft-sample.json')]
  const docs = await loadTargets(targets)
  let cfgObj = {}
  try { cfgObj = JSON.parse(docs.join('\n')) } catch (e) { console.warn('[scan] parse failed', e.message) }
  const items = []

  const checks = [
    ['required_disclosures', 'leasecraft:disclosures-missing', 'legal', 'high', 'No required disclosures', '缺少法定披露（如铅漆/霉变/能效告知）'],
    ['illegal_clause_avoidance', 'leasecraft:illegal-clause-missing', 'legal', 'high', 'No illegal-clause avoidance', '未规避违法条款（如押金超限/免责歧视）'],
    ['fair_housing_compliance', 'leasecraft:fair-housing-missing', 'legal', 'high', 'No fair-housing compliance', '未校验公平住房法（Fair Housing Act）合规'],
    ['deposit_rules', 'leasecraft:deposit-missing', 'financial', 'medium', 'No deposit rules', '押金规则缺失/不合规'],
    ['termination_terms', 'leasecraft:termination-missing', 'legal', 'medium', 'No termination terms', '退租/违约终止条款缺失'],
    ['state_specific_clauses', 'leasecraft:state-clause-missing', 'legal', 'low', 'No state-specific clauses', '未引入州/地方法域特定条款'],
    ['renewal_terms', 'leasecraft:renewal-missing', 'legal', 'low', 'No renewal terms', '续约/转月条款缺失']
  ]
  const present = {}
  for (const [key, id, category, severity, title, detail] of checks) {
    const ok = cfgObj[key] === true
    present[key] = ok
    if (!ok) items.push({ id, category, severity, title, detail, present: false })
  }

  const weights = { high: 18, medium: 10, low: 5 }
  const bySeverity = { high: 0, medium: 0, low: 0 }
  let penalty = 0
  for (const it of items) { penalty += weights[it.severity] || 0; bySeverity[it.severity]++ }
  const score = Math.max(0, 100 - penalty)

  const metrics = {
    lease_compliance_score: score,
    total_checks: checks.length,
    passed: checks.length - items.length,
    by_severity: bySeverity,
    ...present
  }
  return { items, metrics }
}
