// Email Upload Page - Dedicated page for email analysis upload

import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import EmailUpload from "../components/emails/EmailUpload";
import type { Email } from "../models/email";

export function EmailUploadPage() {
  const navigate = useNavigate();

  const handleEmailAnalyzed = (analyzedEmail: Email) => {
    // Show success message
    alert(
      `Email analyzed successfully!\n` +
        `Threat Level: ${analyzedEmail.threat_summary.overall_risk.toUpperCase()}\n` +
        `Risk Score: ${(analyzedEmail.phishing_score_cti * 100).toFixed(
          1
        )}%\n` +
        `Email ID: #${analyzedEmail.id}`
    );

    // Navigate back to emails page
    navigate("/emails");
  };

  const handleClose = () => {
    navigate("/emails");
  };

  return (
    <div className="upload-page">
      <div className="upload-page__header">
        <button onClick={handleClose} className="back-button">
          <ArrowLeft size={20} />
          <span>Back to Emails</span>
        </button>

        <div className="page-title">
          <Mail className="page-title__icon" size={28} />
          <div>
            <h1>Email Analysis Upload</h1>
            <p>
              Upload an email file or enter email data manually for advanced
              threat analysis
            </p>
          </div>
        </div>
      </div>

      <div className="upload-page__content">
        <EmailUpload
          onEmailAnalyzed={handleEmailAnalyzed}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}

// Upload Page Styles
const styles = `
.upload-page {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-primary);
}

.upload-page__header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  align-self: flex-start;
}

.back-button:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateX(-2px);
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.page-title__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.page-title h1 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.page-title p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-md);
  max-width: 600px;
}

.upload-page__content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* Responsive Design */
@media (max-width: 768px) {
  .upload-page {
    padding: var(--spacing-lg);
  }

  .page-title {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .page-title h1 {
    font-size: var(--font-size-2xl);
  }

  .upload-page__content {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .upload-page {
    padding: var(--spacing-md);
  }

  .upload-page__content {
    padding: var(--spacing-md);
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById("upload-page-styles");
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "upload-page-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
