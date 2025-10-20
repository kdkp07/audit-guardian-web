import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { WEBSOCKET_URL } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function AgentLogs() {
  const [logs, setLogs] = useState<string[]>([]);
  const [detectedRunId, setDetectedRunId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => console.log("✅ WebSocket connected for AgentLogs");
    ws.onerror = (err) => console.error("❌ WebSocket error:", err);
    ws.onclose = () => console.log("🔌 WebSocket closed");

    ws.onmessage = (event) => {
      try {
        const message = typeof event.data === "string" ? event.data : JSON.stringify(event.data);
        setLogs((prev) => [...prev, message]);

        const match = message.match(/\[run_id=(.*?)\]/i);
        if (match && message.includes("Run Completed!")) {
          const runId = match[1];
          console.log("Detected completed run_id:", runId);
          setDetectedRunId(runId);
          toast({
            title: "Analysis Completed",
            description: `Run ID ${runId} finished successfully.`,
          });
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    return () => ws.close();
  }, [toast]);

  const handleGetResults = async () => {
    if (!detectedRunId) return;
    try {
      const res = await fetch(
         `${import.meta.env.VITE_GET_AGENT_RESULTS}/${detectedRunId}`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error("Failed to fetch results");
      const data = await res.json();

      setResult(data);
      toast({ title: "Results fetched successfully" });
    } catch (err) {
      console.error("Error fetching results:", err);
      toast({ title: "Failed to fetch results", variant: "destructive" });
    }
  };

  const renderList = (items?: string[]) => {
    if (!items || !Array.isArray(items)) return null;
    return (
      <ul className="list-disc ml-6 space-y-1 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderAgentCard = (title: string, data: any) => {
    if (!data) return null;
    return (
      <Card className="shadow-md border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.investor_agent_report && (
            <p className="text-sm leading-relaxed">{data.investor_agent_report}</p>
          )}

          {data.analyst_agent_report && (
            <p className="text-sm leading-relaxed">{data.analyst_agent_report}</p>
          )}

          {data.errors && typeof data.errors === "string" && (
            <div>
              <h4 className="font-semibold text-red-500 mb-1">Errors:</h4>
              <p className="text-sm text-muted-foreground">{data.errors}</p>
            </div>
          )}

          {data.financial_health && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Financial Health:</span>
              <Badge
                variant={
                  data.financial_health.toUpperCase() === "GOOD"
                    ? "default"
                    : data.financial_health.toUpperCase() === "AVERAGE"
                    ? "secondary"
                    : "destructive"
                }
              >
                {data.financial_health}
              </Badge>
            </div>
          )}

          {data.positive_indicators && (
            <div>
              <h4 className="font-semibold">Positive Indicators:</h4>
              {renderList(data.positive_indicators)}
            </div>
          )}

          {data.areas_of_concerns && (
            <div>
              <h4 className="font-semibold text-amber-600">Areas of Concern:</h4>
              {renderList(data.areas_of_concerns)}
            </div>
          )}

          {Array.isArray(data.errors) && (
            <div>
              <h4 className="font-semibold text-red-500">Errors:</h4>
              {renderList(data.errors)}
            </div>
          )}

          {data.citations && (
            <div>
              <h4 className="font-semibold text-blue-600">Citations:</h4>
              <p className="text-sm text-muted-foreground">{data.citations}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderResultVisual = () => {
    if (!result) return null;

    return (
      <Accordion type="single" collapsible className="mt-4 space-y-2">
        {renderAgentCard("Investor Agent Results", result.investor_agent_results)}
        {renderAgentCard("Analyst Agent Results", result.analyst_agent_results)}
        {renderAgentCard("Auditor Results", result.auditor_results)}
      </Accordion>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Agent Logs (Live)</h1>
        <p className="text-muted-foreground">Streaming logs in real-time via WebSocket</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Live Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] overflow-y-auto bg-muted p-4 rounded-md font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-muted-foreground italic">Waiting for logs...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log.includes("ERROR") ? (
                    <Badge variant="destructive" className="mr-2">
                      ERROR
                    </Badge>
                  ) : log.includes("WARN") ? (
                    <Badge variant="warning" className="mr-2">
                      WARN
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="mr-2">
                      INFO
                    </Badge>
                  )}
                  {log}
                </div>
              ))
            )}
          </div>

          {detectedRunId && (
            <div className="mt-4 flex justify-end">
              <Button onClick={handleGetResults}>Get Results for {detectedRunId}</Button>
            </div>
          )}

          {result && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">📊 Analysis Results</h3>
              {renderResultVisual()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
