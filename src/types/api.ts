// API Response Types

export interface UploadResponse {
  documentKey: string;
  status: "processing";
  timestamp: string;
}

export interface StatusResponse {
  documentKey: string;
  status: "uploaded" | "converting" | "analyzing" | "calculating" | "completed" | "failed";
  stage: string;
  progress: number;
  timestamp: string;
  error?: string | null;
}

export interface KPIMetrics {
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
  };
  profitability: {
    grossMargin: number;
    netMargin: number;
    roa: number;
    roe: number;
    operatingMargin?: number;
  };
  leverage: {
    debtToEquity: number;
    debtToAssets: number;
    interestCoverage: number;
  };
  efficiency: {
    assetTurnover: number;
    inventoryTurnover: number;
    receivablesTurnover: number;
  };
  valuation?: {
    eps?: number;
    peRatio?: number;
    pbRatio?: number;
  };
  cashFlow?: {
    operatingCashFlowRatio?: number;
    freeCashFlow?: number;
    cashConversionCycle?: number;
  };
}

export interface ComplianceFinding {
  standard: string;
  issue: string;
  severity: "low" | "medium" | "high";
  status: "under_review" | "pending" | "resolved" | "in_progress";
  description: string;
  recommendation?: string;
}

export interface ResultsResponse {
  documentKey: string;
  status: "completed" | "failed";
  complianceStatus: "compliant" | "non-compliant" | "under_review";
  overallScore: number;
  kpis: KPIMetrics;
  complianceFindings: ComplianceFinding[];
  timestamp: string;
  processedAt: string;
  documentName?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agentType: string;
  logLevel: "INFO" | "WARN" | "ERROR" | "DEBUG";
  message: string;
}

export interface LogsResponse {
  events: LogEntry[];
  nextToken?: string;
  count: number;
}

export interface LogsQueryParams {
  logGroup?: string;
  startTime?: number;
  endTime?: number;
  filterPattern?: string;
  agentType?: string;
  logLevel?: string;
  nextToken?: string;
}
