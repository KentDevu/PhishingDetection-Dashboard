// API Configuration Validation Script
// Run this in browser console to verify API endpoint construction

console.group("🔧 API Configuration Validation");
console.log("Testing API endpoint construction...");

// Import services (in actual usage, these would be imported normally)
import { environmentService } from "./src/services/environmentService";
import { apiService } from "./src/services/apiService";

// Test environment service configuration
console.log("📍 Environment Service:");
console.log("  Base URL:", environmentService.apiBaseUrl);
console.log("  Timeout:", environmentService.apiTimeout);
console.log("  Features:", environmentService.features);

// Test API service base URL
console.log("📍 API Service:");
console.log("  Base URL:", apiService.getBaseUrl());

// Test endpoint construction
console.log("📍 Endpoint Construction Test:");
const testEndpoints = ["/emails/all", "/emails", "/emails/123", "/emails/bulk"];

testEndpoints.forEach((endpoint) => {
  const fullUrl = `${apiService.getBaseUrl()}${endpoint}`;
  console.log(`  ${endpoint} → ${fullUrl}`);
});

// Expected URLs for the new API:
const expectedUrls = {
  getAllEmails:
    "https://phishing-detection-api.kentharold.space/api/emails/all",
  uploadEmail: "https://phishing-detection-api.kentharold.space/api/emails",
  deleteEmail:
    "https://phishing-detection-api.kentharold.space/api/emails/{id}",
  bulkDelete: "https://phishing-detection-api.kentharold.space/api/emails/bulk",
};

console.log("📍 Expected API Endpoints:");
Object.entries(expectedUrls).forEach(([operation, url]) => {
  console.log(`  ${operation}: ${url}`);
});

console.groupEnd();
console.log("✅ API Configuration validation complete!");

export const validateApiConfiguration = () => {
  return {
    baseUrl: apiService.getBaseUrl(),
    endpoints: testEndpoints.map((endpoint) => ({
      endpoint,
      fullUrl: `${apiService.getBaseUrl()}${endpoint}`,
    })),
    isCorrect:
      apiService.getBaseUrl() ===
      "https://phishing-detection-api.kentharold.space/api",
  };
};
