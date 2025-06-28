export class Observer {
  #promise?: Promise<unknown>;
  fulfilled?: (value: unknown) => void;
  rejected?: (error: unknown) => void;
  constructor() {
    this.next();
  }
  async next() {
    const value = await this.#promise;
    this.#promise = new Promise((res, rej) => ((this.fulfilled = res), (this.rejected = rej)));
    return {done: false, value};
  }
  throw() {
    return {done: true};
  }
  return() {
    return {done: true};
  }
}
