export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: string;
  uid: string;
  role: string;
  userName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  uid: string;
  email: string;
  role: string;
  userName: string;
}

export interface Case {
  id: string;

  // UI
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  // Chain reference
  caseType: number;
  policeName: string;
  location: string;
  detailsHash: string;

  createdAt: number;
  updatedAt: number;
}

export interface CreateCaseRequest {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  caseType: number;
  location: string;
}

export interface UpdateCaseRequest {
  title?: string;
  description?: string;
  status?: "OPEN" | "IN_PROGRESS" | "CLOSED" | "ARCHIVED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface AssignPoliceRequest {
  officerId: string;
}

export interface Evidence {
  id: string;
  caseId: string;
  type: string;
  description: string;
  ipfsHash?: string;
  collectedAt: string;
  collectedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvidenceRequest {
  type: string;
  description: string;
  ipfsHash?: string;
  collectedAt: string;
}

export interface UpdateEvidenceRequest {
  type?: string;
  description?: string;
  ipfsHash?: string;
}

export interface EvidenceHistory {
  id: string;
  evidenceId: string;
  action: string;
  changes: Record<string, unknown>;
  performedBy: string;
  performedAt: string;
}

export interface AccessLog {
  id: string;
  caseId: string;
  action: string;
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface UploadFileResponse {
  ipfsHash: string;
  filename: string;
  size: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
