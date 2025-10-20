import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Activity, DollarSign, TrendingDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useWebSocketLogs } from "@/hooks/useWebSocketLogs";
import { useSearchParams } from "react-router-dom";
import { WebSocketLogEntry } from "@/types/api";
import { useAutoFetchResults } from "@/hooks/useAutoFetchResults";
import { DynamoDBResults } from "@/types/api";

export default function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const runId = searchParams.get('run_id');
  const [latestLogTimestamp, setLatestLogTimestamp] = useState<number>(0);

  // WebSocket logs hook
  const { logs, isConnected, completedRunIds } = useWebSocketLogs({
    runId: runId || undefined,
    autoConnect: !!runId
  });

  // Auto-fetch results hook
  const { results } = useAutoFetchResults({
    completedRunIds,
    enabled: !!runId
  });

  // Get current run results
  const currentResults = runId ? results.get(runId) : null;

  // Helper function to determine overall compliance status
  const getComplianceStatus = (results: DynamoDBResults | undefined): "compliant" | "non-compliant" | "under_review" => {
    if (!results) return "under_review";
    
    // Check for critical errors in auditor_results
    if (results.auditor_results.errors && 
        (results.auditor_results.errors.includes("CRITICAL") || 
         results.auditor_results.errors.toLowerCase().includes("critical"))) {
      return "non-compliant";
    }
    
    // Check for any errors in analyst_agent_results
    if (results.analyst_agent_results.errors && results.analyst_agent_results.errors.length > 0) {
      return "under_review";
    }
    
    return "compliant";
  };

  // Helper function to calculate an overall score
  const calculateOverallScore = (results: DynamoDBResults | undefined): number => {
    if (!results) return 0;
    
    let score = 100;
    
    // Deduct points for issues
    if (results.auditor_results.errors) score -= 30;
    if (results.analyst_agent_results.errors && results.analyst_agent_results.errors.length > 0) score -= 20;
    if (results.investor_agent_results.areas_of_concerns && results.investor_agent_results.areas_of_concerns.length > 0) {
      score -= results.investor_agent_results.areas_of_concerns.length * 5;
    }
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  };

  // Update the metrics section to work with available data
  const metrics = [
    {
      title: "Compliance Status",
      value: currentResults ? `${Math.round(calculateOverallScore(currentResults))}%` : "N/A",
      status: getComplianceStatus(currentResults) === 'compliant' ? 'success' : 'warning',
      icon: getComplianceStatus(currentResults) === 'compliant' ? CheckCircle : AlertTriangle,
      description: "Overall compliance rate"
    },
    {
      title: "Total Discrepancies",
      value: currentResults ? currentResults.analyst_agent_results.errors.length.toString() : "0",
      status: currentResults?.analyst_agent_results.errors.length > 5 ? 'warning' : 'success',
      icon: AlertTriangle,
      description: "Issues requiring attention"
    },
    {
      title: "Critical Issues",
      value: currentResults ? currentResults.investor_agent_results.areas_of_concerns.length.toString() : "0",
      status: "destructive",
      icon: XCircle,
      description: "High priority items"
    },
    {
      title: "Financial Health",
      value: currentResults?.investor_agent_results?.financial_health || "N/A",
      status: currentResults?.investor_agent_results?.financial_health === 'GOOD' ? 'success' : 
              currentResults?.investor_agent_results?.financial_health === 'FAIR' ? 'warning' : 'destructive',
      icon: currentResults?.investor_agent_results?.financial_health === 'GOOD' ? TrendingUp : TrendingDown,
      description: "Current assessment"
    }
  ];

  // Create compliance findings from the available data
  const createComplianceFindings = (results: DynamoDBResults | undefined) => {
    if (!results) return [];
    
    const findings = [];
    
    // Add findings from analyst errors
    results.analyst_agent_results.errors.forEach((error, index) => {
      findings.push({
        id: index,
        standard: "ANALYST",
        issue: error,
        severity: "medium" as const,
        status: "under_review" as const
      });
    });
    
    // Add findings from auditor errors
    if (results.auditor_results.errors) {
      findings.push({
        id: findings.length,
        standard: "AUDITOR",
        issue: results.auditor_results.errors,
        severity: "high" as const,
        status: "pending" as const
      });
    }
    
    // Add concerns from investor agent
    results.investor_agent_results.areas_of_concerns.forEach((concern, index) => {
      findings.push({
        id: findings.length,
        standard: "INVESTOR",
        issue: concern,
        severity: "medium" as const,
        status: "under_review" as const
      });
    });
    
    return findings;
  };

  // Get findings from current results
  const recentFindings = createComplianceFindings(currentResults);

  // Extract KPIs from available data (this is a simplified version)
  const getKPIs = (results: DynamoDBResults | undefined) => {
    if (!results) return null;
    
    // This is a placeholder - you'll need to extract KPIs from your agent results
    // depending on how they're structured in the response data
    return {
      liquidity: {
        currentRatio: 1.8,
        quickRatio: 1.2,
        cashRatio: 0.6
      },
      profitability: {
        grossMargin: 0.45,
        netMargin: 0.15,
        roa: 0.12,
        roe: 0.18
      },
      leverage: {
        debtToEquity: 1.5,
        debtToAssets: 0.4,
        interestCoverage: 3.2
      },
      efficiency: {
        assetTurnover: 0.9,
        inventoryTurnover: 5.2,
        receivablesTurnover: 8.1
      }
    };
  };

  const kpis = getKPIs(currentResults);

  // Get real-time processing status from logs
  useEffect(() => {
    if (logs.length > 0) {
      // Sort logs by timestamp and get the latest one
      const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
      setLatestLogTimestamp(sortedLogs[0].timestamp);
    }
  }, [logs]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success": return "success";
      case "warning": return "warning";
      case "destructive": return "destructive";
      default: return "secondary";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "success";
      default: return "secondary";
    }
  };

  const getFinancialHealthColor = (health: string) => {
    switch (health) {
      case "GOOD": return "success";
      case "FAIR": return "warning";
      case "POOR": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Compliance Dashboard</h1>
        <p className="text-muted-foreground">Monitor your financial compliance and health status</p>
        
        {runId && (
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm text-muted-foreground">Run ID: {runId}</p>
            <Badge variant={isConnected ? "success" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {logs.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Last update: {new Date(latestLogTimestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
        
        {currentResults && (
          <p className="text-sm text-muted-foreground mt-1">
            Analyzed: {new Date().toLocaleString()}
          </p>
        )}
      </div>

      {/* Real-time Agent Results */}
      {currentResults ? (
        <div className="space-y-6">
          {/* Investor Agent Results */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Investor Agent Results</CardTitle>
                <Badge variant={getFinancialHealthColor(currentResults.investor_agent_results.financial_health)}>
                  {currentResults.investor_agent_results.financial_health}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Report</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {currentResults.investor_agent_results.investor_agent_report}
                </p>
              </div>
              
              {currentResults.investor_agent_results.positive_indicators.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-success">Positive Indicators</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {currentResults.investor_agent_results.positive_indicators.map((indicator, idx) => (
                      <li key={idx} className="text-sm text-success">{indicator}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {currentResults.investor_agent_results.areas_of_concerns.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-destructive">Areas of Concern</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {currentResults.investor_agent_results.areas_of_concerns.map((concern, idx) => (
                      <li key={idx} className="text-sm text-destructive">{concern}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analyst Agent Results */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Analyst Agent Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Report</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {currentResults.analyst_agent_results.analyst_agent_report}
                </p>
              </div>
              
              {currentResults.analyst_agent_results.errors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-warning">Errors</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {currentResults.analyst_agent_results.errors.map((error, idx) => (
                      <li key={idx} className="text-sm text-warning">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auditor Results */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Auditor Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentResults.auditor_results.errors && (
                <div>
                  <h3 className="font-semibold mb-2 text-destructive">Errors</h3>
                  <p className="text-sm text-destructive whitespace-pre-wrap">
                    {currentResults.auditor_results.errors}
                  </p>
                </div>
              )}
              
              {currentResults.auditor_results.citations && (
                <div>
                  <h3 className="font-semibold mb-2">Citations</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {currentResults.auditor_results.citations}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Show loading state when no results yet
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">
              {isConnected ? "Processing your document..." : "Connecting to analysis engine..."}
            </p>
            {logs.length > 0 && (
              <Card className="mt-4 p-4 max-w-md">
                <p className="text-sm text-muted-foreground">
                  {logs[logs.length-1].message}
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Real-time Logs Terminal */}
      {runId && logs.length > 0 && (
        <Card className="shadow-card bg-black">
          <CardHeader>
            <CardTitle className="text-green-500">Real-time Processing Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="text-green-500">
                  <span className="text-green-700">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  {" - "}
                  {log.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Display KPIs when results are available */}
      {currentResults && kpis && (
        <>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Liquidity Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Current Ratio</p>
                  <p className="text-2xl font-bold">{kpis.liquidity.currentRatio.toFixed(2)}</p>
                  <Badge variant={kpis.liquidity.currentRatio >= 1.5 ? "success" : "warning"}>
                    {kpis.liquidity.currentRatio >= 1.5 ? "Good" : "Warning"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quick Ratio</p>
                  <p className="text-2xl font-bold">{kpis.liquidity.quickRatio.toFixed(2)}</p>
                  <Badge variant={kpis.liquidity.quickRatio >= 1.0 ? "success" : "warning"}>
                    {kpis.liquidity.quickRatio >= 1.0 ? "Good" : "Warning"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cash Ratio</p>
                  <p className="text-2xl font-bold">{kpis.liquidity.cashRatio.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Profitability Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gross Margin</p>
                  <p className="text-2xl font-bold">{(kpis.profitability.grossMargin * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Margin</p>
                  <p className="text-2xl font-bold">{(kpis.profitability.netMargin * 100).toFixed(1)}%</p>
                  <Badge variant={kpis.profitability.netMargin >= 0.10 ? "success" : "warning"}>
                    {kpis.profitability.netMargin >= 0.10 ? "Good" : "Warning"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROA</p>
                  <p className="text-2xl font-bold">{(kpis.profitability.roa * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROE</p>
                  <p className="text-2xl font-bold">{(kpis.profitability.roe * 100).toFixed(1)}%</p>
                  <Badge variant={kpis.profitability.roe >= 0.15 ? "success" : "warning"}>
                    {kpis.profitability.roe >= 0.15 ? "Good" : "Warning"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Leverage Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div> <p className="text-sm text-muted-foreground">Debt-to-Equity</p> <p className="text-2xl font-bold">{kpis.leverage.debtToEquity.toFixed(2)}</p> 
                <Badge variant={kpis.leverage.debtToEquity <= 2.0 ? "success" : "warning"}> {kpis.leverage.debtToEquity <= 2.0 ? "Good" : "Warning"} 
                </Badge> 
                </div> 
                <div> 
                  <p className="text-sm text-muted-foreground">Debt-to-Assets</p> 
                  <p className="text-2xl font-bold">{kpis.leverage.debtToAssets.toFixed(2)}</p> 
                  </div>
                  <div> 
                  <p className="text-sm text-muted-foreground">Interest Coverage</p> <p className="text-2xl font-bold">{kpis.leverage.interestCoverage.toFixed(2)}</p> </div> </div> </CardContent> 
                  </Card>
                        <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Efficiency Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Asset Turnover</p>
              <p className="text-2xl font-bold">{kpis.efficiency.assetTurnover.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inventory Turnover</p>
              <p className="text-2xl font-bold">{kpis.efficiency.inventoryTurnover.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receivables Turnover</p>
              <p className="text-2xl font-bold">{kpis.efficiency.receivablesTurnover.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )}

  {/* Metrics Cards */}
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {metrics.map((metric) => {
      const Icon = metric.icon;
      return (
        <Card 
          key={metric.title} 
          className="shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
          onClick={() => setSelectedMetric(metric.title)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <Icon className={`h-4 w-4 text-${metric.status}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
          </CardContent>
        </Card>
      );
    })}
  </div>

  {/* Compliance Findings Table */}
  <Card className="shadow-card">
    <CardHeader>
      <CardTitle>Compliance Findings</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Standard</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Issue</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Severity</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentFindings.length > 0 ? (
              recentFindings.map((finding, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <Badge variant="outline">{finding.standard}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{finding.issue}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getSeverityColor(finding.severity)}>{finding.severity}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {typeof finding.status === 'string' ? finding.status : finding.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-3 px-4 text-center text-sm text-muted-foreground">
                  {currentResults ? "No compliance findings detected" : "Analysis in progress..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>

  {/* Detailed Issues Drawer */}
  <Sheet open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{selectedMetric}</SheetTitle>
        <SheetDescription>
          Detailed issues and discrepancies
        </SheetDescription>
      </SheetHeader>
      
      <div className="mt-6 space-y-4">
        {selectedMetric && recentFindings.filter(finding => 
          selectedMetric === "Critical Issues" ? finding.severity === "high" :
          selectedMetric === "Total Discrepancies" ? true :
          selectedMetric === "Compliance Status" ? finding.severity === "medium" || finding.severity === "high" :
          selectedMetric === "Financial Health" ? finding.severity === "high" || finding.severity === "medium" : true
        ).map((finding) => (
          <Card key={finding.issue} className="shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant={getSeverityColor(finding.severity)}>{finding.severity}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-foreground">{finding.issue}</p>
              <p className="text-sm text-muted-foreground mt-1">Standard: {finding.standard}</p>
            </CardContent>
          </Card>
        )) || (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No details available for this metric
          </div>
        )}
      </div>
    </SheetContent>
  </Sheet>

  {/* No Run ID message */}
  {!runId && (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Activity className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Analysis in Progress</h3>
      <p className="text-muted-foreground mb-4">
        Upload a document to begin compliance analysis
      </p>
      <a href="/upload" className="text-primary hover:underline">
        Go to Upload
      </a>
    </div>
  )}
</div>
);
}
