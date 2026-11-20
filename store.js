// Requirement store: pure logic over a plain state object, persisted through an adapter.
export function createStore(state = { reqs: [], logs: [] }, now = () => new Date().toISOString()) {
  let nextLog = state.logs.length + 1;
  const get = (id) => state.reqs.find((r) => r.id === Number(id));

  function create(title, body = '') {
    if (!title || !title.trim()) throw new Error('제목을 입력하세요');
    const req = { id: state.reqs.length + 1, title: title.trim(), currentBody: body, status: '활성', createdAt: now() };
    state.reqs.push(req);
    return req;
  }

  function update(id, body, reason) {
    const req = get(id);
    if (!req) throw new Error('항목 없음');
    if (!reason || !reason.trim()) throw new Error('변경 이유를 입력하세요');
    if (body === req.currentBody) return req;
    state.logs.push({ id: nextLog++, requirementId: req.id, previousBody: req.currentBody, newBody: body, reason: reason.trim(), changedAt: now() });
    req.currentBody = body;
    return req;
  }

  // Delete is a status mark: the item and its history stay. Same-status commands change nothing.
  function setStatus(id, status) {
    const req = get(id);
    if (!req) throw new Error('항목 없음');
    if (req.status === status) return req;
    req.status = status;
    if (status !== '삭제됨') return req;
    const reason = '삭제';
    state.logs.push({ id: nextLog++, requirementId: req.id, previousBody: req.currentBody, newBody: req.currentBody, reason, status, changedAt: now() });
    return req;
  }
  const remove = (id) => setStatus(id, '삭제됨');
  const restore = (id) => setStatus(id, '활성');

  // Newest changedAt first; equal times fall back to the later log id.
  const history = (id) => state.logs.filter((l) => l.requirementId === Number(id))
    .sort((a, b) => b.changedAt.localeCompare(a.changedAt) || b.id - a.id);

  function bodyAt(id, logId) {
    const log = history(id).find((l) => l.id === Number(logId));
    return log ? log.newBody : null;
  }

  return { state, get, list: () => state.reqs, create, update, remove, restore, history, bodyAt };
}
