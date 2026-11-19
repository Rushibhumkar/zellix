export function getSubmissionProject(lead: any, submission: any) {
  const enquiries = Array.isArray(lead.enquiries) ? lead.enquiries : [];
  const submittedAt = new Date(submission.submittedAt || "").getTime();
  const matches = enquiries.filter((entry: any) => Number.isFinite(submittedAt) && Math.abs(new Date(entry.createdAt || "").getTime() - submittedAt) <= 60_000);
  if (matches.length === 1 && matches[0].projectName?.trim()) return matches[0].projectName.trim();
  if (!lead.isDuplicate && enquiries.length <= 1 && lead.name?.trim()) return lead.name.trim();
  return "Project not recorded";
}
