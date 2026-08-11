import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Badge,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Task as TaskIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Folder as FolderIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SmartToy as SmartToyIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  end_date: string | null;
  start_date: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
  project_id: number;
  assigned_to: number | null;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
}

interface UserTasks {
  user_id: number;
  user_name: string;
  total_tasks: number;
  tasks: Task[];
}

function AdminDashboard() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const theme = useMemo(() => createTheme({
    palette: {
      mode: mode,
      ...(mode === 'dark' ? {
        background: { default: '#0e1117', paper: '#1a1a2e' },
        text: { primary: '#ffffff', secondary: '#94a3b8' },
        divider: '#333344',
      } : {
        background: { default: '#f8fafc', paper: '#ffffff' },
        text: { primary: '#111827', secondary: '#64748b' },
        divider: '#e2e8f0',
      }),
      primary: { main: '#6366f1' },
    },
  }), [mode]);

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [userTasks, setUserTasks] = useState<UserTasks | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [status, setStatus] = useState('todo');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editAssigneeId, setEditAssigneeId] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [editProjectIdState, setEditProjectIdState] = useState<number | null>(null);
  const [editProjName, setEditProjName] = useState('');
  const [editProjDesc, setEditProjDesc] = useState('');
  const [editProjStatus, setEditProjStatus] = useState('active');
  const [editProjEndDate, setEditProjEndDate] = useState('');
  const [editProjLoading, setEditProjLoading] = useState(false);

  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [deleteProjLoading, setDeleteProjLoading] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('engineer');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projStatus, setProjStatus] = useState('active');
  const [projEndDate, setProjEndDate] = useState('');
  const [projLoading, setProjLoading] = useState(false);
  const [projSuccess, setProjSuccess] = useState(false);
  const [projError, setProjError] = useState('');

  const [agentQuery, setAgentQuery] = useState('');
  const [agentResponse, setAgentResponse] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState('');
  const [agentType, setAgentType] = useState('risk');
  const [agentProjectId, setAgentProjectId] = useState<number>(1);

  // ============================================================
  // 🆕 EDIT & DELETE USER STATES
  // ============================================================
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserLoading, setEditUserLoading] = useState(false);

  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, projectsRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/users/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/projects/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/tasks/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTasks = async (userId: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users/${userId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserTasks(res.data);
      setSelectedUser(userId);
    } catch (err) {
      setError('Failed to load user tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!token || !title || !projectId || !assigneeId) {
      setError('Please fill all fields');
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        title,
        description: 'Assigned by admin',
        project_id: parseInt(projectId),
        assigned_to: parseInt(assigneeId),
        status,
        priority: 3,
      };

      if (startDate) payload.start_date = startDate;
      if (dueDate) payload.due_date = dueDate;

      await axios.post(`${API_URL}/tasks/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTitle('');
      setProjectId('');
      setAssigneeId('');
      setStatus('todo');
      setStartDate('');
      setDueDate('');
      fetchData();
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Failed to assign task');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditTaskId(task.id);
    setEditTitle(task.title);
    setEditProjectId(task.project_id.toString());
    setEditAssigneeId(task.assigned_to ? task.assigned_to.toString() : '');
    setEditStatus(task.status);
    setEditStartDate(task.start_date ? task.start_date.split('T')[0] : '');
    setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setEditDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editTaskId || !editTitle || !editProjectId || !editAssigneeId) {
      setError('Please fill all fields');
      return;
    }

    setEditLoading(true);
    try {
      const payload: any = {
        title: editTitle,
        description: 'Updated by admin',
        project_id: parseInt(editProjectId),
        assigned_to: parseInt(editAssigneeId),
        status: editStatus,
        priority: 3,
      };

      if (editStartDate) payload.start_date = editStartDate;
      if (editDueDate) payload.due_date = editDueDate;

      await axios.put(`${API_URL}/tasks/${editTaskId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditDialogOpen(false);
      fetchData();
    } catch (err: any) {
      setError('Failed to update task');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTask = (taskId: number) => {
    setDeleteTaskId(taskId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!deleteTaskId) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_URL}/tasks/${deleteTaskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      setError('Failed to delete task');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditProjectIdState(project.id);
    setEditProjName(project.name);
    setEditProjDesc(project.description || '');
    setEditProjStatus(project.status);
    setEditProjEndDate(project.end_date ? project.end_date.split('T')[0] : '');
    setEditProjectDialogOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!editProjectIdState || !editProjName) {
      setError('Please fill all fields');
      return;
    }

    setEditProjLoading(true);
    try {
      const payload: any = {
        name: editProjName,
        description: editProjDesc,
        status: editProjStatus,
      };

      if (editProjEndDate) {
        payload.end_date = editProjEndDate;
      }

      await axios.put(`${API_URL}/projects/${editProjectIdState}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditProjectDialogOpen(false);
      fetchData();
    } catch (err: any) {
      setError('Failed to update project');
    } finally {
      setEditProjLoading(false);
    }
  };

  const handleDeleteProject = (projectId: number) => {
    setDeleteProjectId(projectId);
    setDeleteProjectDialogOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!deleteProjectId) return;
    setDeleteProjLoading(true);
    try {
      await axios.delete(`${API_URL}/projects/${deleteProjectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteProjectDialogOpen(false);
      fetchData();
    } catch (err: any) {
      setError('Failed to delete project');
    } finally {
      setDeleteProjLoading(false);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    if (!regName || !regEmail || !regPassword) {
      setRegError('Please fill all fields');
      setRegLoading(false);
      return;
    }

    try {
      const payload = {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
      };

      await axios.post(`${API_URL}/auth/register`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRegSuccess(true);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegRole('engineer');
      fetchData();
      setTimeout(() => setRegSuccess(false), 3000);
    } catch (err: any) {
      setRegError(err.response?.data?.detail || 'Failed to register user');
    } finally {
      setRegLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjError('');
    setProjLoading(true);

    if (!projName) {
      setProjError('Project name is required');
      setProjLoading(false);
      return;
    }

    try {
      const payload: any = {
        name: projName,
        description: projDesc || 'Created by admin',
        status: projStatus,
      };

      if (projEndDate) payload.end_date = projEndDate;

      await axios.post(`${API_URL}/projects/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProjSuccess(true);
      setProjName('');
      setProjDesc('');
      setProjStatus('active');
      setProjEndDate('');
      fetchData();
      setTimeout(() => setProjSuccess(false), 3000);
    } catch (err: any) {
      setProjError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setProjLoading(false);
    }
  };

  const handleAgentQuery = async () => {
    if (!agentQuery) {
      setAgentError('Please enter a query');
      return;
    }

    setAgentLoading(true);
    setAgentError('');
    setAgentResponse('');

    try {
      const payload = {
        query: agentQuery,
        project_id: agentProjectId || null,
        task_id: null,
        agent_type: agentType,
      };

      const response = await axios.post(`${API_URL}/agents/query`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAgentResponse(response.data.result);
    } catch (err: any) {
      console.error('❌ Agent Error:', err);
      setAgentError(err.response?.data?.detail || 'Failed to get AI response');
    } finally {
      setAgentLoading(false);
    }
  };

  // ============================================================
  // 🆕 HANDLE EDIT & DELETE USER
  // ============================================================
  const handleEditUser = (user: User) => {
    setEditUserId(user.id);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role);
    setEditUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editUserId || !editUserName || !editUserEmail || !editUserRole) {
      setError('Please fill all fields');
      return;
    }

    setEditUserLoading(true);
    try {
      const payload = {
        name: editUserName,
        email: editUserEmail,
        role: editUserRole,
      };

      await axios.put(`${API_URL}/users/${editUserId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditUserDialogOpen(false);
      fetchData();
    } catch (err: any) {
      setError('Failed to update user');
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleDeleteUser = (userId: number) => {
    setDeleteUserId(userId);
    setDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    setDeleteUserLoading(true);
    try {
      await axios.delete(`${API_URL}/users/${deleteUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteUserDialogOpen(false);
      fetchData();
    } catch (err: any) {
      setError('Failed to delete user');
    } finally {
      setDeleteUserLoading(false);
    }
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : `Project ${projectId}`;
  };

  const getUserName = (userId: number | null) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  const totalUsers = users.length;
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const now = new Date();
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done');

  const workloadData = users.map(u => ({
    name: u.name,
    value: tasks.filter(t => t.assigned_to === u.id).length,
  })).filter(d => d.value > 0);

  const resourceData = users.map(u => {
    const userTasks = tasks.filter(t => t.assigned_to === u.id);
    const total = userTasks.length;
    const done = userTasks.filter(t => t.status === 'done').length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { ...u, total, done, rate };
  });

  const sprintData = projects.map(p => {
    const projectTasks = tasks.filter(t => t.project_id === p.id);
    const done = projectTasks.filter(t => t.status === 'done').length;
    const total = projectTasks.length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    const probability = rate >= 70 ? 'High' : rate >= 40 ? 'Medium' : 'Low';
    return { ...p, rate, probability, total, done };
  });

  const inactiveProjects = projects.filter(p => {
    const lastActivity = tasks.filter(t => t.project_id === p.id).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]?.created_at;
    if (!lastActivity) return false;
    const days = Math.floor((new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    return days > 7;
  });

  const COLORS = ['#6366f1', '#8b5cf6', '#22d3ee', '#f472b6', '#f59e0b', '#22c55e', '#ef4444'];

  const stats = [
    { label: 'Students', value: totalUsers, icon: PeopleIcon, color: '#6366f1' },
    { label: 'Projects', value: totalProjects, icon: FolderIcon, color: '#8b5cf6' },
    { label: 'Tasks', value: totalTasks, icon: TaskIcon, color: '#22d3ee' },
    { label: 'Completion', value: `${completionRate}%`, icon: CheckCircleIcon, color: '#22c55e' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        bgcolor: (theme) => theme.palette.background.default,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        transition: 'background-color 0.3s ease',
        animation: 'fadeIn 0.6s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      }}>
        <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto', p: 4 }}>
          
          {/* Header with Light/Dark Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: (theme) => theme.palette.text.primary, transition: 'color 0.3s ease' }}>
              ADMIN DASHBOARD
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} sx={{ color: (theme) => theme.palette.text.primary }}>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton sx={{ color: (theme) => theme.palette.primary.main }} onClick={fetchData}>
                <RefreshIcon />
              </IconButton>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={() => { localStorage.clear(); navigate('/login'); }}
                sx={{ color: '#ef4444', borderColor: '#ef4444', borderRadius: 2, '&:hover': { borderColor: '#ef4444', bgcolor: '#ef444420' } }}
              >
                Logout
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card sx={{
                    bgcolor: (theme) => theme.palette.background.paper,
                    borderRadius: 3,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', borderColor: stat.color, boxShadow: `0 8px 32px ${stat.color}20` }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography sx={{ color: (theme) => theme.palette.text.secondary, fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</Typography>
                          <Typography sx={{ color: (theme) => theme.palette.text.primary, fontSize: '2rem', fontWeight: 700, mt: 0.5 }}>{stat.value}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${stat.color}20` }}>
                          <Icon sx={{ color: stat.color, fontSize: 28 }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Tabs */}
          <Box sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              sx={{
                '& .MuiTab-root': { color: (theme) => theme.palette.text.secondary, fontWeight: 500, textTransform: 'none', fontSize: '0.9rem' },
                '& .Mui-selected': { color: '#6366f1' },
                '& .MuiTabs-indicator': { bgcolor: '#6366f1' },
              }}
            >
              <Tab label="📊 Dashboard" />
              <Tab label="📋 Assign Task" />
              <Tab label="📁 Projects" />
              <Tab label={`👥 Students (${totalUsers})`} />
              <Tab label="📈 Reports" />
              <Tab label="➕ Register User" />
              <Tab label="🤖 AI Agents" />
            </Tabs>
          </Box>

          {/* ============================================================
              TAB 0: DASHBOARD (2 Rows / 3 Columns)
          ============================================================ */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, height: '100%' }}>
                  <CardContent>
                    <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, mb: 2 }}>📊 Project Health</Typography>
                    {projects.map(p => {
                      const projectTasks = tasks.filter(t => t.project_id === p.id);
                      const done = projectTasks.filter(t => t.status === 'done').length;
                      const total = projectTasks.length;
                      const rate = total > 0 ? Math.round((done / total) * 100) : 0;
                      return (
                        <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                          <Typography sx={{ color: (theme) => theme.palette.text.primary, fontSize: '0.9rem' }}>{p.name}</Typography>
                          <Chip label={`${rate}% (${done}/${total})`} size="small" sx={{
                            bgcolor: rate >= 70 ? '#22c55e20' : rate >= 40 ? '#f59e0b20' : '#ef444420',
                            color: rate >= 70 ? '#22c55e' : rate >= 40 ? '#f59e0b' : '#ef4444',
                            fontWeight: 500,
                          }} />
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, height: '100%' }}>
                  <CardContent>
                    <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, mb: 2 }}>⚠️ Blocked Tasks</Typography>
                    {blockedTasks > 0 ? (
                      tasks.filter(t => t.status === 'blocked').map(t => (
                        <Box key={t.id} sx={{ py: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                          <Typography sx={{ color: '#ef4444', fontSize: '0.9rem' }}>🚫 {t.title}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', height: 40 }}>
                        <Typography sx={{ color: '#22c55e' }}>✅ No blocked tasks</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, height: '100%' }}>
                  <CardContent>
                    <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, mb: 2 }}>
                      📈 Delay Prediction <Chip label={`${overdueTasks.length} Overdue`} size="small" sx={{ bgcolor: '#ef444420', color: '#ef4444', ml: 1 }} />
                    </Typography>
                    {overdueTasks.length === 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', height: 40 }}>
                        <Typography sx={{ color: '#22c55e' }}>✅ No overdue tasks. All on track.</Typography>
                      </Box>
                    ) : (
                      overdueTasks.map(t => (
                        <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                          <Box>
                            <Typography sx={{ color: (theme) => theme.palette.text.primary, fontSize: '0.9rem' }}>{t.title}</Typography>
                            <Typography variant="caption" sx={{ color: (theme) => theme.palette.text.secondary }}>Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'}</Typography>
                          </Box>
                          <Chip label="🔴 Overdue" size="small" sx={{ bgcolor: '#ef444420', color: '#ef4444' }} />
                        </Box>
                      ))
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, height: '100%' }}>
                  <CardContent>
                    <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, mb: 2 }}>📊 Workload Distribution</Typography>
                    {workloadData.length === 0 ? (
                      <Typography sx={{ color: (theme) => theme.palette.text.secondary }}>No tasks assigned yet.</Typography>
                    ) : (
                      <Box sx={{ width: '100%', height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={workloadData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label>
                              {workloadData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ReTooltip />
                            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, height: '100%' }}>
                  <CardContent>
                    <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, mb: 2 }}>👥 Resource Utilization</Typography>
                    {resourceData.map(u => {
                      const total = u.total;
                      const rate = u.rate;
                      return (
                        <Box key={u.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 20, height: 20, bgcolor: '#6366f1', fontSize: '0.6rem' }}>
                              {u.name.charAt(0)}
                            </Avatar>
                            <Typography sx={{ color: (theme) => theme.palette.text.primary, fontSize: '0.9rem' }}>{u.name}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography sx={{ color: (theme) => theme.palette.text.secondary, fontSize: '0.85rem' }}>{total} tasks</Typography>
                            <Box sx={{ width: 50, height: 4, bgcolor: (theme) => theme.palette.divider, borderRadius: 2 }}>
                              <Box sx={{ width: `${rate}%`, height: 4, bgcolor: rate >= 70 ? '#22c55e' : rate >= 40 ? '#f59e0b' : '#ef4444', borderRadius: 2 }} />
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, height: '100%' }}>
                  <CardContent>
                    <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, mb: 2 }}>🎯 Sprint Completion</Typography>
                    {sprintData.length === 0 ? (
                      <Typography sx={{ color: (theme) => theme.palette.text.secondary }}>No projects found.</Typography>
                    ) : (
                      sprintData.map(p => (
                        <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                          <Typography sx={{ color: (theme) => theme.palette.text.primary, fontSize: '0.9rem' }}>{p.name}</Typography>
                          <Chip label={`${p.probability} (${p.rate}%)`} size="small" sx={{
                            bgcolor: p.probability === 'High' ? '#22c55e20' : p.probability === 'Medium' ? '#f59e0b20' : '#ef444420',
                            color: p.probability === 'High' ? '#22c55e' : p.probability === 'Medium' ? '#f59e0b' : '#ef4444',
                          }} />
                        </Box>
                      ))
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* ============================================================
              TAB 1: ASSIGN TASK (FIXED DROPDOWNS & DATE)
          ============================================================ */}
          {activeTab === 1 && (
            <Box>
              <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, mb: 4 }}>
                <CardContent>
                  <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, fontSize: '1.1rem', mb: 3 }}>
                    📋 Assign New Task
                  </Typography>
                  <form onSubmit={handleAssignTask}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          placeholder="Enter Task Title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          sx={{
                            input: { color: (theme) => theme.palette.text.primary },
                            '& .MuiOutlinedInput-root': {
                              bgcolor: (theme) => theme.palette.background.default,
                              borderRadius: 2,
                              '& fieldset': { borderColor: (theme) => theme.palette.divider },
                              '&:hover fieldset': { borderColor: '#6366f1' },
                            },
                          }}
                          required
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: (theme) => theme.palette.text.secondary }}>Select Project</InputLabel>
                          <Select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            sx={{
                              color: (theme) => theme.palette.text.primary,
                              bgcolor: (theme) => theme.palette.background.default,
                              borderRadius: 2,
                              minWidth: 180,
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.divider },
                            }}
                            required
                          >
                            <MenuItem value="">Select Project</MenuItem>
                            {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: (theme) => theme.palette.text.secondary }}>Assign To</InputLabel>
                          <Select
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            sx={{
                              color: (theme) => theme.palette.text.primary,
                              bgcolor: (theme) => theme.palette.background.default,
                              borderRadius: 2,
                              minWidth: 180,
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.divider },
                            }}
                            required
                          >
                            <MenuItem value="">Assign To</MenuItem>
                            {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: (theme) => theme.palette.text.secondary }}>Status</InputLabel>
                          <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            sx={{
                              color: (theme) => theme.palette.text.primary,
                              bgcolor: (theme) => theme.palette.background.default,
                              borderRadius: 2,
                              minWidth: 180,
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.divider },
                            }}
                          >
                            <MenuItem value="todo">📝 Todo</MenuItem>
                            <MenuItem value="in_progress">🔄 In Progress</MenuItem>
                            <MenuItem value="done">✅ Done</MenuItem>
                            <MenuItem value="blocked">🚫 Blocked</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Start Date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          sx={{
                            input: { color: (theme) => theme.palette.text.primary },
                            minWidth: 200,
                            '& label': { 
                              color: (theme) => theme.palette.text.secondary, 
                              backgroundColor: (theme) => theme.palette.background.paper, 
                              px: 0.5, 
                              zIndex: 1 
                            },
                            '& .MuiOutlinedInput-root': {
                              bgcolor: (theme) => theme.palette.background.default,
                              borderRadius: 2,
                              '& fieldset': { borderColor: (theme) => theme.palette.divider },
                              '&:hover fieldset': { borderColor: '#6366f1' },
                            },
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Due Date (Deadline)"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          sx={{
                            input: { color: (theme) => theme.palette.text.primary },
                            minWidth: 200,
                            '& label': { 
                              color: (theme) => theme.palette.text.secondary, 
                              backgroundColor: (theme) => theme.palette.background.paper, 
                              px: 0.5, 
                              zIndex: 1 
                            },
                            '& .MuiOutlinedInput-root': {
                              bgcolor: (theme) => theme.palette.background.default,
                              borderRadius: 2,
                              '& fieldset': { borderColor: (theme) => theme.palette.divider },
                              '&:hover fieldset': { borderColor: '#ef4444' },
                            },
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          disabled={loading}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
                          }}
                        >
                          {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : '📤 Assign Task'}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>

              <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, fontSize: '1.1rem' }}>
                      📋 All Tasks ({tasks.length})
                    </Typography>
                    <Chip label={`${doneTasks} Done · ${blockedTasks} Blocked`} sx={{ bgcolor: '#6366f120', color: (theme) => theme.palette.text.secondary }} />
                  </Box>
                  {tasks.length === 0 ? (
                    <Typography sx={{ color: (theme) => theme.palette.text.secondary, textAlign: 'center', py: 4 }}>No tasks created yet.</Typography>
                  ) : (
                    <TableContainer component={Paper} sx={{ bgcolor: (theme) => theme.palette.background.default, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: (theme) => theme.palette.background.paper }}>
                            <TableCell sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 600 }}>#</TableCell>
                            <TableCell sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 600 }}>Task Title</TableCell>
                            <TableCell sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 600 }}>Project</TableCell>
                            <TableCell sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 600 }}>Assigned To</TableCell>
                            <TableCell sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 600 }}>Start Date</TableCell>
                            <TableCell sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 600 }}>Due Date</TableCell>
                            <TableCell sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 600 }} align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tasks.map((task, index) => (
                            <TableRow key={task.id} sx={{ '&:hover': { bgcolor: 'rgba(99,102,241,0.05)' } }}>
                              <TableCell sx={{ color: (theme) => theme.palette.text.secondary }}>{index + 1}</TableCell>
                              <TableCell sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 500 }}>{task.title}</TableCell>
                              <TableCell sx={{ color: (theme) => theme.palette.text.primary }}>{getProjectName(task.project_id)}</TableCell>
                              <TableCell sx={{ color: (theme) => theme.palette.text.primary }}>{getUserName(task.assigned_to)}</TableCell>
                              <TableCell>
                                <Chip label={task.status} size="small" sx={{
                                  bgcolor: task.status === 'done' ? '#22c55e20' : task.status === 'blocked' ? '#ef444420' : task.status === 'in_progress' ? '#3b82f620' : '#f59e0b20',
                                  color: task.status === 'done' ? '#22c55e' : task.status === 'blocked' ? '#ef4444' : task.status === 'in_progress' ? '#3b82f6' : '#f59e0b',
                                  fontWeight: 500,
                                }} />
                              </TableCell>
                              <TableCell sx={{ color: (theme) => theme.palette.text.secondary }}>
                                {task.start_date ? new Date(task.start_date).toLocaleDateString() : '-'}
                              </TableCell>
                              <TableCell sx={{ color: (theme) => theme.palette.text.secondary }}>
                                {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Edit Task">
                                  <IconButton size="small" sx={{ color: '#6366f1', mr: 1 }} onClick={() => handleEditTask(task)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Task">
                                  <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => handleDeleteTask(task.id)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}

          {/* ============================================================
              TAB 2: PROJECTS (Dynamic Theme Colors Applied)
          ============================================================ */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, fontSize: '1.1rem', mb: 3 }}>📁 Create New Project</Typography>
                    {projSuccess && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>✅ Project created successfully!</Alert>}
                    {projError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{projError}</Alert>}
                    <form onSubmit={handleCreateProject}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField fullWidth placeholder="Project Name *" value={projName} onChange={(e) => setProjName(e.target.value)} sx={{ input: { color: (theme) => theme.palette.text.primary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2, '& fieldset': { borderColor: (theme) => theme.palette.divider }, '&:hover fieldset': { borderColor: '#6366f1' } } }} required />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth multiline rows={3} placeholder="Project Description" value={projDesc} onChange={(e) => setProjDesc(e.target.value)} sx={{ textarea: { color: (theme) => theme.palette.text.primary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2, '& fieldset': { borderColor: (theme) => theme.palette.divider }, '&:hover fieldset': { borderColor: '#6366f1' } } }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: (theme) => theme.palette.text.secondary }}>Status</InputLabel>
                            <Select value={projStatus} onChange={(e) => setProjStatus(e.target.value)} sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.default, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.divider } }}>
                              <MenuItem value="active">✅ Active</MenuItem>
                              <MenuItem value="completed">🎯 Completed</MenuItem>
                              <MenuItem value="on_hold">⏸️ On Hold</MenuItem>
                              <MenuItem value="cancelled">❌ Cancelled</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField fullWidth type="date" placeholder="End Date" value={projEndDate} onChange={(e) => setProjEndDate(e.target.value)} sx={{ input: { color: (theme) => theme.palette.text.primary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2, '& fieldset': { borderColor: (theme) => theme.palette.divider }, '&:hover fieldset': { borderColor: '#6366f1' } } }} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12}>
                          <Button type="submit" variant="contained" fullWidth disabled={projLoading} sx={{ py: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #22c55e, #16a34a)', fontWeight: 600, textTransform: 'none', fontSize: '1rem', '&:hover': { background: 'linear-gradient(135deg, #16a34a, #15803d)' } }}>
                            {projLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : '📁 Create Project'}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={7}>
                <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600 }}>📋 All Projects ({projects.length})</Typography>
                      <Chip label={`${projects.filter(p => p.status === 'active').length} Active`} sx={{ bgcolor: '#22c55e20', color: '#22c55e' }} />
                    </Box>
                    {projects.length === 0 ? (
                      <Typography sx={{ color: (theme) => theme.palette.text.secondary, textAlign: 'center', py: 4 }}>No projects yet.</Typography>
                    ) : (
                      projects.map(p => {
                        const projectTasks = tasks.filter(t => t.project_id === p.id);
                        const done = projectTasks.filter(t => t.status === 'done').length;
                        const total = projectTasks.length;
                        const rate = total > 0 ? Math.round((done / total) * 100) : 0;
                        return (
                          <Box key={p.id} sx={{ p: 2, mb: 2, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: (theme) => theme.palette.background.default, transition: 'all 0.3s ease', '&:hover': { borderColor: '#6366f1', boxShadow: '0 4px 16px rgba(99,102,241,0.1)' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600 }}>{p.name}</Typography>
                                <Typography sx={{ color: (theme) => theme.palette.text.secondary, fontSize: '0.85rem', mt: 0.5 }}>{p.description || 'No description'}</Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                  <Chip label={`📅 ${new Date(p.start_date).toLocaleDateString()}`} size="small" sx={{ bgcolor: '#6366f120', color: (theme) => theme.palette.text.secondary }} />
                                  {p.end_date && <Chip label={`📌 ${new Date(p.end_date).toLocaleDateString()}`} size="small" sx={{ bgcolor: '#f59e0b20', color: '#f59e0b' }} />}
                                  <Chip label={`${rate}% complete (${done}/${total} tasks)`} size="small" sx={{
                                    bgcolor: rate >= 70 ? '#22c55e20' : rate >= 40 ? '#f59e0b20' : '#ef444420',
                                    color: rate >= 70 ? '#22c55e' : rate >= 40 ? '#f59e0b' : '#ef4444',
                                  }} />
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip label={p.status} sx={{
                                  bgcolor: p.status === 'active' ? '#22c55e20' : p.status === 'completed' ? '#6366f120' : p.status === 'on_hold' ? '#f59e0b20' : '#ef444420',
                                  color: p.status === 'active' ? '#22c55e' : p.status === 'completed' ? '#6366f1' : p.status === 'on_hold' ? '#f59e0b' : '#ef4444',
                                  fontWeight: 500,
                                }} />
                                <Tooltip title="Edit Project">
                                  <IconButton size="small" sx={{ color: '#6366f1' }} onClick={() => handleEditProject(p)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Project">
                                  <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => handleDeleteProject(p.id)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* ============================================================
              TAB 3: STUDENTS (✅ UPDATED: ADDED EDIT & DELETE ICONS)
          ============================================================ */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, mb: 2 }}>👥 Registered Students ({totalUsers})</Typography>
                    <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                      {users.map(u => (
                        <ListItemButton 
                          key={u.id} 
                          sx={{ 
                            borderRadius: 2, 
                            mb: 0.5, 
                            display: 'flex',
                            justifyContent: 'space-between',
                            bgcolor: selectedUser === u.id ? 'rgba(99,102,241,0.15)' : 'transparent', 
                            border: selectedUser === u.id ? '1px solid #6366f1' : (theme) => `1px solid transparent`, 
                            '&:hover': { bgcolor: 'rgba(99,102,241,0.05)' } 
                          }}
                        >
                          {/* Left: Click karein to User Tasks dikhega */}
                          <Box 
                            sx={{ display: 'flex', flex: 1, alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => fetchUserTasks(u.id)}
                          >
                            <ListItemAvatar><Avatar sx={{ bgcolor: '#6366f1' }}>{u.name.charAt(0)}</Avatar></ListItemAvatar>
                            <ListItemText 
                              primary={<Typography sx={{ color: (theme) => theme.palette.text.primary }}>{u.name}</Typography>} 
                              secondary={<Typography sx={{ color: (theme) => theme.palette.text.secondary, fontSize: '0.8rem' }}>{u.email}</Typography>} 
                            />
                          </Box>

                          {/* Right: Edit aur Delete Buttons */}
                          <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                            <Tooltip title="Edit User">
                              <IconButton 
                                size="small" 
                                sx={{ color: '#6366f1' }} 
                                onClick={(e) => { e.stopPropagation(); handleEditUser(u); }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete User">
                              <IconButton 
                                size="small" 
                                sx={{ color: '#ef4444' }} 
                                onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id); }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItemButton>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    {selectedUser ? (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600 }}>📋 {userTasks?.user_name}'s Tasks</Typography>
                          <Chip label={`Total: ${userTasks?.total_tasks || 0}`} sx={{ bgcolor: '#6366f120', color: '#6366f1' }} />
                        </Box>
                        {userTasks?.tasks.length === 0 ? (
                          <Typography sx={{ color: (theme) => theme.palette.text.secondary }}>No tasks assigned yet.</Typography>
                        ) : (
                          userTasks?.tasks.map(t => (
                            <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                              <Typography sx={{ color: (theme) => theme.palette.text.primary }}>{t.title}</Typography>
                              <Chip label={t.status} size="small" sx={{
                                bgcolor: t.status === 'done' ? '#22c55e20' : t.status === 'blocked' ? '#ef444420' : '#f59e0b20',
                                color: t.status === 'done' ? '#22c55e' : t.status === 'blocked' ? '#ef4444' : '#f59e0b',
                                fontWeight: 500,
                              }} />
                            </Box>
                          ))
                        )}
                      </>
                    ) : (
                      <Typography sx={{ color: (theme) => theme.palette.text.secondary, textAlign: 'center', py: 4 }}>👆 Click a student to see their tasks</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* ============================================================
              TAB 4: REPORTS (Dynamic Theme Colors Applied)
          ============================================================ */}
          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, mb: 2 }}>📈 Sprint Progress</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}><Typography sx={{ color: (theme) => theme.palette.text.secondary }}>Total Tasks</Typography><Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600 }}>{totalTasks}</Typography></Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}><Typography sx={{ color: '#22c55e' }}>✅ Done</Typography><Typography sx={{ color: '#22c55e', fontWeight: 600 }}>{doneTasks}</Typography></Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}><Typography sx={{ color: '#ef4444' }}>🚫 Blocked</Typography><Typography sx={{ color: '#ef4444', fontWeight: 600 }}>{blockedTasks}</Typography></Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}><Typography sx={{ color: (theme) => theme.palette.text.secondary }}>Completion</Typography><Typography sx={{ color: '#22c55e', fontWeight: 700, fontSize: '1.2rem' }}>{completionRate}%</Typography></Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, mb: 2 }}>📊 Workload Distribution</Typography>
                    {users.map(u => {
                      const userTaskCount = tasks.filter(t => t.assigned_to === u.id).length;
                      const percentage = totalTasks > 0 ? Math.round((userTaskCount / totalTasks) * 100) : 0;
                      return (
                        <Box key={u.id} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography sx={{ color: (theme) => theme.palette.text.primary }}>{u.name}</Typography><Typography sx={{ color: (theme) => theme.palette.text.secondary }}>{userTaskCount} tasks ({percentage}%)</Typography></Box>
                          <Box sx={{ width: '100%', height: 6, bgcolor: (theme) => theme.palette.divider, borderRadius: 3 }}><Box sx={{ width: `${percentage}%`, height: 6, bgcolor: '#6366f1', borderRadius: 3, transition: 'width 0.5s ease' }} /></Box>
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* ============================================================
              TAB 5: REGISTER USER (Dynamic Theme Colors Applied)
          ============================================================ */}
          {activeTab === 5 && (
            <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, fontSize: '1.1rem', mb: 3 }}>➕ Register New User (Admin Only)</Typography>
                {regSuccess && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>✅ User registered successfully!</Alert>}
                {regError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{regError}</Alert>}
                <form onSubmit={handleRegisterUser}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth placeholder="Full Name" value={regName} onChange={(e) => setRegName(e.target.value)} sx={{ input: { color: (theme) => theme.palette.text.primary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2, '& fieldset': { borderColor: (theme) => theme.palette.divider }, '&:hover fieldset': { borderColor: '#6366f1' } } }} required />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth type="email" placeholder="Email Address" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} sx={{ input: { color: (theme) => theme.palette.text.primary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2, '& fieldset': { borderColor: (theme) => theme.palette.divider }, '&:hover fieldset': { borderColor: '#6366f1' } } }} required />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} sx={{ input: { color: (theme) => theme.palette.text.primary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2, '& fieldset': { borderColor: (theme) => theme.palette.divider }, '&:hover fieldset': { borderColor: '#6366f1' } } }} required />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: (theme) => theme.palette.text.secondary }}>Role</InputLabel>
                        <Select value={regRole} onChange={(e) => setRegRole(e.target.value)} sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.default, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.divider } }}>
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="manager">Manager</MenuItem>
                          <MenuItem value="engineer">Engineer</MenuItem>
                          <MenuItem value="designer">Designer</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" fullWidth disabled={regLoading} sx={{ py: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #22c55e, #16a34a)', fontWeight: 600, textTransform: 'none', fontSize: '1rem', '&:hover': { background: 'linear-gradient(135deg, #16a34a, #15803d)' } }}>
                        {regLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : '➕ Register User'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          )}

          {/* ============================================================
              TAB 6: AI AGENTS (Dynamic Theme Colors Applied)
          ============================================================ */}
          {activeTab === 6 && (
            <Box>
              <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, fontSize: '1.2rem', mb: 3 }}>
                🤖 AI Agents (Powered by Groq LLaMA)
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                    <CardContent>
                      <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600, mb: 2 }}>
                        📝 Ask AI Assistant
                      </Typography>

                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel sx={{ color: (theme) => theme.palette.text.secondary }}>Select Agent</InputLabel>
                        <Select
                          value={agentType}
                          onChange={(e) => setAgentType(e.target.value)}
                          sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.default, borderRadius: 2 }}
                        >
                          <MenuItem value="risk">🔍 Risk Analysis</MenuItem>
                          <MenuItem value="planning">📅 Sprint Planning</MenuItem>
                          <MenuItem value="db">🗄️ Database Query</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        placeholder="Ask about your projects..."
                        value={agentQuery}
                        onChange={(e) => setAgentQuery(e.target.value)}
                        multiline
                        rows={4}
                        sx={{
                          mb: 2,
                          textarea: { color: (theme) => theme.palette.text.primary },
                          '& .MuiOutlinedInput-root': {
                            bgcolor: (theme) => theme.palette.background.default,
                            borderRadius: 2,
                            '& fieldset': { borderColor: (theme) => theme.palette.divider },
                            '&:hover fieldset': { borderColor: '#6366f1' },
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        type="number"
                        label="Project ID (optional)"
                        value={agentProjectId}
                        onChange={(e) => setAgentProjectId(Number(e.target.value))}
                        sx={{
                          mb: 2,
                          input: { color: (theme) => theme.palette.text.primary },
                          '& label': { color: (theme) => theme.palette.text.secondary },
                          '& .MuiOutlinedInput-root': {
                            bgcolor: (theme) => theme.palette.background.default,
                            borderRadius: 2,
                            '& fieldset': { borderColor: (theme) => theme.palette.divider },
                          },
                        }}
                      />

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleAgentQuery}
                        disabled={agentLoading || !agentQuery}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '1rem',
                          '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
                        }}
                      >
                        {agentLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : '🤖 Ask AI'}
                      </Button>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" sx={{ color: (theme) => theme.palette.text.secondary }}>
                          💡 Examples:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          <Chip
                            label="Check risk for project 1"
                            size="small"
                            onClick={() => {
                              setAgentQuery('Check risk for project 1');
                              setAgentProjectId(1);
                              setAgentType('risk');
                            }}
                            sx={{ bgcolor: '#6366f120', color: (theme) => theme.palette.text.secondary, cursor: 'pointer' }}
                          />
                          <Chip
                            label="Plan next sprint for project 1"
                            size="small"
                            onClick={() => {
                              setAgentQuery('Plan next sprint for project 1');
                              setAgentProjectId(1);
                              setAgentType('planning');
                            }}
                            sx={{ bgcolor: '#6366f120', color: (theme) => theme.palette.text.secondary, cursor: 'pointer' }}
                          />
                          <Chip
                            label="Ahmed ko kitne tasks assign hain?"
                            size="small"
                            onClick={() => {
                              setAgentQuery('Ahmed ko kitne tasks assign hain?');
                              setAgentProjectId(1);
                              setAgentType('db');
                            }}
                            sx={{ bgcolor: '#6366f120', color: (theme) => theme.palette.text.secondary, cursor: 'pointer' }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: (theme) => theme.palette.background.paper, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600 }}>
                          📬 AI Response
                        </Typography>
                        {agentLoading && (
                          <Chip label="Thinking..." size="small" sx={{ bgcolor: '#f59e0b20', color: '#f59e0b' }} />
                        )}
                      </Box>

                      {agentResponse ? (
                        <Box
                          sx={{
                            bgcolor: (theme) => theme.palette.background.default,
                            borderRadius: 2,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            p: 3,
                            minHeight: 200,
                            maxHeight: 400,
                            overflow: 'auto',
                          }}
                        >
                          <Typography
                            sx={{
                              color: (theme) => theme.palette.text.primary,
                              whiteSpace: 'pre-wrap',
                              fontSize: '0.95rem',
                              lineHeight: 1.7,
                            }}
                          >
                            {agentResponse}
                          </Typography>
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Chip
                              label={`Agent: ${agentType}`}
                              size="small"
                              sx={{ bgcolor: '#6366f120', color: (theme) => theme.palette.text.secondary }}
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            bgcolor: (theme) => theme.palette.background.default,
                            borderRadius: 2,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            p: 3,
                            minHeight: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography sx={{ color: (theme) => theme.palette.text.secondary, textAlign: 'center' }}>
                            🤖 Ask the AI Assistant a question about your projects.
                            <br />
                            <span style={{ fontSize: '0.85rem' }}>
                              Try: "Check risk for project 1"
                            </span>
                          </Typography>
                        </Box>
                      )}

                      {agentError && (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                          {agentError}
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ============================================================
              DIALOGS (EXISTING)
          ============================================================ */}
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.paper }}>✏️ Edit Task</DialogTitle>
            <DialogContent sx={{ bgcolor: (theme) => theme.palette.background.paper }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField fullWidth label="Task Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} sx={{ input: { color: (theme) => theme.palette.text.primary }, label: { color: (theme) => theme.palette.text.secondary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2, '& fieldset': { borderColor: (theme) => theme.palette.divider } } }} />
                <FormControl fullWidth>
                  <InputLabel sx={{ color: (theme) => theme.palette.text.secondary }}>Project</InputLabel>
                  <Select value={editProjectId} onChange={(e) => setEditProjectId(e.target.value)} sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.default, borderRadius: 2 }}>
                    {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: (theme) => theme.palette.text.secondary }}>Assign To</InputLabel>
                  <Select value={editAssigneeId} onChange={(e) => setEditAssigneeId(e.target.value)} sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.default, borderRadius: 2 }}>
                    {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: (theme) => theme.palette.text.secondary }}>Status</InputLabel>
                  <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.default, borderRadius: 2 }}>
                    <MenuItem value="todo">📝 Todo</MenuItem>
                    <MenuItem value="in_progress">🔄 In Progress</MenuItem>
                    <MenuItem value="done">✅ Done</MenuItem>
                    <MenuItem value="blocked">🚫 Blocked</MenuItem>
                  </Select>
                </FormControl>
                <TextField fullWidth type="date" label="Start Date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} sx={{ input: { color: (theme) => theme.palette.text.primary }, label: { color: (theme) => theme.palette.text.secondary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2 } }} InputLabelProps={{ shrink: true }} />
                <TextField fullWidth type="date" label="Due Date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} sx={{ input: { color: (theme) => theme.palette.text.primary }, label: { color: (theme) => theme.palette.text.secondary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2 } }} InputLabelProps={{ shrink: true }} />
              </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: (theme) => theme.palette.background.paper, p: 2 }}>
              <Button onClick={() => setEditDialogOpen(false)} sx={{ color: (theme) => theme.palette.text.secondary }}>Cancel</Button>
              <Button onClick={handleUpdateTask} variant="contained" disabled={editLoading} sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontWeight: 600 }}>
                {editLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Update Task'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.paper }}>🗑️ Confirm Delete Task</DialogTitle>
            <DialogContent sx={{ bgcolor: (theme) => theme.palette.background.paper }}>
              <Typography sx={{ color: (theme) => theme.palette.text.secondary }}>Are you sure you want to delete this task? This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions sx={{ bgcolor: (theme) => theme.palette.background.paper, p: 2 }}>
              <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: (theme) => theme.palette.text.secondary }}>Cancel</Button>
              <Button onClick={confirmDeleteTask} variant="contained" disabled={deleteLoading} sx={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', fontWeight: 600 }}>
                {deleteLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={editProjectDialogOpen} onClose={() => setEditProjectDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.paper }}>✏️ Edit Project</DialogTitle>
            <DialogContent sx={{ bgcolor: (theme) => theme.palette.background.paper }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField fullWidth label="Project Name" value={editProjName} onChange={(e) => setEditProjName(e.target.value)} sx={{ input: { color: (theme) => theme.palette.text.primary }, label: { color: (theme) => theme.palette.text.secondary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2, '& fieldset': { borderColor: (theme) => theme.palette.divider } } }} />
                <TextField fullWidth multiline rows={3} label="Description" value={editProjDesc} onChange={(e) => setEditProjDesc(e.target.value)} sx={{ textarea: { color: (theme) => theme.palette.text.primary }, label: { color: (theme) => theme.palette.text.secondary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2 } }} />
                <FormControl fullWidth>
                  <InputLabel sx={{ color: (theme) => theme.palette.text.secondary }}>Status</InputLabel>
                  <Select value={editProjStatus} onChange={(e) => setEditProjStatus(e.target.value)} sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.default, borderRadius: 2 }}>
                    <MenuItem value="active">✅ Active</MenuItem>
                    <MenuItem value="completed">🎯 Completed</MenuItem>
                    <MenuItem value="on_hold">⏸️ On Hold</MenuItem>
                    <MenuItem value="cancelled">❌ Cancelled</MenuItem>
                  </Select>
                </FormControl>
                <TextField fullWidth type="date" label="End Date" value={editProjEndDate} onChange={(e) => setEditProjEndDate(e.target.value)} sx={{ input: { color: (theme) => theme.palette.text.primary }, label: { color: (theme) => theme.palette.text.secondary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2 } }} InputLabelProps={{ shrink: true }} />
              </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: (theme) => theme.palette.background.paper, p: 2 }}>
              <Button onClick={() => setEditProjectDialogOpen(false)} sx={{ color: (theme) => theme.palette.text.secondary }}>Cancel</Button>
              <Button onClick={handleUpdateProject} variant="contained" disabled={editProjLoading} sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontWeight: 600 }}>
                {editProjLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Update Project'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={deleteProjectDialogOpen} onClose={() => setDeleteProjectDialogOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.paper }}>🗑️ Confirm Delete Project</DialogTitle>
            <DialogContent sx={{ bgcolor: (theme) => theme.palette.background.paper }}>
              <Typography sx={{ color: (theme) => theme.palette.text.secondary }}>Are you sure you want to delete this project? This will also delete all associated tasks. This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions sx={{ bgcolor: (theme) => theme.palette.background.paper, p: 2 }}>
              <Button onClick={() => setDeleteProjectDialogOpen(false)} sx={{ color: (theme) => theme.palette.text.secondary }}>Cancel</Button>
              <Button onClick={confirmDeleteProject} variant="contained" disabled={deleteProjLoading} sx={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', fontWeight: 600 }}>
                {deleteProjLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Delete Project'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* ============================================================
              🆕 NEW DIALOGS: EDIT & DELETE USER
          ============================================================ */}
          <Dialog open={editUserDialogOpen} onClose={() => setEditUserDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.paper }}>✏️ Edit User</DialogTitle>
            <DialogContent sx={{ bgcolor: (theme) => theme.palette.background.paper }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField 
                  fullWidth 
                  label="Full Name" 
                  value={editUserName} 
                  onChange={(e) => setEditUserName(e.target.value)} 
                  sx={{ input: { color: (theme) => theme.palette.text.primary }, label: { color: (theme) => theme.palette.text.secondary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2 } }} 
                />
                <TextField 
                  fullWidth 
                  label="Email Address" 
                  value={editUserEmail} 
                  onChange={(e) => setEditUserEmail(e.target.value)} 
                  sx={{ input: { color: (theme) => theme.palette.text.primary }, label: { color: (theme) => theme.palette.text.secondary }, '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.background.default, borderRadius: 2 } }} 
                />
                <FormControl fullWidth>
                  <InputLabel sx={{ color: (theme) => theme.palette.text.secondary }}>Role</InputLabel>
                  <Select 
                    value={editUserRole} 
                    onChange={(e) => setEditUserRole(e.target.value)} 
                    sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.default, borderRadius: 2 }}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="engineer">Engineer</MenuItem>
                    <MenuItem value="designer">Designer</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: (theme) => theme.palette.background.paper, p: 2 }}>
              <Button onClick={() => setEditUserDialogOpen(false)} sx={{ color: (theme) => theme.palette.text.secondary }}>Cancel</Button>
              <Button onClick={handleUpdateUser} variant="contained" disabled={editUserLoading} sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontWeight: 600 }}>
                {editUserLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Update User'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={deleteUserDialogOpen} onClose={() => setDeleteUserDialogOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ color: (theme) => theme.palette.text.primary, bgcolor: (theme) => theme.palette.background.paper }}>🗑️ Confirm Delete User</DialogTitle>
            <DialogContent sx={{ bgcolor: (theme) => theme.palette.background.paper }}>
              <Typography sx={{ color: (theme) => theme.palette.text.secondary }}>Are you sure you want to delete this user? This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions sx={{ bgcolor: (theme) => theme.palette.background.paper, p: 2 }}>
              <Button onClick={() => setDeleteUserDialogOpen(false)} sx={{ color: (theme) => theme.palette.text.secondary }}>Cancel</Button>
              <Button onClick={confirmDeleteUser} variant="contained" disabled={deleteUserLoading} sx={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', fontWeight: 600 }}>
                {deleteUserLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Delete User'}
              </Button>
            </DialogActions>
          </Dialog>

        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default AdminDashboard;