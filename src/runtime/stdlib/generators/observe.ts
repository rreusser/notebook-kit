export async function* observe<T>(initialize: (change: (value: T) => void) => unknown) {
  let resolve: ((value: T) => void) | undefined;
  let value: T | undefined;
  let stale = false;

  const dispose = initialize((x) => {
    value = x;
    if (resolve) {
      resolve(x);
      resolve = undefined;
    } else {
      stale = true;
    }
    return x;
  });

  if (dispose != null && typeof dispose !== "function") {
    throw new Error(
      typeof dispose === "object" && "then" in dispose && typeof dispose.then === "function"
        ? "async initializers are not supported"
        : "initializer returned something, but not a dispose function"
    );
  }

  try {
    while (true) {
      yield stale ? ((stale = false), value as T) : new Promise<T>((_) => (resolve = _));
    }
  } finally {
    if (dispose != null) {
      dispose();
    }
  }
}
