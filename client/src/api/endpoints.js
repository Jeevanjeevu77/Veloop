import apiClient from './client';

export const signup = (payload) => apiClient.post('/auth/signup', payload);
export const login = (payload) => apiClient.post('/auth/login', payload);
export const fetchMe = () => apiClient.get('/auth/me');

export const fetchDashboard = () => apiClient.get('/dashboard');

export const fetchTasks = () => apiClient.get('/tasks');
export const claimTask = (taskId) => apiClient.post('/tasks/claim', { taskId });

export const fetchGamePlayStatus = () => apiClient.get('/game/play');
export const submitGameResult = (score) => apiClient.post('/game/result', { score });
