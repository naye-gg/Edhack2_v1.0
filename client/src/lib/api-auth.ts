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
  getAll: () => authenticatedFetch("/api/student-operations").then((res: Response) => res.json()),
  getById: (id: string) => authenticatedFetch(`/api/student-operations?studentId=${id}`).then((res: Response) => res.json()),
  create: (data: any) => authApiRequest("POST", "/api/student-operations", data).then((res: Response) => res.json()),
  update: (id: string, data: any) => authApiRequest("PUT", `/api/student-operations?studentId=${id}`, data).then((res: Response) => res.json()),
  delete: (id: string) => authApiRequest("DELETE", `/api/student-operations?studentId=${id}`),
};

// Teacher Perspectives API
export const perspectivesApi = {
  get: (studentId: string) => authenticatedFetch(`/api/student-operations?studentId=${studentId}&action=teacher-perspectives`).then((res: Response) => res.json()),
  create: (studentId: string, data: any) => 
    authApiRequest("POST", `/api/student-operations?studentId=${studentId}&action=teacher-perspectives`, data).then((res: Response) => res.json()),
  update: (studentId: string, data: any) => 
    authApiRequest("PUT", `/api/student-operations?studentId=${studentId}&action=teacher-perspectives`, data).then((res: Response) => res.json()),
};

// Evidence API
export const evidenceApi = {
  getAll: () => authenticatedFetch("/api/evidence").then((res: Response) => res.json()),
  getByStudentId: (studentId: string) => 
    authenticatedFetch(`/api/student-operations?studentId=${studentId}&action=evidence`).then((res: Response) => res.json()),
  upload: async (studentId: string, formData: FormData) => {
    const token = localStorage.getItem('teacherToken');
    const response = await fetch(`/api/upload`, {
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
    authApiRequest("POST", `/api/evidence/${evidenceId}/analysis`).then((res: Response) => res.json()),
};

// Learning Profiles API
export const profilesApi = {
  get: (studentId: string) => 
    authenticatedFetch(`/api/student-operations?studentId=${studentId}&action=learning-profile`).then((res: Response) => res.json()),
  generate: (studentId: string) => 
    authApiRequest("POST", `/api/student-operations?studentId=${studentId}&action=generate-ai-profile`).then((res: Response) => res.json()),
};

// Stats API
export const statsApi = {
  getDashboard: () => authenticatedFetch("/api/stats").then((res: Response) => res.json()),
};
