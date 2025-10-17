import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from "lucide-react";

export default function Dashboard() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Compliance Dashboard</h1>
        <p className="text-muted-foreground">Monitor your financial compliance and health status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="shadow-card">
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
          <CardTitle>Recent Compliance Findings</CardTitle>
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
                {recentFindings.map((finding) => (
                  <tr key={finding.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <Badge variant="outline">{finding.standard}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">{finding.issue}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getSeverityColor(finding.severity)}>{finding.severity}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{finding.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
