import React, { useState, useRef } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Upload,
  FileText,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { emailService } from "../../services/emailService";
import type { Email, ApiError, ThreatLevel } from "../../models/email";

interface EmailUploadProps {
  onEmailAnalyzed?: (email: Email) => void;
  onClose?: () => void;
}

interface UploadState {
  isUploading: boolean;
  error: ApiError | null;
  success: boolean;
  result: Email | null;
}

interface ManualEmailData {
  sender: string;
  recipient: string;
  subject: string;
  body: string;
}

type UploadMode = "file" | "manual";

const SUPPORTED_FILE_TYPES = [".eml", ".msg", ".txt"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const EmailUpload: React.FC<EmailUploadProps> = ({
  onEmailAnalyzed,
  onClose,
}) => {
  const [uploadMode, setUploadMode] = useState<UploadMode>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState<ManualEmailData>({
    sender: "",
    recipient: "",
    subject: "",
    body: "",
  });
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    error: null,
    success: false,
    result: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadState({
        isUploading: false,
        error: {
          error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
          code: "FILE_TOO_LARGE",
        },
        success: false,
        result: null,
      });
      return;
    }

    // Validate file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
      setUploadState({
        isUploading: false,
        error: {
          error: `Unsupported file type. Supported: ${SUPPORTED_FILE_TYPES.join(
            ", "
          )}`,
          code: "INVALID_FILE_TYPE",
        },
        success: false,
        result: null,
      });
      return;
    }

    setSelectedFile(file);
    setUploadState({
      isUploading: false,
      error: null,
      success: false,
      result: null,
    });
  };

  const handleManualDataChange = (
    field: keyof ManualEmailData,
    value: string
  ) => {
    setManualData((prev) => ({ ...prev, [field]: value }));
    setUploadState({
      isUploading: false,
      error: null,
      success: false,
      result: null,
    });
  };

  const validateManualData = (): boolean => {
    return !!(
      manualData.sender &&
      manualData.recipient &&
      manualData.subject &&
      manualData.body
    );
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

    try {
      const result = await emailService.uploadAndAnalyzeEmail(selectedFile);
      setUploadState({
        isUploading: false,
        error: null,
        success: true,
        result,
      });

      if (onEmailAnalyzed) {
        onEmailAnalyzed(result);
      }
    } catch (error) {
      setUploadState({
        isUploading: false,
        error: error as ApiError,
        success: false,
        result: null,
      });
    }
  };

  const handleManualUpload = async () => {
    if (!validateManualData()) {
      setUploadState({
        isUploading: false,
        error: {
          error: "Please fill in all required fields",
          code: "VALIDATION_ERROR",
        },
        success: false,
        result: null,
      });
      return;
    }

    setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

    try {
      const result = await emailService.analyzeEmail(manualData);
      setUploadState({
        isUploading: false,
        error: null,
        success: true,
        result,
      });

      if (onEmailAnalyzed) {
        onEmailAnalyzed(result);
      }
    } catch (error) {
      setUploadState({
        isUploading: false,
        error: error as ApiError,
        success: false,
        result: null,
      });
    }
  };

  const handleUpload = () => {
    if (uploadMode === "file") {
      handleFileUpload();
    } else {
      handleManualUpload();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setManualData({ sender: "", recipient: "", subject: "", body: "" });
    setUploadState({
      isUploading: false,
      error: null,
      success: false,
      result: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getThreatLevelColor = (level: ThreatLevel): string => {
    switch (level) {
      case "clean":
        return "text-green-600";
      case "suspicious":
        return "text-yellow-600";
      case "high":
        return "text-orange-600";
      case "malicious":
        return "text-red-600";
      case "critical":
        return "text-red-800";
      default:
        return "text-gray-600";
    }
  };

  const canUpload =
    uploadMode === "file"
      ? selectedFile && !uploadState.isUploading
      : validateManualData() && !uploadState.isUploading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Email Analysis Upload
          </h2>
          <p className="text-gray-600">
            Upload an email file or enter email data manually for threat
            analysis
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Upload Mode Selection */}
      <div className="flex space-x-4">
        <Button
          variant={uploadMode === "file" ? "default" : "outline"}
          onClick={() => setUploadMode("file")}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload File</span>
        </Button>
        <Button
          variant={uploadMode === "manual" ? "default" : "outline"}
          onClick={() => setUploadMode("manual")}
          className="flex items-center space-x-2"
        >
          <Mail className="h-4 w-4" />
          <span>Manual Entry</span>
        </Button>
      </div>

      {/* File Upload Mode */}
      {uploadMode === "file" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>File Upload</span>
            </CardTitle>
            <CardDescription>
              Upload an email file (.eml, .msg, .txt) for analysis. Maximum file
              size: 10MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Email File</Label>
              <Input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                accept=".eml,.msg,.txt"
                onChange={handleFileSelect}
                className="mt-1"
              />
            </div>

            {selectedFile && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-blue-600">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manual Entry Mode */}
      {uploadMode === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Manual Email Entry</span>
            </CardTitle>
            <CardDescription>
              Enter email details manually for analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sender">Sender Email *</Label>
                <Input
                  id="sender"
                  type="email"
                  placeholder="sender@example.com"
                  value={manualData.sender}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleManualDataChange("sender", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="recipient">Recipient Email *</Label>
                <Input
                  id="recipient"
                  type="email"
                  placeholder="recipient@example.com"
                  value={manualData.recipient}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleManualDataChange("recipient", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={manualData.subject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleManualDataChange("subject", e.target.value)
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="body">Email Body *</Label>
              <Textarea
                id="body"
                placeholder="Email content..."
                value={manualData.body}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleManualDataChange("body", e.target.value)
                }
                className="mt-1 min-h-[200px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      <div className="flex space-x-3">
        <Button
          onClick={handleUpload}
          disabled={!canUpload}
          className="flex items-center space-x-2"
        >
          {uploadState.isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>
            {uploadState.isUploading ? "Analyzing..." : "Analyze Email"}
          </span>
        </Button>

        <Button variant="outline" onClick={resetForm}>
          Reset
        </Button>
      </div>

      {/* Error Display */}
      {uploadState.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Analysis Failed</span>
            </div>
            <p className="text-red-700 mt-2">{uploadState.error.error}</p>
            {uploadState.error.code && (
              <p className="text-red-600 text-sm mt-1">
                Error Code: {uploadState.error.code}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success Display */}
      {uploadState.success && uploadState.result && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-green-800 mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">Analysis Complete</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Threat Level:
                  </span>
                  <p
                    className={`font-semibold ${getThreatLevelColor(
                      uploadState.result.threat_summary.overall_risk
                    )}`}
                  >
                    {uploadState.result.threat_summary.overall_risk.toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Confidence:
                  </span>
                  <p className="font-semibold text-gray-900">
                    {uploadState.result.threat_summary.confidence.toUpperCase()}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">
                  Phishing Score:
                </span>
                <p className="font-semibold text-gray-900">
                  {(uploadState.result.phishing_score_cti * 100).toFixed(1)}%
                </p>
              </div>

              {uploadState.result.cti_flags.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Threat Indicators:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {uploadState.result.cti_flags.map((flag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-sm font-medium text-gray-600">
                  Email ID:
                </span>
                <p className="font-semibold text-gray-900">
                  #{uploadState.result.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailUpload;
