// API Configuration
export const API_CONFIG = {
  BASE_URL: (import.meta as any)?.env?.VITE_API_BASE_URL || '',
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    STUDENTS: '/api/students',
    STUDENT: '/api/student',
    EVIDENCE: '/api/evidence',
    STATS: '/api/stats',
    CHAT: '/api/chat',
    UPLOAD: '/api/upload'
  }
};

// Helper to build full API URLs
export const buildApiUrl = (endpoint: string) => {
  const baseUrl = API_CONFIG.BASE_URL;
  return baseUrl ? `${baseUrl}${endpoint}` : endpoint;
};

// Helper function for making API requests with proper URLs
export const makeApiRequest = async (endpoint: string, options?: RequestInit) => {
  const url = buildApiUrl(endpoint);
  console.log('🔗 Making API request to:', url);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response;
};
