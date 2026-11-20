import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from './store.js';

const clock = () => { let t = 0; return () => new Date(Date.UTC(2026, 0, 1, 0, 0, t++)).toISOString(); };

test('F-02: history is newest first and each row has time, reason, new body', () => {
  const s = createStore(undefined, clock());
  s.create('결제 취소', 'A');
  s.update(1, 'B', '범위 축소');
  s.update(1, 'C', '범위 확대');
  const h = s.history(1);
  assert.deepEqual(h.map((l) => l.newBody), ['C', 'B']);
  assert.ok(h[0].changedAt > h[1].changedAt);
  for (const l of h) assert.ok(l.changedAt && l.reason && l.newBody);
});

test('F-02: picking a history row returns the body at that point', () => {
  const s = createStore(undefined, clock());
  s.create('결제 취소', 'A');
  s.update(1, 'B', '범위 축소');
  s.update(1, 'C', '범위 확대');
  const older = s.history(1)[1];
  assert.equal(s.bodyAt(1, older.id), 'B');
});

test('F-02: no history yields an empty list', () => {
  const s = createStore();
  s.create('x');
  assert.deepEqual(s.history(1), []);
});
