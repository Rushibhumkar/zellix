export function effectiveLeadLimit(page: any): number | undefined {
  const value = Number(page?.pagination?.limit ?? page?.pagination?.pageSize ?? page?.pagination?.perPage);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export function nextLeadPage(page: any): number | undefined {
  const pagination = page?.pagination;
  if (!pagination) return undefined;
  const current = Number(pagination.currentPage ?? pagination.page ?? 1);
  if (!Number.isFinite(current) || current < 1) return undefined;
  const hasNext = pagination.hasNext ?? pagination.hasNextPage;
  if (typeof hasNext === "boolean") return hasNext ? current + 1 : undefined;
  const limit = effectiveLeadLimit(page);
  return limit && Number.isFinite(Number(pagination.totalItem)) && current * limit < Number(pagination.totalItem)
    ? current + 1 : undefined;
}
