import { 
  UploadResponse, 
  StatusResponse, 
  ResultsResponse, 
  LogsResponse, 
  LogsQueryParams 
} from "@/types/api";

export const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:3000";
export const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8080";

// API Error Handler
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "APIError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new APIError(response.status, error || response.statusText);
  }
  return response.json();
}

// 1. POST /api/documents/upload
export async function uploadDocument(file: File, runId?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (runId) {
    formData.append("run_id", runId);
  }
  
  const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: "POST",
    body: formData,
  });
  
  return handleResponse<UploadResponse>(response);
}

// 2. GET /api/status/{documentKey}
export async function getDocumentStatus(documentKey: string): Promise<StatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/status/${documentKey}`);
  return handleResponse<StatusResponse>(response);
}

// 3. GET /api/results/{documentKey}
export async function getDocumentResults(documentKey: string): Promise<ResultsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/results/${documentKey}`);
  return handleResponse<ResultsResponse>(response);
}

// 4. GET /api/logs
export async function getAgentLogs(params: LogsQueryParams = {}): Promise<LogsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.startTime) queryParams.append("startTime", params.startTime.toString());
  if (params.endTime) queryParams.append("endTime", params.endTime.toString());
  if (params.filterPattern) queryParams.append("filterPattern", params.filterPattern);
  if (params.agentType) queryParams.append("agentType", params.agentType);
  if (params.logLevel) queryParams.append("logLevel", params.logLevel);
  if (params.nextToken) queryParams.append("nextToken", params.nextToken);
  
  const url = `${API_BASE_URL}/api/logs?${queryParams.toString()}`;
  const response = await fetch(url);
  
  return handleResponse<LogsResponse>(response);
}

// Utility: Poll status until completion
export async function pollDocumentStatus(
  documentKey: string,
  onProgress?: (status: StatusResponse) => void,
  interval = 3000,
  maxAttempts = 100
): Promise<StatusResponse> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const status = await getDocumentStatus(documentKey);
    
    if (onProgress) {
      onProgress(status);
    }
    
    if (status.status === "completed" || status.status === "failed") {
      return status;
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error("Status polling timeout");
}
