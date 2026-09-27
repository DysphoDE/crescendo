// Minimaler Event-Bus
const handlers = new Map();

export const bus = {
  on(evt, fn) {
    if (!handlers.has(evt)) handlers.set(evt, new Set());
    handlers.get(evt).add(fn);
    return () => handlers.get(evt).delete(fn);
  },
  emit(evt, data) {
    const set = handlers.get(evt);
    if (set) for (const fn of set) {
      try { fn(data); } catch (e) { console.error('Bus-Fehler bei', evt, e); }
    }
  },
};
