import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink } from "lucide-react";

interface Standard {
  id: string;
  name: string;
  type: string;
  effectiveDate: string;
  description: string;
  status: "Active" | "Pending" | "Deprecated";
}

export default function ComplianceStandards() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Mock data - will be replaced with API integration
  const standards: Standard[] = [
    {
      id: "GAAP-101",
      name: "Revenue Recognition (ASC 606)",
      type: "GAAP",
      effectiveDate: "2018-12-15",
      description: "Establishes principles for recognizing revenue from contracts with customers",
      status: "Active"
    },
    {
      id: "IFRS-15",
      name: "Revenue from Contracts with Customers",
      type: "IFRS",
      effectiveDate: "2018-01-01",
      description: "International standard for revenue recognition across industries",
      status: "Active"
    },
    {
      id: "GAAP-842",
      name: "Lease Accounting (ASC 842)",
      type: "GAAP",
      effectiveDate: "2019-12-15",
      description: "Requires lessees to recognize lease assets and liabilities on balance sheet",
      status: "Active"
    },
    {
      id: "IFRS-16",
      name: "Leases",
      type: "IFRS",
      effectiveDate: "2019-01-01",
      description: "Standard for lease accounting that requires recognition of assets and liabilities",
      status: "Active"
    },
    {
      id: "SOX-404",
      name: "Management Assessment of Internal Controls",
      type: "SOX",
      effectiveDate: "2004-11-15",
      description: "Requires management and auditors to report on internal control adequacy",
      status: "Active"
    },
    {
      id: "GAAP-326",
      name: "Credit Losses (CECL)",
      type: "GAAP",
      effectiveDate: "2023-01-01",
      description: "Current expected credit loss model for financial instruments",
      status: "Active"
    },
    {
      id: "IFRS-9",
      name: "Financial Instruments",
      type: "IFRS",
      effectiveDate: "2018-01-01",
      description: "Standard for classification, measurement, and impairment of financial instruments",
      status: "Active"
    }
  ];

  const filteredStandards = standards.filter((standard) => {
    const matchesSearch = standard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         standard.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         standard.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || standard.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "success";
      case "Pending": return "warning";
      case "Deprecated": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Compliance Standards</h1>
        <p className="text-muted-foreground">Browse and search accounting standards and regulations</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Search Standards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Standard Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Standards</SelectItem>
                <SelectItem value="GAAP">GAAP</SelectItem>
                <SelectItem value="IFRS">IFRS</SelectItem>
                <SelectItem value="SOX">SOX</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredStandards.map((standard) => (
          <Card key={standard.id} className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{standard.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="outline">{standard.id}</Badge>
                    <Badge variant="secondary">{standard.type}</Badge>
                    <Badge variant={getStatusColor(standard.status)}>{standard.status}</Badge>
                  </CardDescription>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground mb-3">{standard.description}</p>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Effective Date:</span> {new Date(standard.effectiveDate).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStandards.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No standards found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
