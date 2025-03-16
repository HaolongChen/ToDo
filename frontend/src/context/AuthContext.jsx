import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { set } from 'mongoose';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [todos, setTodos] = useState([]);
  const [allTodos, setAllTodos] = useState([]);
  const [groups, setGroups] = useState([]);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/auth/user');
        setUser(response.data.user);
      } catch (error) {
        console.log('Not authenticated');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/auth/signin', { username, password });
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to sign in");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign-up function
  const signup = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/auth/signup', { username, password });
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to sign up");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post('/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      await axios.post('/api/auth/change-password', { oldPassword, newPassword });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to change password");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const getNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/notification/get-notifications');
      setNotifications(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get notifications");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const sendAssignment = async (assignment) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/notification/send-assignment', assignment);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send assignment");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const sendRequest = async (request) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/notification/send-request', request);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send request");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const acceptRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/notification/accept-request', { requestId });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to accept request");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const deleteWaitlist = async (waitlistId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/notification/delete-waitlist', { waitlistId });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete waitlist");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const rejectRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/notification/reject-request', { requestId });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reject request");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const getRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/notification/get-requests');
      setNotifications(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get requests");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const getAllteammates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/notification/get-teammates');
      setteammates(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get teammates");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const getWaitlists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/notification/get-waitlists');
      setNotifications(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get waitlists");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const getUserInfo = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/notification/get-user-info/${userId}`);
      setProfile(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get user info");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const createTodo = async (todo) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/todo/create', todo);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create todo");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const getTodos = async (groupId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/todo/get/${groupId}`);
      setTodos(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get todos");
      console.log(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const getAllTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/todo/getall');
      setAllTodos(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get all todos");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const deleteTodo = async (todoId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`/api/todo/delete/${todoId}`);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete todo");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const updateTodo = async (todoId, todo) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`/api/todo/update/${todoId}`, todo);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update todo");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const getAllGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get all groups
      const response = await axios.get('/api/todo/get-groups');
      const groupsData = response.data.groups;
      
      // Then sequentially fetch todos for each group
      const groupsWithTodos = await Promise.all(
        groupsData.map(async (group) => {
          try {
            const todosResponse = await axios.get(`/api/todo/get/${group._id}`);
            // Create a new group object with todos included
            return {
              ...group,
              todo: todosResponse.data
            };
          } catch (err) {
            console.error(`Failed to fetch todos for group ${group._id}:`, err);
            return {
              ...group,
              todo: []
            };
          }
        })
      );
      
      // Set groups with todos already loaded
      setGroups(groupsWithTodos);
      
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get groups");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const createGroup = async (group) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/todo/create-group', group);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create group");
      throw error;
    } finally {
      setLoading(false);
    }
  }
  const updateGroup = async (groupId, group) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`/api/todo/update-group/${groupId}`, group);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update group");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const deleteGroup = async (groupId) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`/api/todo/delete-group/${groupId}`);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete group");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const uploadImage = async (image) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/image/upload', { image });
      
      // Refresh user data to update the avatar
      try {
        const userResponse = await axios.get('/api/auth/user');
        setUser(userResponse.data.user);
      } catch (refreshError) {
        console.error('Failed to refresh user data:', refreshError);
      }
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to upload image");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const getImage = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/image/get');
      return response.data.image;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get image");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/auth/update-profile', profileData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        setUser,
        loading, 
        error, 
        teammates, 
        notifications, 
        profile, 
        todos, 
        allTodos,
        groups,
        login, 
        signup, 
        logout, 
        changePassword,
        getNotifications,
        sendAssignment,
        sendRequest,
        acceptRequest,
        deleteWaitlist,
        rejectRequest,
        getRequests,
        getAllteammates,
        getWaitlists,
        getUserInfo,
        createTodo, // totalTasks + 1
        getTodos,
        getAllTodos,
        deleteTodo, // totalTasks - 1
        updateTodo,
        getAllGroups,
        setGroups,
        createGroup,
        updateGroup,
        deleteGroup,
        uploadImage,
        getImage,
        updateUserProfile,
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};