// One read-change-write at a time per data file. Hold it to the end of a block:
//   using _lock = await lockFile(REGISTRATIONS_FILE);
// and it frees itself when the block ends, even after an early return or an error.
// shortcut: in-process only; correct for one Node process (Hostinger), needs a file lock if the site ever runs several.
const tails = new Map<string, Promise<void>>();

export async function lockFile(file: string): Promise<Disposable> {
  const before = tails.get(file) ?? Promise.resolve();
  let release!: () => void;
  const tail = before.then(() => new Promise<void>((resolve) => (release = resolve)));
  tails.set(file, tail);
  await before;
  return {
    [Symbol.dispose]() {
      if (tails.get(file) === tail) tails.delete(file);
      release();
    },
  };
}
