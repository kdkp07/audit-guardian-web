import { 
  UploadResponse, 
  StatusResponse, 
  ResultsResponse, 
  LogsResponse, 
  LogsQueryParams 
} from "@/types/api";

// Update URLs to use your actual endpoints
export const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL;
export const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
export const AGENT_URL = import.meta.env.AGENT_URL || `${API_BASE_URL}`;
console.log(AGENT_URL)

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


export async function uploadDocument(file: File, runId?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (runId) {
    formData.append("run_id", runId);
  }
  
  const response = await fetch(`${API_BASE_URL}`, {
    method: "POST",
    body: formData,
  });
  
  return handleResponse<UploadResponse>(response);
}


export async function getDocumentStatus(documentKey: string): Promise<StatusResponse> {
  const response = await fetch(`${API_BASE_URL}/${documentKey}`);
  return handleResponse<StatusResponse>(response);
}


export async function getDocumentResults(documentKey: string): Promise<ResultsResponse> {
  const response = await fetch(`${API_BASE_URL}/${documentKey}`);
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
  
  const url = `${WEBSOCKET_URL}`;
  const response = await fetch(url);
  
  
  return handleResponse<LogsResponse>(response);
}


export async function triggerAgentProcessing(documentKey: string, fileName: string, fileType: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(AGENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentKey,
      fileName,
      fileType,
      // Add any other required fields
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new APIError(response.status, error || response.statusText);
  }
  
  return response.json();
}

// WebSocket Service
export class WebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: Map<string, (message: any) => void> = new Map();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 5000;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.ws = new WebSocket(WEBSOCKET_URL);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.callbacks.forEach(callback => callback(data));
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  subscribe(callback: (message: any) => void) {
    const id = Math.random().toString(36);
    this.callbacks.set(id, callback);
    
    // Start connection if not already connected
    if (!this.ws) {
      this.connect();
    }
    
    return () => {
      this.callbacks.delete(id);
      // Close connection if no more subscribers
      if (this.callbacks.size === 0 && this.ws) {
        this.ws.close();
      }
    };
  }

  disconnect() {
    if (this.ws) {
      this.callbacks.clear();
      this.ws.close();
      this.ws = null;
    }
  }
}


export async function pollDocumentStatus(
  documentKey: string,
  onProgress?: (status: StatusResponse) => void,
  interval = 3000,
  maxAttempts = 100
): Promise<StatusResponse> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const status = await getDocumentStatus(documentKey);
      
      if (onProgress) {
        onProgress(status);
      }
      
      if (status.status === "completed" || status.status === "failed") {
        return status;
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      // If polling fails, wait a bit and retry
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }
  }
  
  throw new Error("Status polling timeout");
}

