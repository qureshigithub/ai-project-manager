import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Types ----
export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
  last_activity: string;
  is_active: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  project_id: number;
  assigned_to: number | null;
  depends_on: number | null;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// ---- API Functions ----
export const getProjects = () => api.get<Project[]>('/projects');
export const createProject = (data: any) => api.post<Project>('/projects', data);

export const getTasks = (projectId: number) => api.get<Task[]>(`/tasks/project/${projectId}`);
export const createTask = (data: any) => api.post<Task>('/tasks', data);

export const getUsers = () => api.get<User[]>('/users');

export const getDashboard = () => api.get('/dashboard/summary');
export const getWorkload = () => api.get('/analytics/workload');

export const askAI = (query: string, projectId: number) =>
  api.post<{ result: string }>('/agents/query', { query, project_id: projectId, task_id: 0 });

export const detectInactive = (days: number = 7) =>
  api.post(`/automation/detect-inactive?days=${days}`);

export const meetingSummary = (text: string, type: string = 'general') =>
  api.post(`/automation/meeting-summary?meeting_text=${encodeURIComponent(text)}&meeting_type=${type}`);

// ---- API Functions ----
export const getUtilization = () => api.get('/analytics/utilization');

// Alerts
export const getAlerts = () => api.get('/alerts');

// Sprint Report
export const getWeeklyReport = (projectId: number) => api.get(`/sprint/weekly/${projectId}`);

