import type { QueryClient } from "@tanstack/react-query";
import { queryKeyCRM } from "./queryKeys";
import {
  newLeadInteractionId,
  performanceNow,
  recordLeadSaveTiming,
} from "./leadSavePerformance";

export type LeadSaveProgress = {
  fingerprint?: string;
  statusSaved?: boolean;
  status?: string;
  response?: any;
  interactionId?: string;
};

export async function saveLeadInteraction({
  progress, fingerprint, status, writeStatus, writeCall, onSaved, refresh,
}: {
  progress: LeadSaveProgress;
  fingerprint: string;
  status: string;
  writeStatus: (interactionId: string) => Promise<any>;
  writeCall: (interactionId: string) => Promise<unknown>;
  onSaved: (response: any) => void;
  refresh: (interactionId: string) => Promise<unknown>;
}) {
  if (progress.fingerprint !== fingerprint) {
    Object.assign(progress, {
      fingerprint, statusSaved: false, status,
      interactionId: newLeadInteractionId(), response: undefined,
    });
  }
  const interactionId = progress.interactionId!;
  if (!progress.statusSaved) {
    progress.response = await writeStatus(interactionId);
    progress.statusSaved = true;
  }
  await writeCall(interactionId);
  onSaved(progress.response);
  // UI completion depends only on the writes. Refresh errors stay independent.
  void refresh(interactionId).catch(() => {});
}

type RefreshRequest = {
  interactionId: string;
  rerun: boolean;
  promise: Promise<void>;
};
const refreshing = new WeakMap<QueryClient, Map<string, RefreshRequest>>();

export function refreshLeadSaveViews(client: QueryClient, leadId: string, interactionId: string) {
  let requests = refreshing.get(client);
  if (!requests) {
    requests = new Map();
    refreshing.set(client, requests);
  }
  const existing = requests.get(leadId);
  if (existing) {
    if (existing.interactionId !== interactionId) {
      existing.interactionId = interactionId;
      existing.rerun = true;
    }
    return existing.promise;
  }
  const request: RefreshRequest = { interactionId, rerun: false, promise: Promise.resolve() };
  requests.set(leadId, request);
  request.promise = (async () => {
    do {
      request.rerun = false;
      const currentInteractionId = request.interactionId;
      const startedAt = performanceNow();
      const results = await Promise.allSettled([
        ...[
          [queryKeyCRM.getLeadDetailById, leadId],
          [queryKeyCRM.getLead],
          ["getLeadCallReports"],
          ["all-reminders"],
          ["user-reminders"],
        ].map(queryKey => client.invalidateQueries(
          { queryKey, refetchType: "active" },
          { cancelRefetch: false, throwOnError: true },
        )),
        client.invalidateQueries({
          predicate: query => query.queryKey[0] === "leadFollowups" && query.queryKey[2] === leadId,
          refetchType: "active",
        }, { cancelRefetch: false, throwOnError: true }),
      ]);
      recordLeadSaveTiming({
        interactionId: currentInteractionId, stage: "refresh", durationMs: performanceNow() - startedAt,
        outcome: results.some(result => result.status === "rejected") ? "error" : "success",
      });
    } while (request.rerun);
  })().finally(() => requests!.delete(leadId));
  return request.promise;
}
