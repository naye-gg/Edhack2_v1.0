import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Hook personalizado para obtener el token de autorización
export function useAuthToken() {
  const token = localStorage.getItem('teacherToken');
  return token;
}

// Headers autenticados
export function getAuthHeaders() {
  const token = localStorage.getItem('teacherToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': token })
  };
}

// Función para hacer fetch autenticado
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const headers = getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token inválido o expirado, limpiar localStorage
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherData');
    window.location.reload();
    throw new Error('Sesión expirada');
  }

  return response;
}

// Hook para obtener estudiantes del profesor autenticado
export function useStudents() {
  return useQuery({
    queryKey: ["/api/students"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/students");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      return response.json();
    },
  });
}

// Hook para crear estudiante
export function useCreateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentData: any) => {
      const response = await authenticatedFetch("/api/students", {
        method: "POST",
        body: JSON.stringify(studentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create student");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
    },
  });
}

// Hook para obtener evidencias
export function useEvidence() {
  return useQuery({
    queryKey: ["/api/evidence"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/evidence");
      if (!response.ok) {
        throw new Error("Failed to fetch evidence");
      }
      return response.json();
    },
  });
}

// Hook para obtener estadísticas del dashboard
export function useDashboardStats() {
  return useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      return response.json();
    },
  });
}
