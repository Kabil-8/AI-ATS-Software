import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useJobs = (params = {}) =>
  useQuery({
    queryKey: ['jobs', params],
    queryFn: async () => {
      const { data } = await api.get('/jobs', { params });
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });

export const useJob = (id) =>
  useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${id}`);
      return data.job;
    },
    enabled: !!id,
  });

export const useMyJobs = (params = {}) =>
  useQuery({
    queryKey: ['myJobs', params],
    queryFn: async () => {
      const { data } = await api.get('/jobs/recruiter/my-jobs', { params });
      return data;
    },
  });

export const useRecruiterStats = () =>
  useQuery({
    queryKey: ['recruiterStats'],
    queryFn: async () => {
      const { data } = await api.get('/jobs/recruiter/stats');
      return data.stats || {};
    },
    refetchInterval: 30000,
  });

export const useCreateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post('/jobs', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myJobs'] }),
  });
};

export const useUpdateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.put(`/jobs/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myJobs'] });
      qc.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useArchiveJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/jobs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myJobs'] }),
  });
};
