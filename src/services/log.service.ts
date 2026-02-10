import api from './api';
import { AccessLog } from '../types';

export const logService = {
  async getLogsByCase(caseId: string): Promise<AccessLog[]> {
    const response = await api.get<AccessLog[]>(`/api/logs/${caseId}`);
    return response.data;
  },
};
