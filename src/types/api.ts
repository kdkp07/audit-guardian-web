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

// WebSocket Log Entry
export interface WebSocketLogEntry {
  timestamp: number;
  message: string;
  run_id: string;
}

// DynamoDB Results
export interface InvestorAgentResults {
  investor_agent_report: string;
  positive_indicators: string[];
  financial_health: "GOOD" | "FAIR" | "POOR";
  areas_of_concerns: string[];
}

export interface AnalystAgentResults {
  analyst_agent_report: string;
  errors: string[];
}

export interface AuditorResults {
  errors: string;
  citations: string;
}

export interface DynamoDBResults {
  id: string;
  investor_agent_results: InvestorAgentResults;
  analyst_agent_results: AnalystAgentResults;
  auditor_results: AuditorResults;
}
