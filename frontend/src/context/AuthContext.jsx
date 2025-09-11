import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api.js';

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
  const [infoExists, setInfoExists] = useState(false);
  const [assignmentsStatus, setAssignmentsStatus] = useState([]);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if(!initialProcess) return;
        setLoading(true);
        const response = await api.get('/api/auth/user');
        if(response.status === 200) {
          setInitialProcess(false);
          setUser(response.data);
        }
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [initialProcess]); // Only depend on initialProcess, not user

  // Separate useEffect for fetching additional info after authentication
  useEffect(() => {
    const getInfo = async () => {
      // Only fetch info if user exists, info doesn't exist yet, and initialProcess is complete
      if (user && !infoExists && !initialProcess) {
        try {
          console.log("loading get info");
          setLoading(true);
          await getAllGroups();
          await getNotifications();
          await getRequests();
          
          // Always pre-fetch teammate details to prevent repeated fetching in various pages
          if (user.team && user.team.length > 0) {
            try {
              console.log("Pre-fetching teammate data...");
              // Fetch all teammate details in parallel for maximum efficiency
              const teammatePromises = user.team.map(teammateId => 
                api.get(`/api/notification/get-user-info/${teammateId}`)
              );
              const responses = await Promise.all(teammatePromises);
              const teammateData = responses.map(response => response.data);
              setTeammates(teammateData);
              console.log(`Teammate data pre-fetched for ${teammateData.length} teammates`);
            } catch (error) {
              console.error('Error pre-fetching teammate details:', error);
            }
          } else {
            // Reset teammates to an empty array if user has no team members
            setTeammates([]);
          }
          
          setInfoExists(true);
        } catch (error) {
          console.error('Error fetching initial data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    getInfo();
  }, [infoExists, initialProcess]); // Dependencies that determine when to fetch info

  // Login function
  const login = async (username, password) => {
    try {
      console.log("loading login")
      setLoading(true);
      setError(null);
      const response = await api.post('/api/auth/signin', { username, password });
      setUser(response.data);
      setInitialProcess(false);
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
      const response = await api.post('/api/auth/signup', { username, password });
      setUser(response.data);
      getAllGroups();
      setInitialProcess(false);
      setInfoExists(true);
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
      
      // Call backend logout endpoint
      await api.post('/api/auth/logout');
      
      // Force clear any remaining cookies on the frontend side
      // This helps handle cases where backend cookie clearing might not work
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name === 'jwt') {
          // Clear cookie with different domain configurations
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.todo.local`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=todo.local`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost`;
        }
      });
      
      // Clear all application state
      setUser(null);
      setNotifications([]);
      setRequests([]);
      setTeammates([]);
      setTodos([]);
      setInitialProcess(true);
      setInfoExists(false);
      setProfile(null);
      setAllTodos([]);
      setGroups([]);
      setAssignmentsStatus([]);
      
      // Clear any stored authentication state
      localStorage.removeItem('authToken'); // In case you're using localStorage
      sessionStorage.removeItem('authToken'); // In case you're using sessionStorage
      
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if backend logout fails, clear frontend state
      setUser(null);
      setNotifications([]);
      setRequests([]);
      setTeammates([]);
      setTodos([]);
      setInitialProcess(true);
      setInfoExists(false);
      setProfile(null);
      setAllTodos([]);
      setGroups([]);
      setAssignmentsStatus([]);
    } finally {
      console.log("loading logout false")
      setLoading(false);
      
      // Force a page reload to ensure clean state
      // This is a more aggressive approach to ensure everything is cleared
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      console.log("loading change password")
      setLoading(true);
      setError(null);
      await api.post('/api/auth/change-password', { oldPassword, newPassword });
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
      const response = await api.get('/api/notification/get-notifications');

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
      const response = await api.post('/api/notification/send-assignment', assignment);
      
      // We don't update the task count for the sender anymore, as assigned tasks
      // shouldn't be counted in the sender's statistics
      // (The recipients will have these tasks counted in their stats instead)
      
      // Return the created todos so they can be added to state immediately
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send assignment");
      console.log(error);
      throw error;
    } finally {
      setLoading(false);
      console.log("loading send assignment false")
    }
  }

  const editAssignment = async (req) => {
    try {
      console.log("loading edit assignment")
      setLoading(true);
      setError(null);
      const response = await api.post('/api/notification/edit-assignment', req);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to edit assignment");
      console.log(error);
      throw error;
    } finally {
      setLoading(false);
      console.log("loading edit assignment false")
    }
  }

  const deleteAssignmentForSingleTeammate = async (req) => {
    try {
      console.log("loading delete assignment for single teammate")
      setLoading(true);
      setError(null);
      
      // Check if the task was completed by the teammate before deleting
      const { todos, index } = req;
      const todoId = todos.originalIds[index];
      const isCompleted = assignmentsStatus && assignmentsStatus[todoId];
      const teammateId = todos.assignedTo[index];
      
      // Make the API call to delete the assignment
      const response = await api.post('/api/notification/delete-assignment-for-single-teammate', req);
      
      // Update teammate's task counts directly through their todo endpoint
      if (teammateId) {
        try {
          // Decrease totalTasks count
          await api.post(`/api/todo/decrement-total-tasks/${teammateId}`);
          
          // If the task was completed, also decrease completedTasks
          if (isCompleted) {
            await api.post(`/api/todo/decrement-completed-tasks/${teammateId}`);
          }
        } catch (err) {
          console.error("Failed to update teammate task counts:", err);
        }
      }
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete assignment for single teammate");
      console.log(error);
      throw error;
    } finally {
      setLoading(false);
      console.log("loading delete assignment for single teammate false")
    }
  }

  const deleteAssignmentForAllTeammates = async (req) => {
    try {
      console.log("loading delete assignment for all teammates")
      setLoading(true);
      setError(null);
      
      const { todos } = req;
      
      // Update task counts for each teammate before deleting assignments
      if (todos && todos.assignedTo && todos.originalIds) {
        const updatePromises = todos.assignedTo.map(async (teammateId, index) => {
          const todoId = todos.originalIds[index];
          const isCompleted = assignmentsStatus && assignmentsStatus[todoId];
          
          try {
            // Decrease totalTasks count
            await api.post(`/api/todo/decrement-total-tasks/${teammateId}`);
            
            // If the task was completed, also decrease completedTasks
            if (isCompleted) {
              await api.post(`/api/todo/decrement-completed-tasks/${teammateId}`);
            }
            return true;
          } catch (err) {
            console.error(`Failed to update task counts for teammate ${teammateId}:`, err);
            return false;
          }
        });
        
        // Wait for all count updates to finish
        await Promise.all(updatePromises);
      }
      
      // Now delete the assignments
      const response = await api.post('/api/notification/delete-assignment-for-all-teammates', req);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete assignment for all teammates");
      console.log(error);
      throw error;
    } finally {
      setLoading(false);
      console.log("loading delete assignment for all teammates false")
    }
  }

  const getAssignmentsStatus = async (req) => {
    try {
      setLoading(true);
      setError(null);
      console.log("req", req);
      const response = await api.post('/api/notification/get-assignments-status', {todos: req});
      setAssignmentsStatus(response.data);
      return response.data;
    } catch (error) {      
      setError(error.response?.data?.message || "Failed to get assignments status");
      console.log(error);
      throw error;
    } finally {
      setLoading(false);
      console.log("loading get assignments status false")
    }
  }
  
  const generateAssignedTodos = (groupsWithTodos) => {
    let tasksById = [];
    let currentTodos = [];
    if(groupsWithTodos[4]?.todo) {
      groupsWithTodos[4].todo.forEach(task => {
        if(!tasksById[task.uniqueMarker]) {
          tasksById[task.uniqueMarker] = {
            ...task,
            assignedTo: [task.user],
            originalIds: [task._id]
          };
        } else {
          if(!tasksById[task.uniqueMarker].assignedTo.includes(task.user)) {
            tasksById[task.uniqueMarker].assignedTo.push(task.user);
          }
          tasksById[task.uniqueMarker].originalIds.push(task._id);
        }
      })
      currentTodos = Object.values(tasksById);
    }
    console.log('tasksbyid', tasksById);
    console.log('currentTodos', currentTodos);
    return currentTodos;
  }

  const sendRequest = async (request) => {
    try {
      console.log("loading send request")
      setLoading(true);
      setError(null);
      const response = await api.post('/api/notification/send-requests', {toUser: request});
      
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
        const userResponse = await api.get('/api/auth/user');
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
      const response = await api.post('/api/notification/remove-from-team', { toUser: userId });
      
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
        const userResponse = await api.get('/api/auth/user');
        setTeammates(prevTeammates =>
          prevTeammates.filter(teammate => teammate._id !== userId)
        );
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
      const response = await api.post(`/api/notification/accept/${requestId}`);
      
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
        const userResponse = await api.get('/api/auth/user');
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
      await api.post(`/api/notification/delete/${waitlistId}`);
      
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
      
      const response = await api.post(`/api/notification/reject/${requestId}`);
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
        const userResponse = await api.get('/api/auth/user');
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
      const response = await api.get('/api/notification/get-requests');
      
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
      const response = await api.get('/api/notification/get-teammates');
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
  //     const response = await api.get('/api/notification/get-waitlists');
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
      const response = await api.get(`/api/notification/get-user-info/${userId}`);
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
      const response = await api.post('/api/todo/create', todo);
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
      const response = await api.get(`/api/todo/get/${groupId}`);
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
      const response = await api.get('/api/todo/getall');
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
      const response = await api.post(`/api/todo/delete/${todoId}`);
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
      const response = await api.post(`/api/todo/update/${todoId}`, todo);
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
      setLoading(true);
      setError(null);
      
      // First, get all groups
      const response = await api.get('/api/todo/get-groups');
      const groupsData = response.data.groups;
      
      // Then sequentially fetch todos for each group
      const groupsWithTodos = await Promise.all(
        groupsData.map(async (group) => {
          try {
            const todosResponse = await api.get(`/api/todo/get/${group._id}`);
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

      // setAssignmentsStatus(await getAssignmentsStatus(generateAssignedTodos(groupsWithTodos)));
      const todos = generateAssignedTodos(groupsWithTodos);
      const result = await getAssignmentsStatus(todos);
      setAssignmentsStatus(result);
      
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get groups");
      throw error;
    } finally {
      setLoading(false); // Uncommented to ensure loading state is reset
      console.log("loading get all groups false")
    }
  }

  const createGroup = async (group) => {
    try {
      console.log("loading create group")
      setLoading(true);
      setError(null);
      const response = await api.post('/api/todo/create-group', group);
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
      const response = await api.post(`/api/todo/update-group/${groupId}`, group);
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
      await api.delete(`/api/todo/delete-group/${groupId}`);
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
      const response = await api.post('/api/image/upload', { image });
      
      // Refresh user data to update the avatar
      try {
        const userResponse = await api.get('/api/auth/user');
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
      const response = await api.get('/api/image/get');
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
      const response = await api.post('/api/auth/update-profile', profileData);
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
        assignmentsStatus,
        login, 
        signup, 
        logout, 
        changePassword,
        getNotifications,
        sendAssignment,
        editAssignment,
        deleteAssignmentForSingleTeammate,
        deleteAssignmentForAllTeammates,
        getAssignmentsStatus,
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