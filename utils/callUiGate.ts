// Independent leases prevent one call screen from unblocking another.
export const createCallUiGate = () => {
  const leases = new Set<symbol>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  return {
    getSnapshot: () => leases.size > 0,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    acquire: () => {
      const lease = Symbol("call-ui");
      leases.add(lease);
      notify();
      return () => { if (leases.delete(lease)) notify(); };
    },
  };
};

export const callUiGate = createCallUiGate();
