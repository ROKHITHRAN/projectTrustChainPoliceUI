import api from "./api";
import { AccessLog } from "../types";

export const logService = {
  async getLogsByCase(caseId: string): Promise<AccessLog[]> {
    const response = await api.get(`/api/logs/${caseId}`);

    const rawLogs = response.data.logs; // 👈 IMPORTANT

    if (!Array.isArray(rawLogs)) return [];

    return rawLogs.map((log: any, index: number) => ({
      id: `${caseId}-${index}`,
      caseId: String(log.caseId),
      action: ACTION_MAP[log.action] ?? "READ",
      performedBy: log.actor,
      performedByRole: "POLICE", // backend does not send role yet
      timestamp: new Date(log.timestamp).toISOString(),
      evidenceId: log.evidenceId ? String(log.evidenceId) : undefined,
      details: log.extraData,
    }));
  },
};
const ACTION_MAP: Record<number, AccessLog["action"]> = {
  0: "READ",
  1: "CREATE",
  2: "UPDATE",
  3: "DELETE",
};
