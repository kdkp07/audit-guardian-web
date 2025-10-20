import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, FileText, CheckCircle2, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { WEBSOCKET_URL, AGENT_URL } from "@/services/api";
import { url } from "inspector";

// Types
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  documentKey?: string;
  stage?: string;
  error?: string;
}


export default function Upload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();


  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: "uploading" as const,
      progress: 0,
    }));

    setFiles([...files, ...newFiles]);

    // Upload each file to AWS backend
    for (const newFile of newFiles) {
      const actualFile = selectedFiles.find(f => f.name === newFile.name);
      if (actualFile) {
        handleUpload(newFile.id, actualFile);
      }
    }
  };
  // const [runId,setStateVariable] = useState(`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [runId, setStateVariable] = useState(`test`);
  const handleUpload = async (fileId: string, file: File) => {
    try {


      // 1️⃣ Update UI - mark as uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
              ...f,
              documentKey: runId,
              status: "processing",
              progress: 10,
              stage: "uploading",
            }
            : f
        )
      );


      const presignRes = await fetch(AGENT_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify({ id: runId, file_name: file.name, file_type: file.type })
        });

      if (!presignRes.ok) {
        throw new Error("Failed to get presigned URL");
      }

      const { upload_url, file_key } = await presignRes.json();

      const uploadRes = await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file to S3");
      }
      


      setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, status: "processing", progress: 20, stage: "uploaded" } : f));

      localStorage.setItem("latestDocumentKey", runId);

      toast({
        title: "Processing started",
        description: `${file.name} uploaded successfully. Analysis started.`,
      });
    } catch (error) {
      console.error("Upload error:", error);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
              ...f,
              status: "error",
              progress: 0,
              error: error instanceof Error ? error.message : "Upload failed",
            }
            : f
        )
      );

      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAnalysis = async () => {
    try {
      // Update UI: mark all files as processing

      const res = await fetch(`${import.meta.env.VITE_START_AGENT_ANALYSIS}/${runId}`, {
        method: "GET",
      });

      if (!res.ok) throw new Error("Failed to start analysis");

      toast({
        title: "Processing started",
        description: `All uploaded files are being analyzed.`,
      });

      
    } catch (err) {
      console.error(err);
      toast({
        title: "Analysis failed",
        description: err instanceof Error ? err.message : "Failed to generate analysis",
        variant: "destructive",
      });
    }
  };



  const removeFile = (fileId: string) => {
    setFiles(files.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Documents</h1>
        <p className="text-muted-foreground">Upload financial statements for compliance analysis</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
          <CardDescription>Supported formats: PDF, Excel (.xlsx, .xls), CSV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
            <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
            <p className="text-sm text-muted-foreground mb-4">Maximum file size: 50MB</p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept=".pdf,.xlsx,.xls,.csv"
              onChange={handleFileSelect}
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg"
                >
                  <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>

                    {(file.status === "uploading" || file.status === "processing") && (
                      <div className="mt-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {file.stage ? `${file.stage} - ${file.progress}%` : `${file.progress}%`}
                        </p>
                      </div>
                    )}


                    {file.status === "error" && file.error && (
                      <p className="text-xs text-destructive mt-1">{file.error}</p>
                    )}
                  </div>

                  {file.status === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  )}
                  {file.status === "error" && (
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <Button
            size="sm"
            className="mt-2"
            onClick={() => handleGenerateAnalysis()}
          >
            Generate Analysis
          </Button>
        </Card>
      )}

    </div>
  );
}
