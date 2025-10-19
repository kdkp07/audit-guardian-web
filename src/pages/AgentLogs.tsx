import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search } from "lucide-react";
import { getAgentLogs } from "@/services/api";
import { LogEntry } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

export default function AgentLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const { toast } = useToast();

  // Fetch logs from AWS CloudWatch
  const fetchLogs = async (refresh = false) => {
    setLoading(true);
    try {
      const response = await getAgentLogs({
        agentType: agentFilter !== "all" ? agentFilter : undefined,
        logLevel: levelFilter !== "all" ? levelFilter : undefined,
        filterPattern: searchQuery || undefined,
        nextToken: refresh ? undefined : nextToken,
      });
      
      setLogs(refresh ? response.events : [...logs, ...response.events]);
      setNextToken(response.nextToken);
      
      if (refresh) {
        toast({
          title: "Logs refreshed",
          description: `Fetched ${response.count} log entries`,
        });
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast({
        title: "Failed to fetch logs",
        description: "Using mock data instead",
        variant: "destructive",
      });
      // Fallback to mock data
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(true);
  }, [agentFilter, levelFilter]);

  // Mock data - fallback when API is not available
  const mockLogs: LogEntry[] = [
    {
      id: "1",
      timestamp: "2025-10-17 14:23:45",
      agentType: "ComplianceChecker",
      logLevel: "INFO",
      message: "Started compliance check for document: financial_statement_q3.pdf"
    },
    {
      id: "2",
      timestamp: "2025-10-17 14:23:47",
      agentType: "RuleEngine",
      logLevel: "WARN",
      message: "Potential GAAP violation detected: revenue recognition timing"
    },
    {
      id: "3",
      timestamp: "2025-10-17 14:23:50",
      agentType: "DataExtractor",
      logLevel: "INFO",
      message: "Successfully extracted 245 data points from uploaded document"
    },
    {
      id: "4",
      timestamp: "2025-10-17 14:23:52",
      agentType: "ComplianceChecker",
      logLevel: "ERROR",
      message: "Failed to validate against IFRS standard: missing required fields"
    },
    {
      id: "5",
      timestamp: "2025-10-17 14:23:55",
      agentType: "ReportGenerator",
      logLevel: "INFO",
      message: "Generated audit report for Q3 financial statements"
    }
  ];

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "ERROR": return "destructive";
      case "WARN": return "warning";
      case "INFO": return "success";
      case "DEBUG": return "secondary";
      default: return "secondary";
    }
  };

  const displayedLogs = logs.length > 0 ? logs : mockLogs;
  
  const filteredLogs = displayedLogs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.agentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAgent = agentFilter === "all" || log.agentType === agentFilter;
    const matchesLevel = levelFilter === "all" || log.logLevel === levelFilter;
    return matchesSearch && matchesAgent && matchesLevel;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Agent Logs</h1>
        <p className="text-muted-foreground">Monitor AI agent activities and system events</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Log Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Agent Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="ComplianceChecker">Compliance Checker</SelectItem>
                <SelectItem value="RuleEngine">Rule Engine</SelectItem>
                <SelectItem value="DataExtractor">Data Extractor</SelectItem>
                <SelectItem value="ReportGenerator">Report Generator</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Log Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="WARN">Warning</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchLogs(true)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Logs
            </Button>
            {nextToken && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchLogs(false)}
                disabled={loading}
              >
                Load More
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Log Entries ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <Badge variant={getLogLevelColor(log.logLevel)} className="mt-0.5">
                    {log.logLevel}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{log.agentType}</span>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-sm text-foreground">{log.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
