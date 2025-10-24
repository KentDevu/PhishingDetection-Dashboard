// Simple Security Settings Panel (Placeholder)

import { Shield } from "lucide-react";

export function SecuritySettingsPanel() {
  return (
    <div className="security-settings-panel">
      <div className="settings-header">
        <div className="settings-header__title">
          <Shield size={24} />
          <div>
            <h2>Security Settings</h2>
            <p>
              Configure authentication, access control, and security policies
            </p>
          </div>
        </div>
      </div>

      <div className="placeholder-panel">
        <div className="placeholder-content">
          <Shield size={48} />
          <h2>Security Configuration</h2>
          <p>
            Advanced security settings and access controls will be available
            here.
          </p>
          <div className="placeholder-features">
            <div className="feature-item">
              <div className="feature-icon">🔐</div>
              <div>
                <h4>Multi-Factor Authentication</h4>
                <p>Configure MFA requirements and methods</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔑</div>
              <div>
                <h4>Password Policies</h4>
                <p>Define password complexity and expiration rules</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <div>
                <h4>Access Controls</h4>
                <p>IP restrictions and role-based permissions</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📋</div>
              <div>
                <h4>Audit Logging</h4>
                <p>Security event monitoring and compliance</p>
              </div>
            </div>
          </div>
          <div className="coming-soon">Coming Soon</div>
        </div>
      </div>
    </div>
  );
}

// Security Settings Styles
const styles = `
.security-settings-panel {
  padding: var(--spacing-xl);
  max-width: 1000px;
  margin: 0 auto;
}

/* Settings Header */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.settings-header__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.settings-header__title svg {
  color: var(--color-primary);
}

.settings-header h2 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.settings-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

/* Placeholder Panels */
.placeholder-panel {
  padding: var(--spacing-xl);
}

.placeholder-content {
  text-align: center;
  padding: var(--spacing-2xl);
}

.placeholder-content svg {
  color: var(--text-muted);
  margin-bottom: var(--spacing-lg);
}

.placeholder-content h2 {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.placeholder-content > p {
  margin: 0 0 var(--spacing-2xl);
  font-size: var(--font-size-md);
  color: var(--text-muted);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.placeholder-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  text-align: left;
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.feature-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.feature-item h4 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.feature-item p {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  line-height: 1.4;
}

.coming-soon {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(19, 255, 160, 0.1);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Responsive Design */
@media (max-width: 768px) {
  .security-settings-panel {
    padding: var(--spacing-lg);
  }

  .placeholder-features {
    grid-template-columns: 1fr;
  }

  .feature-item {
    padding: var(--spacing-md);
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.getElementById(
    "security-settings-panel-styles"
  );
  if (!styleElement) {
    const style = document.createElement("style");
    style.id = "security-settings-panel-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
