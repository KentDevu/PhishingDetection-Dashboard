# Phishing Detection Client

A modern, production-ready React application for analyzing and managing email threats with real-time CTI (Cyber Threat Intelligence) integration.

## 🎯 Overview

This client application provides security analysts with a comprehensive platform to:

- **Upload and analyze emails** for phishing threats using VirusTotal integration
- **Manage email security** with advanced filtering and search capabilities
- **Monitor threats** in real-time with intelligent notifications
- **Track security metrics** through interactive dashboards

## 🚀 Features

### ✅ **Implemented (Production Ready)**

#### 🏗️ **Core Infrastructure**

- **Production-ready API service** with comprehensive error handling
- **Environment configuration** for flexible deployments
- **TypeScript safety** with full type coverage
- **Responsive design** optimized for all devices

#### 📧 **Email Analysis & Upload**

- **File upload support** - .eml, .msg, .txt formats up to 10MB
- **Manual email entry** - direct input for analysis
- **Real-time threat analysis** with VirusTotal CTI integration
- **CRUD operations** - view, delete, bulk delete emails
- **Authentication analysis** - SPF, DKIM, DMARC results
- **Phishing scoring** with confidence levels
- **Attachment handling** with hash verification
- **Dedicated upload page** with intuitive workflow

#### � **Advanced Search & Filtering**

- **Quick search** - sender, subject, domain filtering
- **Advanced filters** - threat level, confidence, date ranges
- **Real-time filter state** with clear filter options
- **Filter persistence** across navigation
- **Smart search** with email/domain detection

#### �📊 **Dashboard & Analytics**

- **Live threat metrics** - total emails, high-risk threats, active threats
- **KPI calculations** from real API data
- **Automatic threat notifications** for critical emails
- **Interactive charts** for risk distribution and threat trends
- **Recent email activity** with threat indicators

#### 🔔 **Notification System**

- **Real-time alerts** for critical threats
- **Persistent notifications** for high-priority threats
- **Action buttons** for immediate threat response
- **Smart notification** management with auto-dismiss

#### 🛡️ **Threat Alert System**

- **Advanced threat detection** with customizable rules and conditions
- **Real-time monitoring** with automated threat scanning
- **Smart alerting** with severity-based notifications and escalation
- **Threat intelligence** dashboard with trends and analytics
- **Incident response** workflow with quarantine and blocking actions
- **Rule management** for custom threat detection patterns

### 🔄 **Next Features**

#### � **Enhanced Threat Alerts**

Based on API capabilities:

- Search by sender, subject, domain
- Filter by threat level (low/medium/high/critical)
- Date range filtering
- Attachment presence filtering
- CTI confidence level filtering

#### 📤 **Email Upload Analysis (Next Priority)**

- Upload raw emails for analysis
- Real-time CTI processing
- Threat intelligence integration
- Analysis results display

### 🚧 **Planned Features**

- **Advanced Search** - Full-text search with security-focused filters
- **Real-time Updates** - WebSocket/polling for live threat feeds
- **Enhanced Analytics** - Detailed reporting and threat intelligence
- **Bulk Operations** - Advanced email management workflows

## 🏛️ Architecture

### **Frontend Stack**

```
React 19.1.1 + TypeScript + Vite
├── Components (UI & Business Logic)
├── Services (API Integration)
├── Hooks (State Management)
├── Models (Type Definitions)
├── Contexts (Global State)
└── Utils (Helper Functions)
```

### **Key Components**

#### **Services Layer**

- **`apiService.ts`** - Base HTTP client with error handling and retry logic
- **`emailService.ts`** - Email-specific operations (CRUD, analysis)
- **`environmentService.ts`** - Configuration management for deployments

#### **State Management**

- **`useEmails.ts`** - Email data fetching and caching
- **`useBulkDelete.ts`** - Bulk email operations
- **`useDeleteEmail.ts`** - Individual email deletion
- **`NotificationContext.tsx`** - Real-time notification system

#### **UI Components**

- **`Dashboard.tsx`** - Main threat overview with live metrics
- **`EmailList.tsx`** - Comprehensive email management interface
- **`EmailCard.tsx`** - Individual email threat analysis display
- **`EmailFilters.tsx`** - Advanced search and filtering
- **`KPICard.tsx`** - Real-time security metrics
- **`NotificationSystem.tsx`** - Alert management

## 🔌 API Integration

### **Base Configuration**

