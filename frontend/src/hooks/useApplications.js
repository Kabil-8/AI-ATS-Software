import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useMyApplications = () =>
  useQuery({
    queryKey: ['myApplications'],
    queryFn: async () => {
      const { data } = await api.get('/applications/my');
      return data.applications || data.data || [];
    },
  });

export const useJobApplications = (jobId, params = {}) =>
  useQuery({
    queryKey: ['jobApplications', jobId, params],
    queryFn: async () => {
      if (!jobId) return [];
      const { data } = await api.get(`/applications/job/${jobId}`, { params });
      return data.applications || data.data || [];
    },
    enabled: !!jobId,
  });

export const useApplication = (id) =>
  useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      const { data } = await api.get(`/applications/${id}`);
      return data.application || data.data;
    },
    enabled: !!id,
  });

export const useSubmitApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) =>
      api.post('/applications', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myApplications'] }),
  });
};

export const useUpdateStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }) => api.patch(`/applications/${id}/status`, { status, note }),
    onSuccess: (_, { jobId }) => {
      qc.invalidateQueries({ queryKey: ['jobApplications', jobId] });
      qc.invalidateQueries({ queryKey: ['myApplications'] });
    },
  });
};

export const useAnalyzeApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId) => api.post(`/ai/parse-resume`, { applicationId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobApplications'] }),
  });
};

export const useAnalyzeBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId) => api.get(`/ai/rank-candidates/${jobId}`),
    onSuccess: (_, jobId) => {
      qc.invalidateQueries({ queryKey: ['jobApplications', jobId] });
    },
  });
};

export const useAddNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }) => api.post(`/applications/${id}/notes`, { content }),
    onSuccess: (_, { jobId }) => qc.invalidateQueries({ queryKey: ['jobApplications', jobId] }),
  });
};
