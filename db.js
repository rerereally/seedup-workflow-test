// Persistence: Supabase REST when window.SEEDUP_DB = { url, anonKey } is set (config.js, not committed), else memory only.
// shortcut: whole state saved as one jsonb row, last write wins; switch to per-row tables if several people edit at once.
const ROW = 'main';

export async function load(cfg) {
  if (!cfg) return { reqs: [], logs: [] };
  const res = await fetch(`${cfg.url}/rest/v1/app_state?id=eq.${ROW}&select=data`, { headers: headers(cfg) });
  if (!res.ok) throw new Error(`DB 읽기 실패 (${res.status})`);
  const rows = await res.json();
  return rows[0]?.data ?? { reqs: [], logs: [] };
}

export async function save(cfg, state) {
  if (!cfg) return;
  const res = await fetch(`${cfg.url}/rest/v1/app_state`, {
    method: 'POST',
    headers: { ...headers(cfg), 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ id: ROW, data: state }),
  });
  if (!res.ok) throw new Error(`DB 저장 실패 (${res.status})`);
}

const headers = (cfg) => ({ apikey: cfg.anonKey, Authorization: `Bearer ${cfg.anonKey}` });
