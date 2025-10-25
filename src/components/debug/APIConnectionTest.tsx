// API Connection Test Component

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { apiService } from "../../services/apiService";
import { emailService } from "../../services/emailService";

interface ConnectionTestResult {
  success: boolean;
  message: string;
  responseTime: number;
  baseUrl: string;
}

interface EmailTestResult {
  success: boolean;
  message: string;
  emailCount: number;
}

export function APIConnectionTest() {
  const [connectionResult, setConnectionResult] =
    useState<ConnectionTestResult | null>(null);
  const [emailResult, setEmailResult] = useState<EmailTestResult | null>(null);
  const [testing, setTesting] = useState(false);

  const runConnectionTest = async () => {
    setTesting(true);
    try {
      // Test basic API connection
      const connTest = await apiService.testConnection();
      setConnectionResult(connTest);

      // Test email endpoint specifically
      const emailTest = await apiService.testEmailsEndpoint();
      setEmailResult(emailTest);
    } catch (error) {
      setConnectionResult({
        success: false,
        message: `Test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        responseTime: 0,
        baseUrl: apiService.getBaseUrl(),
      });
    } finally {
      setTesting(false);
    }
  };

  // Auto-run test on component mount
  useEffect(() => {
    runConnectionTest();
  }, []);

  const getStatusIcon = (success: boolean | null) => {
    if (success === null)
      return <Clock size={16} className="text-yellow-500" />;
    if (success) return <CheckCircle size={16} className="text-green-500" />;
    return <XCircle size={16} className="text-red-500" />;
  };

  const getStatusColor = (success: boolean | null) => {
    if (success === null) return "border-yellow-200 bg-yellow-50";
    if (success) return "border-green-200 bg-green-50";
    return "border-red-200 bg-red-50";
  };

  return (
    <div className="api-connection-test">
      <div className="api-test-header">
        <h3>🔌 API Connection Status</h3>
        <button
          className="btn btn--sm btn--outline"
          onClick={runConnectionTest}
          disabled={testing}
        >
          {testing ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw size={14} />
              Test Again
            </>
          )}
        </button>
      </div>

      <div className="api-test-results">
        {/* Basic Connection Test */}
        <div
          className={`test-result ${getStatusColor(
            connectionResult?.success ?? null
          )}`}
        >
          <div className="test-result-header">
            {getStatusIcon(connectionResult?.success ?? null)}
            <span className="test-label">API Connection</span>
            {connectionResult?.responseTime && (
              <span className="response-time">
                {connectionResult.responseTime}ms
              </span>
            )}
          </div>
          <div className="test-details">
            <div className="api-url">
              <strong>URL:</strong> {apiService.getBaseUrl()}
            </div>
            <div className="test-message">
              {connectionResult?.message || "Waiting for test..."}
            </div>
          </div>
        </div>

        {/* Email Endpoint Test */}
        <div
          className={`test-result ${getStatusColor(
            emailResult?.success ?? null
          )}`}
        >
          <div className="test-result-header">
            {getStatusIcon(emailResult?.success ?? null)}
            <span className="test-label">Email Endpoint</span>
            {emailResult?.success && (
              <span className="email-count">
                {emailResult.emailCount} emails found
              </span>
            )}
          </div>
          <div className="test-details">
            <div className="api-url">
              <strong>Endpoint:</strong> /emails/all
            </div>
            <div className="test-message">
              {emailResult?.message || "Waiting for test..."}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {connectionResult?.success && (
          <div className="quick-actions">
            <button
              className="btn btn--sm btn--primary"
              onClick={() => {
                // Test fetching emails directly
                emailService
                  .getAllEmails()
                  .then((emails) => {
                    console.log("✅ Successfully fetched emails:", emails);
                    alert(
                      `Success! Fetched ${emails.length} emails from the API`
                    );
                  })
                  .catch((error) => {
                    console.error("❌ Failed to fetch emails:", error);
                    alert(
                      `Failed to fetch emails: ${error.error || error.message}`
                    );
                  });
              }}
            >
              📧 Fetch Emails
            </button>

            <button
              className="btn btn--sm btn--outline"
              onClick={() => {
                window.open(apiService.getBaseUrl() + "/emails/all", "_blank");
              }}
            >
              🔗 Open API in Browser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles for the API Connection Test
const styles = `
.api-connection-test {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.api-test-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.api-test-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.api-test-results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.test-result {
  padding: var(--spacing-md);
  border: 1px solid;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.test-result-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.test-label {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  flex: 1;
}

.response-time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background: var(--bg-primary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.email-count {
  font-size: var(--font-size-xs);
  color: var(--color-success);
  background: rgba(19, 255, 160, 0.1);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.test-details {
  font-size: var(--font-size-sm);
}

.api-url {
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
  font-family: var(--font-mono, monospace);
  word-break: break-all;
}

.test-message {
  color: var(--text-secondary);
}

.quick-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-secondary);
}

@media (max-width: 768px) {
  .api-test-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .quick-actions {
    flex-direction: column;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("api-connection-test-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "api-connection-test-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
