// Server-search results are transient. Keep the currently selected lead's label
// available after the dropdown clears its search and the first page changes.
export function meetingLeadOptions(results: any[] = [], selectedId: any, candidates: any[] = []) {
  const selected = String(selectedId || "");
  const pinned = candidates.find(lead => String(lead?._id || "") === selected && (lead?.clientName || lead?.name));
  const unique = new Map<string, { _id: string; name: string }>();
  for (const lead of [...results, ...(pinned ? [pinned] : [])]) {
    if (!lead?._id) continue;
    const id = String(lead._id);
    if (!unique.has(id)) unique.set(id, { _id: id, name: lead.clientName || lead.name || "Unnamed Lead" });
  }
  return [...unique.values()];
}
