type CatalogResult = { error: { code?: string; message: string } | null; status: number };

/** Retry transient reads only; never substitute stale prices or visibility flags. */
export async function readCatalogWithRetry<T extends CatalogResult>(
  read: () => PromiseLike<T>,
  wait: (milliseconds: number) => Promise<void> = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const result = await read();
    const transient = result.status === 0 || result.status === 408 || result.status === 429 || result.status >= 500;
    if (!result.error || !transient || attempt === 2) return result;
    await wait(250 * (attempt + 1));
  }
}
