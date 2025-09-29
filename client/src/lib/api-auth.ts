import { authenticatedFetch } from "../hooks/useAuth";

// Helper function for authenticated API requests
async function authApiRequest(method: string, url: string, data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('teacherToken') || '',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  return authenticatedFetch(url, options);
}

// Students API
export const studentsApi = {
  getAll: () => authenticatedFetch("/api/students").then((res: Response) => res.json()),
  getById: (id: string) => authenticatedFetch(`/api/students/${id}`).then((res: Response) => res.json()),
  create: (data: any) => authApiRequest("POST", "/api/students", data).then((res: Response) => res.json()),
  update: (id: string, data: any) => authApiRequest("PUT", `/api/students/${id}`, data).then((res: Response) => res.json()),
  delete: (id: string) => authApiRequest("DELETE", `/api/students/${id}`),
};

// Teacher Perspectives API
export const perspectivesApi = {
  get: (studentId: string) => authenticatedFetch(`/api/students/${studentId}/perspective`).then((res: Response) => res.json()),
  create: (studentId: string, data: any) => 
    authApiRequest("POST", `/api/students/${studentId}/perspective`, data).then((res: Response) => res.json()),
  update: (studentId: string, data: any) => 
    authApiRequest("PUT", `/api/students/${studentId}/perspective`, data).then((res: Response) => res.json()),
};

// Evidence API
export const evidenceApi = {
  getAll: () => authenticatedFetch("/api/evidence").then((res: Response) => res.json()),
  getByStudent: (studentId: string) => 
    authenticatedFetch(`/api/students/${studentId}/evidence`).then((res: Response) => res.json()),
  upload: async (studentId: string, formData: FormData) => {
    const token = localStorage.getItem('teacherToken');
    const response = await fetch(`/api/students/${studentId}/evidence`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': token || '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload evidence');
    }
    
    return response.json();
  },
  analyze: (evidenceId: string) => 
    authApiRequest("POST", `/api/evidence/${evidenceId}/ai-analyze`).then((res: Response) => res.json()),
};

// Learning Profiles API
export const profilesApi = {
  get: (studentId: string) => 
    authenticatedFetch(`/api/students/${studentId}/learning-profile`).then((res: Response) => res.json()),
  generate: (studentId: string) => 
    authApiRequest("POST", `/api/students/${studentId}/generate-ai-profile`).then((res: Response) => res.json()),
};

// Stats API
export const statsApi = {
  getDashboard: () => authenticatedFetch("/api/stats").then((res: Response) => res.json()),
};
