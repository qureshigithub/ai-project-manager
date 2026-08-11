import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  Task as TaskIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Pending as PendingIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

interface Task {
  id: number;
  title: string;
  status: string;
  project_id: number;
  assigned_to: number;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
}

function UserDashboard() {
  console.log('✅ UserDashboard component loaded!');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const name = localStorage.getItem('name') || 'User';
    setUserName(name);

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
      const tasksRes = await axios.get(`${API_URL}/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasksRes.data);

      const projectsRes = await axios.get(`${API_URL}/projects/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projectsRes.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to load tasks');
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Updated: Status update function (supports all statuses)
  const handleStatusUpdate = async (taskId: number, newStatus: string) => {
    console.log(`📤 Updating task ${taskId} to status: ${newStatus}`);
    setUpdatingTaskId(taskId);
    try {
      const response = await axios.put(
        `${API_URL}/tasks/${taskId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Task updated:', response.data);
      await fetchData();
    } catch (err: any) {
      console.error('❌ Update Error:', err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to update task. Please try again.');
      }
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : `Project ${projectId}`;
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: TaskIcon, color: '#6366f1' },
    { label: 'Done', value: doneTasks, icon: CheckCircleIcon, color: '#22c55e' },
    { label: 'In Progress', value: inProgressTasks, icon: PendingIcon, color: '#f59e0b' },
    { label: 'Blocked', value: blockedTasks, icon: BlockIcon, color: '#ef4444' },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#0e1117', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#6366f1', width: 48, height: 48 }}>
            {userName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff' }}>
              👤 My Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Welcome back, {userName}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton sx={{ color: '#6366f1' }} onClick={fetchData}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              color: '#ef4444',
              borderColor: '#ef4444',
              borderRadius: 2,
              '&:hover': { borderColor: '#ef4444', bgcolor: '#ef444420' },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#6366f1' }} />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card
                    sx={{
                      bgcolor: '#1a1a2e',
                      borderRadius: 3,
                      border: '1px solid #333344',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: stat.color,
                        boxShadow: `0 8px 32px ${stat.color}20`,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                            {stat.label}
                          </Typography>
                          <Typography sx={{ color: '#fff', fontSize: '2rem', fontWeight: 700, mt: 0.5 }}>
                            {stat.value}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: `${stat.color}20`,
                          }}
                        >
                          <Icon sx={{ color: stat.color, fontSize: 28 }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Progress Bar */}
          <Card sx={{ bgcolor: '#1a1a2e', borderRadius: 3, border: '1px solid #333344', mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>Overall Progress</Typography>
                <Typography sx={{ color: '#22c55e', fontWeight: 700, fontSize: '1.2rem' }}>
                  {completionRate}%
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: 8, bgcolor: '#333344', borderRadius: 4 }}>
                <Box
                  sx={{
                    width: `${completionRate}%`,
                    height: 8,
                    bgcolor: '#22c55e',
                    borderRadius: 4,
                    transition: 'width 0.5s ease',
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* ============================================================
              📋 My Assigned Tasks (WITH 3 STATUS BUTTONS)
          ============================================================ */}
          <Card sx={{ bgcolor: '#1a1a2e', borderRadius: 3, border: '1px solid #333344' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>
                  📋 My Assigned Tasks
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`✅ Done: ${doneTasks}`}
                    size="small"
                    sx={{ bgcolor: '#22c55e20', color: '#22c55e', fontWeight: 600, borderRadius: 2 }}
                  />
                  <Chip
                    label={`🔄 In Progress: ${inProgressTasks}`}
                    size="small"
                    sx={{ bgcolor: '#f59e0b20', color: '#f59e0b', fontWeight: 600, borderRadius: 2 }}
                  />
                  <Chip
                    label={`🚫 Blocked: ${blockedTasks}`}
                    size="small"
                    sx={{ bgcolor: '#ef444420', color: '#ef4444', fontWeight: 600, borderRadius: 2 }}
                  />
                  <Chip
                    label={`📊 Total: ${totalTasks}`}
                    size="small"
                    sx={{ bgcolor: '#6366f120', color: '#94a3b8', fontWeight: 600, borderRadius: 2 }}
                  />
                </Box>
              </Box>

              {tasks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography sx={{ color: '#94a3b8' }}>
                    🎉 No tasks assigned yet. Enjoy your free time!
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ bgcolor: '#0e1117', borderRadius: 2, border: '1px solid #333344' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#1a1a2e' }}>
                        <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>#</TableCell>
                        <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Task Title</TableCell>
                        <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Project</TableCell>
                        <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Due Date</TableCell>
                        <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tasks.map((task, index) => {
                        const isDone = task.status === 'done';
                        const isInProgress = task.status === 'in_progress';
                        const isBlocked = task.status === 'blocked';
                        const isUpdating = updatingTaskId === task.id;

                        return (
                          <TableRow key={task.id} sx={{ '&:hover': { bgcolor: 'rgba(99,102,241,0.05)' } }}>
                            <TableCell sx={{ color: '#94a3b8' }}>{index + 1}</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 500 }}>{task.title}</TableCell>
                            <TableCell sx={{ color: '#e2e8f0' }}>{getProjectName(task.project_id)}</TableCell>
                            <TableCell>
                              <Chip
                                label={task.status}
                                size="small"
                                sx={{
                                  bgcolor:
                                    task.status === 'done'
                                      ? '#22c55e20'
                                      : task.status === 'blocked'
                                      ? '#ef444420'
                                      : task.status === 'in_progress'
                                      ? '#3b82f620'
                                      : '#f59e0b20',
                                  color:
                                    task.status === 'done'
                                      ? '#22c55e'
                                      : task.status === 'blocked'
                                      ? '#ef4444'
                                      : task.status === 'in_progress'
                                      ? '#3b82f6'
                                      : '#f59e0b',
                                  fontWeight: 500,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#94a3b8' }}>
                              {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                                {/* 🔥 MARK IN PROGRESS BUTTON */}
                                <Tooltip title="Move to In Progress">
                                  <Button
                                    variant="contained"
                                    size="small"
                                    disabled={isInProgress || isUpdating}
                                    onClick={() => handleStatusUpdate(task.id, 'in_progress')}
                                    sx={{
                                      textTransform: 'none',
                                      borderRadius: 2,
                                      minWidth: 100,
                                      bgcolor: isInProgress ? '#2a2a3a' : '#f59e0b',
                                      color: isInProgress ? '#94a3b8' : '#fff',
                                      border: isInProgress ? '1px solid #333344' : 'none',
                                      '&:hover': {
                                        bgcolor: isInProgress ? '#2a2a3a' : '#d97706',
                                      },
                                      '&:disabled': {
                                        opacity: isInProgress ? 0.7 : 0.4,
                                      },
                                    }}
                                  >
                                    {isUpdating ? (
                                      <CircularProgress size={18} sx={{ color: '#fff' }} />
                                    ) : isInProgress ? (
                                      '🔄 In Progress'
                                    ) : (
                                      '🔄 Progress'
                                    )}
                                  </Button>
                                </Tooltip>

                                {/* 🔥 MARK BLOCKED BUTTON */}
                                <Tooltip title="Mark as Blocked">
                                  <Button
                                    variant="contained"
                                    size="small"
                                    disabled={isBlocked || isUpdating}
                                    onClick={() => handleStatusUpdate(task.id, 'blocked')}
                                    sx={{
                                      textTransform: 'none',
                                      borderRadius: 2,
                                      minWidth: 100,
                                      bgcolor: isBlocked ? '#2a2a3a' : '#ef4444',
                                      color: isBlocked ? '#94a3b8' : '#fff',
                                      border: isBlocked ? '1px solid #333344' : 'none',
                                      '&:hover': {
                                        bgcolor: isBlocked ? '#2a2a3a' : '#dc2626',
                                      },
                                      '&:disabled': {
                                        opacity: isBlocked ? 0.7 : 0.4,
                                      },
                                    }}
                                  >
                                    {isUpdating ? (
                                      <CircularProgress size={18} sx={{ color: '#fff' }} />
                                    ) : isBlocked ? (
                                      '🚫 Blocked'
                                    ) : (
                                      '🚫 Block'
                                    )}
                                  </Button>
                                </Tooltip>

                                {/* 🔥 MARK COMPLETE BUTTON */}
                                <Tooltip title={isDone ? '✅ Completed' : 'Mark as Complete'}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    disabled={isDone || isUpdating}
                                    onClick={() => handleStatusUpdate(task.id, 'done')}
                                    sx={{
                                      textTransform: 'none',
                                      borderRadius: 2,
                                      minWidth: 100,
                                      bgcolor: isDone ? '#2a2a3a' : '#22c55e',
                                      color: isDone ? '#94a3b8' : '#fff',
                                      border: isDone ? '1px solid #333344' : 'none',
                                      '&:hover': {
                                        bgcolor: isDone ? '#2a2a3a' : '#16a34a',
                                      },
                                      '&:disabled': {
                                        opacity: isDone ? 0.7 : 0.4,
                                      },
                                    }}
                                  >
                                    {isUpdating ? (
                                      <CircularProgress size={18} sx={{ color: '#fff' }} />
                                    ) : isDone ? (
                                      '✅ Completed'
                                    ) : (
                                      '✅ Complete'
                                    )}
                                  </Button>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}

export default UserDashboard;