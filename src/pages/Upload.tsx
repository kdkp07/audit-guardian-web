import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, FileText, CheckCircle2, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadDocument, pollDocumentStatus } from "@/services/api";
import { StatusResponse } from "@/types/api";
import { useNavigate } from "react-router-dom";

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

  const handleUpload = async (fileId: string, file: File) => {
    try {
      // Generate unique run_id
      const runId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Upload to AWS API Gateway with run_id
      const uploadResponse = await uploadDocument(file, runId);
      
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId 
            ? { 
                ...f, 
                documentKey: uploadResponse.documentKey, 
                status: "processing",
                progress: 25,
                stage: "uploaded"
              } 
            : f
        )
      );

      // Poll for status
      await pollDocumentStatus(
        uploadResponse.documentKey,
        (status: StatusResponse) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.documentKey === uploadResponse.documentKey
                ? {
                    ...f,
                    status: status.status === "completed" ? "completed" : status.status === "failed" ? "error" : "processing",
                    progress: status.progress,
                    stage: status.stage,
                    error: status.error || undefined,
                  }
                : f
            )
          );
        }
      );

      // Store documentKey in localStorage for Dashboard access
      localStorage.setItem("latestDocumentKey", uploadResponse.documentKey);
      
      toast({
        title: "Processing completed",
        description: `${file.name} has been analyzed successfully. Redirecting to dashboard...`,
      });

      // Navigate to dashboard with run_id
      setTimeout(() => {
        navigate(`/dashboard?run_id=${runId}`);
      }, 1000);

    } catch (error) {
      console.error("Upload error:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { 
                ...f, 
                status: "error", 
                progress: 0,
                error: error instanceof Error ? error.message : "Upload failed" 
              }
            : f
        )
      );
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
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
                <div key={file.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
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
        </Card>
      )}
    </div>
  );
}
