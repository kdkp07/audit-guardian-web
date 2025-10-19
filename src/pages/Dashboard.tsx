import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Activity, DollarSign, TrendingDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { getDocumentResults } from "@/services/api";
import { ResultsResponse } from "@/types/api";

export default function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [resultsData, setResultsData] = useState<ResultsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch latest results (placeholder - would need documentKey from storage/context)
  useEffect(() => {
    const fetchLatestResults = async () => {
      // TODO: Get documentKey from localStorage or context
      const latestDocKey = localStorage.getItem("latestDocumentKey");
      
      if (latestDocKey) {
        setLoading(true);
        try {
          const results = await getDocumentResults(latestDocKey);
          setResultsData(results);
        } catch (error) {
          console.error("Failed to fetch results:", error);
          // Fall back to mock data
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLatestResults();
  }, []);
  const metrics = [
    {
      title: "Compliance Status",
      value: "87%",
      status: "success",
      icon: CheckCircle,
      description: "Overall compliance rate"
    },
    {
      title: "Total Discrepancies",
      value: "23",
      status: "warning",
      icon: AlertTriangle,
      description: "Issues requiring attention"
    },
    {
      title: "Critical Issues",
      value: "5",
      status: "destructive",
      icon: XCircle,
      description: "High priority items"
    },
    {
      title: "Financial Health",
      value: "Good",
      status: "success",
      icon: TrendingUp,
      description: "Current assessment"
    }
  ];

  const recentFindings = [
    { id: 1, standard: "GAAP", issue: "Revenue recognition timing", severity: "Medium", status: "Under Review" },
    { id: 2, standard: "IFRS", issue: "Lease classification", severity: "High", status: "Pending" },
    { id: 3, standard: "GAAP", issue: "Inventory valuation method", severity: "Low", status: "Resolved" },
    { id: 4, standard: "SOX", issue: "Internal control documentation", severity: "High", status: "In Progress" },
    { id: 5, standard: "IFRS", issue: "Fair value measurement", severity: "Medium", status: "Under Review" }
  ];

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

  const detailedIssues = {
    "Compliance Status": [
      { id: 1, issue: "GAAP revenue recognition compliance met", severity: "Low", date: "2025-10-18" },
      { id: 2, issue: "IFRS lease classification compliant", severity: "Low", date: "2025-10-17" },
      { id: 3, issue: "Minor formatting inconsistencies", severity: "Medium", date: "2025-10-16" }
    ],
    "Total Discrepancies": [
      { id: 1, issue: "Revenue timing mismatch in Q3 statements", severity: "High", date: "2025-10-18" },
      { id: 2, issue: "Inventory valuation method inconsistency", severity: "Medium", date: "2025-10-17" },
      { id: 3, issue: "Lease liability calculation variance", severity: "Medium", date: "2025-10-16" },
      { id: 4, issue: "Depreciation schedule discrepancy", severity: "Low", date: "2025-10-15" }
    ],
    "Critical Issues": [
      { id: 1, issue: "SOX 404 internal control weakness", severity: "High", date: "2025-10-18" },
      { id: 2, issue: "Material misstatement in financial position", severity: "High", date: "2025-10-17" },
      { id: 3, issue: "Inadequate segregation of duties", severity: "High", date: "2025-10-16" },
      { id: 4, issue: "Missing audit trail documentation", severity: "High", date: "2025-10-15" },
      { id: 5, issue: "Unauthorized journal entry detected", severity: "High", date: "2025-10-14" }
    ],
    "Financial Health": [
      { id: 1, issue: "Strong liquidity ratio maintained", severity: "Low", date: "2025-10-18" },
      { id: 2, issue: "Debt-to-equity ratio within healthy range", severity: "Low", date: "2025-10-17" },
      { id: 3, issue: "Operating cash flow positive", severity: "Low", date: "2025-10-16" }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Compliance Dashboard</h1>
        <p className="text-muted-foreground">Monitor your financial compliance and health status</p>
        {resultsData && (
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {new Date(resultsData.processedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Financial KPIs Section */}
      {resultsData?.kpis && (
        <>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Liquidity Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Current Ratio</p>
                  <p className="text-2xl font-bold">{resultsData.kpis.liquidity.currentRatio.toFixed(2)}</p>
                  <Badge variant={resultsData.kpis.liquidity.currentRatio >= 1.5 ? "success" : "warning"}>
                    {resultsData.kpis.liquidity.currentRatio >= 1.5 ? "Good" : "Warning"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quick Ratio</p>
                  <p className="text-2xl font-bold">{resultsData.kpis.liquidity.quickRatio.toFixed(2)}</p>
                  <Badge variant={resultsData.kpis.liquidity.quickRatio >= 1.0 ? "success" : "warning"}>
                    {resultsData.kpis.liquidity.quickRatio >= 1.0 ? "Good" : "Warning"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cash Ratio</p>
                  <p className="text-2xl font-bold">{resultsData.kpis.liquidity.cashRatio.toFixed(2)}</p>
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
                  <p className="text-2xl font-bold">{(resultsData.kpis.profitability.grossMargin * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Margin</p>
                  <p className="text-2xl font-bold">{(resultsData.kpis.profitability.netMargin * 100).toFixed(1)}%</p>
                  <Badge variant={resultsData.kpis.profitability.netMargin >= 0.10 ? "success" : "warning"}>
                    {resultsData.kpis.profitability.netMargin >= 0.10 ? "Good" : "Warning"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROA</p>
                  <p className="text-2xl font-bold">{(resultsData.kpis.profitability.roa * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROE</p>
                  <p className="text-2xl font-bold">{(resultsData.kpis.profitability.roe * 100).toFixed(1)}%</p>
                  <Badge variant={resultsData.kpis.profitability.roe >= 0.15 ? "success" : "warning"}>
                    {resultsData.kpis.profitability.roe >= 0.15 ? "Good" : "Warning"}
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
                <div>
                  <p className="text-sm text-muted-foreground">Debt-to-Equity</p>
                  <p className="text-2xl font-bold">{resultsData.kpis.leverage.debtToEquity.toFixed(2)}</p>
                  <Badge variant={resultsData.kpis.leverage.debtToEquity <= 2.0 ? "success" : "warning"}>
                    {resultsData.kpis.leverage.debtToEquity <= 2.0 ? "Good" : "Warning"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Debt-to-Assets</p>
                  <p className="text-2xl font-bold">{resultsData.kpis.leverage.debtToAssets.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interest Coverage</p>
                  <p className="text-2xl font-bold">{resultsData.kpis.leverage.interestCoverage.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Efficiency Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Asset Turnover</p>
                  <p className="text-2xl font-bold">{resultsData.kpis.efficiency.assetTurnover.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inventory Turnover</p>
                  <p className="text-2xl font-bold">{resultsData.kpis.efficiency.inventoryTurnover.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receivables Turnover</p>
                  <p className="text-2xl font-bold">{resultsData.kpis.efficiency.receivablesTurnover.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

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
                {(resultsData?.complianceFindings || recentFindings).map((finding, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <Badge variant="outline">{finding.standard}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">{finding.issue}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getSeverityColor(finding.severity)}>{finding.severity}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {typeof finding.status === 'string' ? finding.status.replace('_', ' ') : finding.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedMetric}</SheetTitle>
            <SheetDescription>
              Detailed issues and discrepancies
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {selectedMetric && detailedIssues[selectedMetric as keyof typeof detailedIssues]?.map((issue) => (
              <Card key={issue.id} className="shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                    <span className="text-xs text-muted-foreground">{issue.date}</span>
                  </div>
                  <p className="text-sm text-foreground">{issue.issue}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
