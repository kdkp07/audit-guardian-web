import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

interface AuditFinding {
  id: string;
  documentName: string;
  ruleViolated: string;
  standard: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  recommendation: string;
  dateDetected: string;
}

export default function AuditReports() {
  // Mock data - will be replaced with actual data
  const findings: AuditFinding[] = [
    {
      id: "F001",
      documentName: "Q3_Financial_Statement_2024.pdf",
      ruleViolated: "ASC 606 - Revenue Recognition",
      standard: "GAAP",
      severity: "High",
      description: "Revenue from long-term contracts recognized upfront instead of over time as performance obligations are satisfied.",
      recommendation: "Adjust revenue recognition to align with ASC 606 requirements. Recognize revenue as or when the entity satisfies a performance obligation.",
      dateDetected: "2025-10-15"
    },
    {
      id: "F002",
      documentName: "Lease_Agreement_Analysis.xlsx",
      ruleViolated: "ASC 842 - Lease Classification",
      standard: "GAAP",
      severity: "Medium",
      description: "Operating lease not properly classified. Lease should be recognized as right-of-use asset and lease liability on balance sheet.",
      recommendation: "Reclassify lease and record appropriate asset and liability entries per ASC 842 guidance.",
      dateDetected: "2025-10-14"
    },
    {
      id: "F003",
      documentName: "Inventory_Valuation_Q3.csv",
      ruleViolated: "IAS 2 - Inventory Valuation",
      standard: "IFRS",
      severity: "Low",
      description: "Inventory valued using LIFO method which is not permitted under IFRS standards.",
      recommendation: "Switch to FIFO or weighted average cost method for inventory valuation to comply with IFRS.",
      dateDetected: "2025-10-13"
    },
    {
      id: "F004",
      documentName: "Internal_Controls_Assessment.pdf",
      ruleViolated: "SOX 404 - Internal Controls",
      standard: "SOX",
      severity: "Critical",
      description: "Material weakness identified in internal controls over financial reporting. Insufficient segregation of duties in accounts payable process.",
      recommendation: "Implement proper segregation of duties. Ensure no single individual has control over all aspects of a financial transaction.",
      dateDetected: "2025-10-12"
    },
    {
      id: "F005",
      documentName: "Credit_Loss_Estimates.xlsx",
      ruleViolated: "ASC 326 - CECL Model",
      standard: "GAAP",
      severity: "Medium",
      description: "Credit loss allowance calculation does not incorporate forward-looking information as required by CECL standard.",
      recommendation: "Update allowance calculation methodology to include reasonable and supportable forecasts affecting expected credit losses.",
      dateDetected: "2025-10-11"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "destructive";
      case "High": return "destructive";
      case "Medium": return "warning";
      case "Low": return "success";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Audit Reports</h1>
          <p className="text-muted-foreground">Detailed compliance findings and recommendations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-destructive">1</div>
              <div className="text-sm text-muted-foreground mt-1">Critical</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-destructive">1</div>
              <div className="text-sm text-muted-foreground mt-1">High</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-warning">2</div>
              <div className="text-sm text-muted-foreground mt-1">Medium</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-success">1</div>
              <div className="text-sm text-muted-foreground mt-1">Low</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {findings.map((finding) => (
          <Card key={finding.id} className="shadow-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{finding.id}</Badge>
                    <Badge variant={getSeverityColor(finding.severity)}>{finding.severity}</Badge>
                    <Badge variant="secondary">{finding.standard}</Badge>
                  </div>
                  <CardTitle className="text-lg mb-1">{finding.ruleViolated}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {finding.documentName}
                    <span className="text-xs">• Detected: {new Date(finding.dateDetected).toLocaleDateString()}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                <p className="text-sm text-foreground">{finding.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Recommendation</h4>
                <p className="text-sm text-foreground">{finding.recommendation}</p>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Traceability:</span> Source document "{finding.documentName}" analyzed against {finding.standard} standard
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