```typescript
// Production API
const API_BASE_URL = "https://phishing-detection-api.kentharold.space/api"

// Environment configuration
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_API_TIMEOUT=10000
```

### **Supported Endpoints**

#### **Email Management**

```typescript
// Get all emails with filtering
GET /emails/all?threat_level=high&start_date=2023-01-01

// Analyze new email
POST /emails
Content-Type: application/json
{
  "rawEmail": "Return-Path: <sender@example.com>..."
}

// Delete email
DELETE /emails/:id

// Bulk delete
DELETE /emails/bulk
{
  "ids": [1, 2, 3]
}
```

#### **Advanced Filtering Parameters**

- `sender` - Filter by sender email (partial match)
- `subject` - Filter by subject (partial match)
- `sender_domain` - Filter by domain (exact match)
- `threat_level` - Filter by threat level or score
- `cti_confidence` - Filter by confidence level
- `start_date` / `end_date` - Date range filtering
- `has_attachments` - Filter by attachment presence

### **Response Format**

```typescript
interface Email {
  id: number;
  sender: string;
  subject: string;
  body: string;
  timestamp: string;
  phishing_score_cti: number; // 0.0-1.0
  threat_summary: {
    overall_risk: "clean" | "suspicious" | "high" | "critical";
    confidence: "low" | "medium" | "high";
    malicious_found: number;
    suspicious_found: number;
  };
  spf_result: "pass" | "fail" | "neutral";
  dkim_result: "pass" | "fail" | "neutral";
  dmarc_result: "pass" | "fail" | "neutral";
  detailed_analysis: {
    domains: Record<string, ThreatAnalysis>;
    ips: Record<string, ThreatAnalysis>;
    summary: {
      reputation_score: number;
      confidence_level: string;
    };
  };
}
```

## � Usage Guide

### **Email Upload & Analysis**

#### **File Upload**

1. Navigate to **Emails** → **Upload Email** button
2. Select **Upload File** tab
3. Choose email file (.eml, .msg, .txt) up to 10MB
4. Click **Analyze Email** to process
5. View analysis results with threat level and score

#### **Manual Entry**

1. Navigate to **Emails** → **Upload Email** button
2. Select **Manual Entry** tab
3. Fill in required fields:
   - Sender email
   - Recipient email
   - Subject line
   - Email body content
4. Click **Analyze Email** to process
5. Review comprehensive threat analysis

#### **Analysis Results**

- **Threat Level**: clean, suspicious, high, malicious, critical
- **Confidence Level**: low, medium, high
- **Phishing Score**: 0-100% risk percentage
- **CTI Flags**: Specific threat indicators found
- **Email ID**: System-assigned identifier for tracking

### **Email Management**

#### **Viewing Emails**

- Browse all analyzed emails in the main **Emails** page
- Use **Advanced Filters** for targeted searches
- Click any email row to view detailed analysis

#### **Search & Filtering**

- **Quick Search**: Enter sender email or subject keywords
- **Advanced Filters**:
  - Threat level (clean, suspicious, high, malicious, critical)
  - Confidence level (low, medium, high)
  - Date ranges with preset options
  - Sender domain filtering
  - Attachment presence
- **Clear Filters**: Reset all applied filters

#### **Bulk Operations**

- Select multiple emails using checkboxes
- **Bulk Delete**: Remove multiple emails at once
- **Export**: Generate reports for selected emails

### **Threat Alert System**

#### **Real-time Monitoring**

1. Navigate to **Threats** page via sidebar
2. Monitor system displays active threat detection rules
3. **Start/Stop Monitoring**: Control automated threat scanning
4. View real-time threat statistics and trends

#### **Threat Detection Rules**

- **Default Rules**: Pre-configured for common threats
  - Critical phishing detection (high confidence + malicious indicators)
  - Malicious attachment alerts
  - Suspicious sender patterns
  - High volume threat detection
- **Custom Rules**: Create organization-specific detection patterns
- **Rule Conditions**: threat_level, confidence, phishing_score, sender_domain, cti_flags
- **Actions**: notify, quarantine, block_sender, escalate, log

#### **Alert Management**

- **Severity Levels**: Critical, High, Medium, Low
- **Smart Notifications**: Persistent alerts for critical threats
- **Action Buttons**: Investigate, quarantine, block sender
- **Escalation**: Automatic escalation to security teams for critical threats
- **Cooldown Periods**: Prevent alert spam with configurable timeouts

#### **Threat Intelligence Dashboard**

