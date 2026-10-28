// Empty charts must never replace server counts with sample/demo values.
export const getHRMChartValues = <T extends { key: string; value: number }>(
  definitions: T[],
  counts?: Record<string, unknown>,
): T[] => definitions.map(item => {
  const raw = counts?.[item.key];
  const value = typeof raw === "number" || typeof raw === "string" ? Number(raw) : 0;
  return { ...item, value: Number.isFinite(value) && value > 0 ? value : 0 };
});
