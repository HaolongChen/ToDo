import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { set } from 'mongoose';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [todos, setTodos] = useState([]);
  const [allTodos, setAllTodos] = useState([]);
  const [groups, setGroups] = useState([]);
  const [initialProcess, setInitialProcess] = useState(true);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if(!initialProcess) return;
        setLoading(true);
        const response = await axios.get('/api/auth/user');
        setInitialProcess(false);
        setUser(response.data);
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const getInfo = async () => {
      try {
        setLoading(true);
        await getAllGroups();
        await getNotifications();
        await getRequests();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    getInfo();
  }, [user]);

  // Login function
  const login = async (username, password) => {
    try {
      console.log("loading login")
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
      console.log("loading login false")
    }
  };

  // Sign-up function
  const signup = async (username, password) => {
    try {
      console.log("loading signup")
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/auth/signup', { username, password });
      setUser(response.data);
      getAllGroups();
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to sign up");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading signup false")
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log("loading logout")
      setLoading(true);
      await axios.post('/api/auth/logout');
      setUser(null);
      setNotifications([]);
      setRequests([]);
      setTeammates([]);
      setTodos([]);
      setInitialProcess(true);
      setProfile(null);
      setAllTodos([]);
      setGroups([]);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      console.log("loading logout false")
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      console.log("loading change password")
      setLoading(true);
      setError(null);
      await axios.post('/api/auth/change-password', { oldPassword, newPassword });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to change password");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading change password false")
    }
  }

  const getNotifications = async () => {
    try {
      console.log("loading get notifications")
      // setLoading(true);
      setError(null);
      const response = await axios.get('/api/notification/get-notifications');

      const initialNotifications = response.data || [];

      if (initialNotifications.length > 0) {
        // First set the notifications with IDs to avoid flickering UI
        setNotifications(initialNotifications);

        // Then fetch and process user information
        const processedNotifications = await Promise.all(
          initialNotifications.map(async (notification) => {
            try {
              // Make a copy of the notification to avoid mutating the original
              const notificationCopy = { ...notification };

              // Only fetch user info if fromUser/toUser are strings (IDs)
              if (typeof notificationCopy.fromUser === 'string') {
                const fromUserInfo = await getUserInfo(notificationCopy.fromUser, false);
                notificationCopy.fromUser = fromUserInfo || { username: 'Unknown User' };
              }

              if (typeof notificationCopy.toUser === 'string') {
                const toUserInfo = await getUserInfo(notificationCopy.toUser, false);
                notificationCopy.toUser = toUserInfo || { username: 'Unknown User' };
              }
              return notificationCopy;
            } catch (error) {
              console.error("Error fetching user info for notification:", error);
              return notification; // Return original notification if fetching user info fails
            }
          })
        );
        setNotifications(processedNotifications);
      } else {
        setNotifications([]);
      }
      // console.log(initialNotifications)
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get notifications");
      throw error;
    } finally {
      // setLoading(false);
      console.log("loading get notifications false")
    }
  }

  const sendAssignment = async (assignment) => {
    try {
      console.log("loading send assignment")
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/notification/send-assignment', assignment);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send assignment");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading send assignment false")
    }
  }

  const sendRequest = async (request) => {
    try {
      console.log("loading send request")
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/notification/send-requests', {toUser: request});
      
      // Update with correct pendingTeam property instead of pendingTeammates
      setUser(prevUser => {
        if (!prevUser) return prevUser;
        
        // Add to pendingTeam with the correct structure matching backend
        return {
          ...prevUser,
          pendingTeam: Array.isArray(prevUser.pendingTeam) 
            ? [...prevUser.pendingTeam, {userId: request, from: true}]
            : [{userId: request, from: true}]
        };
      });
      
      // Refresh user data after sending request
      try {
        const userResponse = await axios.get('/api/auth/user');
        setUser(userResponse.data); // Fixed: use consistent data structure
      } catch (refreshError) {
        console.error('Failed to refresh user data:', refreshError);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send request");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading send request false")
    }
  }

  const removeFromTeam = async (userId) => {
    try {
      console.log("loading remove from team")
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/notification/remove-from-team', { toUser: userId });
      
      // Update user state to remove teammate from team array
      setUser(prevUser => {
        if (!prevUser) return prevUser;
        
        return {
          ...prevUser,
          team: Array.isArray(prevUser.team)
            ? prevUser.team.filter(teammateId => teammateId !== userId)
            : []
        };
      });
      
      // Refresh user data to ensure team members are up to date
      try {
        const userResponse = await axios.get('/api/auth/user');
        setUser(userResponse.data); // Fixed: use consistent data structure
      } catch (refreshError) {
        console.error('Failed to refresh user data:', refreshError);
      }
      
    } catch (error) {
      setError(error.response?.data?.message || "Failed to remove from team");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading remove from team false")
    }
  }

  const acceptRequest = async (requestId) => {
    try {
      console.log("loading accept request")
      setLoading(true);
      setError(null);
      
      // Get the request data before updating it
      const requestToAccept = requests.find(req => req._id === requestId);
      const fromUserId = requestToAccept?.fromUser?._id || requestToAccept?.fromUser;
      
      // Call the API to accept the request
      const response = await axios.post(`/api/notification/accept/${requestId}`);
      
      // Update the UI state
      setRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
      
      // Update user state with proper pendingTeam handling 
      setUser(prevUser => {
        if (!prevUser) return prevUser;
        
        return {
          ...prevUser,
          pendingTeam: Array.isArray(prevUser.pendingTeam) 
            ? prevUser.pendingTeam.filter(item => item.userId !== fromUserId)
            : [],
          team: Array.isArray(prevUser.team)
            ? [...prevUser.team, fromUserId]
            : [fromUserId]
        };
      });
      
      // Refresh user data to ensure team members are up to date
      try {
        const userResponse = await axios.get('/api/auth/user');
        setUser(userResponse.data); // Fixed: use consistent data structure
      } catch (refreshError) {
        console.error('Failed to refresh user data:', refreshError);
      }
      
    } catch (error) {
      setError(error.response?.data?.message || "Failed to accept request");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading accept request false")
    }
  }

  const deleteWaitlist = async (waitlistId) => {
    try {
      setLoading(true);
      setError(null);
      console.log("loading delete waitlist")
      
      // Make the API call first
      await axios.post(`/api/notification/delete/${waitlistId}`);
      
      // Only update UI state after successful API call
      setRequests(prevRequests => Array.isArray(prevRequests) 
        ? prevRequests.filter(request => request._id !== waitlistId)
        : []);
      setNotifications(prevNotifications => Array.isArray(prevNotifications) 
        ? prevNotifications.filter(notification => notification._id !== waitlistId)
        : []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete waitlist");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading delete waitlist false")
    }
  }

  // Fix the rejectRequest function to handle undefined pendingTeammates
  const rejectRequest = async (requestId) => {
    try {
      console.log("loading reject request")
      setLoading(true);
      setError(null);
      
      // Get the request data before updating it
      const requestToReject = requests.find(req => req._id === requestId);
      const fromUserId = requestToReject?.fromUser?._id || requestToReject?.fromUser;
      
      const response = await axios.post(`/api/notification/reject/${requestId}`);
      setRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
      
      // Update user state with proper pendingTeam handling
      setUser(prevUser => {
        if (!prevUser) return prevUser;
        
        return {
          ...prevUser,
          pendingTeam: Array.isArray(prevUser.pendingTeam) 
            ? prevUser.pendingTeam.filter(item => item.userId !== fromUserId)
            : []
        };
      });
      
      // Refresh user data to ensure team members are up to date
      try {
        const userResponse = await axios.get('/api/auth/user');
        setUser(userResponse.data); // Fixed: use consistent data structure
      } catch (refreshError) {
        console.error('Failed to refresh user data:', refreshError);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reject request");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading reject request false")
    }
  }

  const getRequests = async () => {
    try {
      // console.log("loading get requests")
      // setLoading(true);
      setError(null);
      
      // Fetch requests
      const response = await axios.get('/api/notification/get-requests');
      
      // Store the initial requests
      const initialRequests = response.data || [];

      // console.log("initialRequests", initialRequests)
      
      // Process requests with user info using Promise.all to properly handle async operations
      if (initialRequests.length > 0) {
        // First set the requests with IDs to avoid flickering UI
        setRequests(initialRequests);
        
        // Then fetch and process user information
        const processedRequests = await Promise.all(
          initialRequests.map(async (request) => {
            try {
              // Make a copy of the request to avoid mutating the original
              const requestCopy = { ...request };
              
              // Only fetch user info if fromUser/toUser are strings (IDs)
              if (typeof requestCopy.fromUser === 'string') {
                const fromUserInfo = await getUserInfo(requestCopy.fromUser, false);
                requestCopy.fromUser = fromUserInfo || { username: 'Unknown User' };
              }
              
              if (typeof requestCopy.toUser === 'string') {
                const toUserInfo = await getUserInfo(requestCopy.toUser, false);
                requestCopy.toUser = toUserInfo || { username: 'Unknown User' };
              }
              
              return requestCopy;
            } catch (error) {
              console.error("Error fetching user info for request:", error);
              return request; // Return original request if fetching user info fails
            }
          })
        );
        
        // Update requests with processed data
        setRequests(processedRequests);
      } else {
        setRequests([]);
      }
      
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get requests");
      throw error;
    } finally {
      // setLoading(false);
    }
  }

  const getAllteammates = async () => {
    try {
      console.log("loading get teammates")
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/notification/get-teammates');
      // setTeammates(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get teammates");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading get teammates false")
    }
  }

  // const getWaitlists = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const response = await axios.get('/api/notification/get-waitlists');
  //     setNotifications(response.data);
  //   } catch (error) {
  //     setError(error.response?.data?.message || "Failed to get waitlists");
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const getUserInfo = async (userId, single) => {
    try {
      console.log("loading get user info")
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/notification/get-user-info/${userId}`);
      if(single) setProfile(response.data);
      else return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get user info");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading get user info false")
    }
  }

  const createTodo = async (todo) => {
    try {
      console.log("loading create todo")
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/todo/create', todo);
      console.log("loading create todo false");
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
      console.log("loading get todos")
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/todo/get/${groupId}`);
      setTodos(response.data);
      console.log("loading get todos false");
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
      console.log("loading get all todos")
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/todo/getall');
      setAllTodos(response.data);
      console.log("loading get all todos false");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get all todos");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const deleteTodo = async (todoId) => {
    try {
      console.log("loading delete todo");
      setLoading(true);
      setError(null);
      const response = await axios.post(`/api/todo/delete/${todoId}`);
      console.log("loading delete todo false");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete todo");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const updateTodo = async (todoId, todo) => {
    try {
      console.log("loading update todo")
      setLoading(true);
      setError(null);
      const response = await axios.post(`/api/todo/update/${todoId}`, todo);
      console.log("loading update todo false");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update todo");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const getAllGroups = async () => {
    try {
      console.log("loading get all groups")
      // setLoading(true);
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
      // setLoading(false);
      console.log("loading get all groups false")
    }
  }

  const createGroup = async (group) => {
    try {
      console.log("loading create group")
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/todo/create-group', group);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create group");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading create group false")
    }
  }
  const updateGroup = async (groupId, group) => {
    try {
      console.log("loading update group")
      setLoading(true);
      setError(null);
      const response = await axios.post(`/api/todo/update-group/${groupId}`, group);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update group");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading update group false")
    }
  }

  const deleteGroup = async (groupId) => {
    try {
      console.log("loading delete group")
      setLoading(true);
      setError(null);
      await axios.delete(`/api/todo/delete-group/${groupId}`);
      console.log("loading delete group false")
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete group");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const uploadImage = async (image) => {
    try {
      console.log("loading upload image")
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/image/upload', { image });
      
      // Refresh user data to update the avatar
      try {
        const userResponse = await axios.get('/api/auth/user');
        setUser(userResponse.data); // Fixed: use consistent data structure
      } catch (refreshError) {
        console.error('Failed to refresh user data:', refreshError);
      }
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to upload image");
      throw error;
    } finally {
      setLoading(false);
      console.log("loading upload image false")
    }
  }

  const getImage = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("loading get image")
      const response = await axios.get('/api/image/get');
      console.log("loading get image false")
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
      console.log("loading update profile")
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
      console.log("loading update profile false")
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
        requests,
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
        removeFromTeam,
        acceptRequest,
        deleteWaitlist,
        rejectRequest,
        getRequests,
        getAllteammates,
        // getWaitlists,
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