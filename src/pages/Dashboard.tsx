import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useAgentLogs } from "../context/AgentLogsContext";

interface InvestorAgentResults {
  investor_agent_report: string;
  positive_indicators: string[];
  areas_of_concerns: string[];
  financial_health: string;
}

interface AnalystAgentResults {
  analyst_agent_report: string;
  errors: string[];
}

interface AuditorResults {
  errors?: string;
  citations?: string;
}

export default function Dashboard() {
  const { logsData, setLogsData } = useAgentLogs<Object>();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  if (!logsData || Object.keys(logsData).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Activity className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
        <h3 className="text-lg font-semibold mb-2">No Analysis Found</h3>
        <p className="text-muted-foreground mb-4">
          Please upload a document to begin compliance analysis.
        </p>
        <a href="/upload" className="text-primary hover:underline">
          Go to Upload
        </a>
      </div>
    );
  }

  const { investor_agent_results, analyst_agent_results, auditor_results } = logsData;

  const metrics = [
    {
      title: "Financial Health",
      value: investor_agent_results.financial_health,
      status: investor_agent_results.financial_health === "EXCELLENT" ? "success" :
              investor_agent_results.financial_health === "SATISFACTORY" ? "warning" : "destructive",
      icon: investor_agent_results.financial_health === "GOOD" ? TrendingUp : investor_agent_results.financial_health === "EXCELLENT" ? TrendingUp :TrendingDown
    },
    {
      title: "Critical Issues",
      value: investor_agent_results.areas_of_concerns.length.toString(),
      status: "destructive",
      icon: XCircle
    },
    {
      title: "Total Discrepancies",
      value: analyst_agent_results.errors.length.toString(),
      status: analyst_agent_results.errors.length > 0 ? "warning" : "success",
      icon: AlertTriangle
    },
    {
      title: "Positive Indicators",
      value: investor_agent_results.positive_indicators.length.toString(),
      status: investor_agent_results.positive_indicators.length > 3 ? "success" : "warning",
      icon: AlertTriangle
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "success";
      case "warning": return "warning";
      case "destructive": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Compliance Dashboard</h1>
        <p className="text-muted-foreground">Monitor your financial compliance and health status</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              className="shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
              onClick={() => setSelectedMetric(metric.title)}
            >
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 text-${getStatusColor(metric.status)}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-center">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Investor Agent Results */}
      <Card className="shadow-card">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Investor Agent Results</CardTitle>
          <Badge variant={getStatusColor(investor_agent_results.financial_health)}>
            {investor_agent_results.financial_health}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {investor_agent_results.investor_agent_report}
          </p>

          {investor_agent_results.positive_indicators.length > 0 && (
            <div>
              <h3 className="font-semibold text-success mb-1">Positive Indicators</h3>
              <ul className="list-disc list-inside space-y-1 text-success text-sm">
                {investor_agent_results.positive_indicators.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {investor_agent_results.areas_of_concerns.length > 0 && (
            <div>
              <h3 className="font-semibold text-destructive mb-1">Areas of Concern</h3>
              <ul className="list-disc list-inside space-y-1 text-destructive text-sm">
                {investor_agent_results.areas_of_concerns.map((item, idx) => (
                  <li key={idx}>{item}</li>
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
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {analyst_agent_results.analyst_agent_report}
          </p>
          {analyst_agent_results.errors.length > 0 && (
            <div>
              <h3 className="font-semibold text-warning mb-1">Errors</h3>
              <ul className="list-disc list-inside text-warning text-sm space-y-1">
                {analyst_agent_results.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
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
        <CardContent>
          {auditor_results.errors && (
            <div>
              <h3 className="font-semibold text-destructive mb-1">Errors</h3>
              <p className="text-sm text-destructive whitespace-pre-wrap">{auditor_results.errors}</p>
            </div>
          )}
          {auditor_results.citations && (
            <div>
              <h3 className="font-semibold mb-1">Citations</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{auditor_results.citations}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
