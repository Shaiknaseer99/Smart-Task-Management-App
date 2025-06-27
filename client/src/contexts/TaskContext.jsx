import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  // Get all tasks with filtering and sorting
  const getTasks = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/tasks?${params.toString()}`);
      setTasks(response.data.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch tasks';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get dashboard data
  const getDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/tasks/dashboard');
      setDashboardData(response.data.data);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch dashboard data';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create new task
  const createTask = async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/tasks', taskData);
      setTasks(prev => [response.data.data, ...prev]);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update task
  const updateTask = async (id, taskData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(`/tasks/${id}`, taskData);
      setTasks(prev => prev.map(task => 
        task._id === id ? response.data.data : task
      ));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(task => task._id !== id));
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete task';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Complete task
  const completeTask = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`/tasks/${id}/complete`);
      setTasks(prev => prev.map(task => 
        task._id === id ? response.data.data : task
      ));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to complete task';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cancel task
  const cancelTask = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`/tasks/${id}/cancel`);
      setTasks(prev => prev.map(task => 
        task._id === id ? response.data.data : task
      ));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel task';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add note to task
  const addNote = async (id, content) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`/tasks/${id}/notes`, { content });
      setTasks(prev => prev.map(task => 
        task._id === id ? response.data.data : task
      ));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add note';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Export tasks
  const exportTasks = async (format) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/tasks/export/${format}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', format === 'excel' ? 'tasks.xlsx' : `tasks.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to export tasks';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // AI Features
  const predictCategory = async (previousCategories) => {
    try {
      setError(null);
      const response = await axios.post('/ai/predict-category', { previousCategories });
      return response.data.category;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to predict category';
      setError(message);
      throw error;
    }
  };

  const generateDescription = async (summary) => {
    try {
      setError(null);
      const response = await axios.post('/ai/generate-description', { summary });
      return response.data.description;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate description';
      setError(message);
      throw error;
    }
  };

  const value = {
    tasks,
    dashboardData,
    loading,
    error,
    getTasks,
    getDashboardData,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    cancelTask,
    addNote,
    exportTasks,
    predictCategory,
    generateDescription,
    clearError,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}; 