import { axiosInstance } from "../services/authApi/axiosInstance";
import { readLeadData } from "./leadReadRetry";
export async function fetchPreparedLeads(params: any, signal?: AbortSignal) {
  const deadline = Date.now() + 120_000;
  let ticket: string | undefined;
  for (;;) {
    if (signal?.aborted) throw new Error("Request canceled");
    const response = await readLeadData("leads", () => axiosInstance.get("api/lead", {
      params: {
        ...params,
        prepare: "1",
        ...(ticket && {
          preparationTicket: ticket
        })
      },
      signal
    }), signal);
    if (response.status !== 202 || response.data?.state !== "preparing") return response.data;
    ticket = response.data.ticket;
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error("Preparing your tasks took too long. Please retry.");
    const delay = Math.min(remaining, Math.max(1000, (Number(response.headers["retry-after"] || response.data.retryAfterSeconds) || 5) * 1000));
    await new Promise<void>((resolve, reject) => {
      const cancel = () => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", cancel);
        reject(new Error("Request canceled"));
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener("abort", cancel);
        resolve();
      }, delay);
      signal?.addEventListener("abort", cancel, {
        once: true
      });
      if (signal?.aborted) cancel();
    });
    if (Date.now() >= deadline) throw new Error("Preparing your tasks took too long. Please retry.");
  }
}
