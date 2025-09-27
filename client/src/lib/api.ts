import { apiRequest } from "./queryClient";

// Students API
export const studentsApi = {
  getAll: () => fetch("/api/students").then(res => res.json()),
  getById: (id: string) => fetch(`/api/students/${id}`).then(res => res.json()),
  create: (data: any) => apiRequest("POST", "/api/students", data).then(res => res.json()),
  update: (id: string, data: any) => apiRequest("PUT", `/api/students/${id}`, data).then(res => res.json()),
  delete: (id: string) => apiRequest("DELETE", `/api/students/${id}`),
};

// Teacher Perspectives API
export const perspectivesApi = {
  get: (studentId: string) => fetch(`/api/students/${studentId}/perspective`).then(res => res.json()),
  create: (studentId: string, data: any) => 
    apiRequest("POST", `/api/students/${studentId}/perspective`, data).then(res => res.json()),
  update: (studentId: string, data: any) => 
    apiRequest("PUT", `/api/students/${studentId}/perspective`, data).then(res => res.json()),
};

// Evidence API
export const evidenceApi = {
  getAll: () => fetch("/api/evidence").then(res => res.json()),
  getByStudent: (studentId: string) => 
    fetch(`/api/students/${studentId}/evidence`).then(res => res.json()),
  upload: async (studentId: string, formData: FormData) => {
    const response = await fetch(`/api/students/${studentId}/evidence`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },
  analyze: (evidenceId: string) => 
    apiRequest("POST", `/api/evidence/${evidenceId}/analyze`).then(res => res.json()),
};

// Learning Profiles API
export const profilesApi = {
  get: (studentId: string) => fetch(`/api/students/${studentId}/profile`).then(res => res.json()),
  generate: (studentId: string) => 
    apiRequest("POST", `/api/students/${studentId}/profile/generate`).then(res => res.json()),
};

// Statistics API
export const statsApi = {
  get: () => fetch("/api/stats").then(res => res.json()),
};

// File download helper
export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
