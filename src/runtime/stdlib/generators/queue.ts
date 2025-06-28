export async function* queue<T>(initialize: (change: (value: T) => void) => unknown) {
  let resolve: ((value: T) => void) | undefined;
  const values: T[] = [];

  const dispose = initialize((x) => {
    values.push(x);
    if (resolve) {
      resolve(values.shift() as T);
      resolve = undefined;
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
      yield values.length ? (values.shift() as T) : new Promise<T>((_) => (resolve = _));
    }
  } finally {
    if (dispose != null) {
      dispose();
    }
  }
}
