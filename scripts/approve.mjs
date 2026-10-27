#!/usr/bin/env node
// approve.mjs — mark tools approved. usage: node scripts/approve.mjs slug1 slug2 ... | --all-pass
import { readFileSync, writeFileSync } from 'node:fs';
const p = new URL('../data/built.json', import.meta.url);
const j = JSON.parse(readFileSync(p, 'utf8'));
const args = process.argv.slice(2); const all = args.includes('--all-pass');
const when = new Date().toISOString();
for (const t of j.tools) if ((all && t.status === 'pass') || args.includes(t.slug)) { t.approved = true; t.approvedAt = when; }
j.updated = when; writeFileSync(p, JSON.stringify(j, null, 2));
console.log('approved:', j.tools.filter(t => t.approved).length, '/', j.tools.filter(t => t.status === 'pass').length);