- **Live Statistics**: Critical alerts, high priority, total threats
- **Recent Alerts**: Latest security incidents requiring attention
- **Threat Trends**: Distribution by type (phishing, malware, spam, suspicious)
- **Top Threat Sources**: Most frequent sources with blocking options
- **Response Analytics**: Detection rates and response times

## �🛠️ Development

### **Setup**

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API configuration

# Start development server
npm run dev
```

### **Environment Variables**

```env
# API Configuration
VITE_API_BASE_URL=https://phishing-detection-api.kentharold.space/api
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_FEATURE_REAL_TIME=true
VITE_FEATURE_ANALYTICS=true
VITE_FEATURE_BULK_OPS=true
```

### **Build for Production**

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

### **Development Testing**

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

### **API Testing**

The application includes built-in API connection testing:

- Automatic connection verification on startup
- Real-time connection status monitoring
- Error handling with retry mechanisms
- Fallback to demo data during development

## 📁 Project Structure

```
src/
├── components/           # UI Components
│   ├── dashboard/       # Dashboard-specific components
│   ├── emails/          # Email management components
│   ├── ui/              # Reusable UI components
│   └── debug/           # Development/debug components
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── models/              # TypeScript type definitions
├── pages/               # Main application pages
├── services/            # API and external service integration
├── utils/               # Helper functions and utilities
└── assets/              # Static assets
```

## 🔐 Security Features

### **Authentication Analysis**

- **SPF (Sender Policy Framework)** verification
- **DKIM (DomainKeys Identified Mail)** validation
- **DMARC (Domain-based Message Authentication)** compliance

### **Threat Intelligence**

- **VirusTotal integration** for domain and IP reputation
- **Real-time CTI analysis** with confidence scoring
- **Threat categorization** - clean, suspicious, high, critical
- **Attachment analysis** with hash verification

### **Security Metrics**

- **Phishing confidence scores** (0-100%)
- **Authentication pass rates** tracking
- **Threat distribution** analytics
- **Real-time threat notifications** for immediate response

## 🚀 Deployment

### **Production Checklist**

- [ ] Configure production API endpoint
- [ ] Set up environment variables
- [ ] Optimize bundle size
- [ ] Configure error monitoring
- [ ] Set up analytics tracking
- [ ] Test all critical workflows

### **Environment Configuration**

```typescript
// Production
const config = {
  apiBaseUrl: "https://your-production-api.com/api",
  features: {
    realTimeUpdates: true,
    advancedAnalytics: true,
    bulkOperations: true,
  },
};
```

## 📊 Performance

### **Optimization Features**

- **Lazy loading** for components and routes
- **Efficient data fetching** with caching
- **Optimized re-renders** with React hooks
- **Bundle splitting** for faster initial loads
- **Error boundaries** for graceful failure handling

### **Monitoring**

- **Real-time performance** metrics
- **API response time** tracking
- **Error rate** monitoring
- **User experience** analytics

## 🔄 Development Workflow

### **Current Status: MVP Complete** ✅

The application is production-ready with core phishing detection capabilities:

1. **✅ API Foundation** - Complete with error handling and retry logic
2. **✅ Email Analysis** - Full CRUD operations with threat analysis
3. **✅ Dashboard Integration** - Real-time metrics and notifications
4. **🔄 Advanced Filtering** - In progress (next priority)
5. **🔄 Email Upload** - Next priority for complete analyst workflow

### **Next Development Phase**

1. **Priority 1**: Advanced email filtering and search
2. **Priority 2**: Email upload and analysis workflow
3. **Priority 3**: Real-time updates and enhanced notifications

## 🤝 Contributing

### **Development Standards**

- **TypeScript** for type safety
- **ESLint** for code quality
- **Component-driven** architecture
- **Error boundary** implementation
- **Accessibility** compliance

### **Code Style**

- Use functional components with hooks
- Implement proper error handling
- Write comprehensive TypeScript types
- Follow React best practices
- Optimize for performance

## 📞 Support

### **Development Issues**

- Check console for detailed error messages
- Verify API endpoint configuration
- Review network requests in DevTools
- Check environment variable configuration

### **Production Support**

- Monitor API response times
- Track error rates and patterns
- Review threat detection accuracy
- Analyze user workflow efficiency

---

**Built for Security Analysts** | **Production Ready** | **Modern React Architecture**

_This application provides enterprise-grade email threat analysis with real-time CTI integration, designed for security teams who need immediate threat visibility and response capabilities._
