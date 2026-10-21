export const PUBLIC_ROUNDS_PAGE_SIZE = 25;

export async function readAllPages<T>(
  readPage: (offset: number, limit: number) => Promise<T[]>,
): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;
  while (true) {
    const page = await readPage(offset, PUBLIC_ROUNDS_PAGE_SIZE);
    all.push(...page);
    if (page.length < PUBLIC_ROUNDS_PAGE_SIZE) return all;
    offset += PUBLIC_ROUNDS_PAGE_SIZE;
  }
}
