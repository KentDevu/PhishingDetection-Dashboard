import axios, { type ResponseType } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/",
  // baseURL: "http://localhost:5000/api/", // if localhost
});

const getHeaders = (isFormData?: boolean) => {
  const headers: { [key: string]: string } = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// Simple cache invalidation function
const invalidateCacheForEndpoint = async (endpoint: string, method: string) => {
  // For now, just a placeholder. You can implement actual cache invalidation logic here
  if (method !== 'GET') {
    // Invalidate cache for mutations
    console.log(`Invalidating cache for ${endpoint}`);
  }
};

// Generic dataFetch function with a return type
export default async function dataFetch<T>(
  endpoint: string,
  method: string,
  data?: unknown, 
  responseType?: ResponseType
): Promise<T> {
  try {
    const isFormData = data instanceof FormData;
    const headers = getHeaders(isFormData);

    const response = await api.request({
      url: endpoint,
      method,
      data,
      headers,
      responseType: responseType || "json",
    });

    // Automatically invalidate cache after successful mutations
    await invalidateCacheForEndpoint(endpoint, method);

    return response.data as T;
  } catch (error: unknown) {
    console.error("API Error:", error);
    
    // Handle 401 Unauthorized errors by clearing session
    if (error && typeof error === 'object' && 'response' in error) {
      // const axiosError = error as any;
    }
    
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}