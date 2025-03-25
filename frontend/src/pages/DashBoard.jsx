import { useEffect, useRef } from "react";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { FiMenu } from "react-icons/fi";
import { useState } from "react";
import { Task } from "../components/Task";
import { NotImportant } from "../components/NotImportant";
import { AssignedToMe } from "../components/AssignedToMe";
import { AssignedByMe } from "../components/AssignedByme";
import { useLocation, useNavigate } from "react-router-dom";
import { Teammates } from "../components/Teammates";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export function DashBoard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getAllGroups, groups, createTodo, user, setUser, loading, error, teammates, setGroups, deleteTodo, updateTodo, createGroup, updateGroup, deleteGroup, getNotifications, getRequests } = useAuth(); // Added deleteGroup
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [todo, setTodo] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editingGroupIndex, setEditingGroupIndex] = useState(null); // Track which group name is being edited
  const [editGroupValue, setEditGroupValue] = useState(""); // Store the edited group name
  const [newTodo, setNewTodo] = useState({
    description: "",
    completed: false,
    assigned: false,
    important: false,
    user: user?._id || "",
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateInput, setDateInput] = useState("");
  const [isDateConfirmed, setIsDateConfirmed] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  // Add state to track the source group of a task for special views
  const [taskSourceGroups, setTaskSourceGroups] = useState({});
  // Add state to track initial loading
  const [initialLoading, setInitialLoading] = useState(true);
  // Add state for highlighted item and refs for scrolling
  const [highlightedItem, setHighlightedItem] = useState(null);
  const highlightedRef = useRef(null);
  const groupRefs = useRef({});
  const todoRefs = useRef({});

  // Handle URL query parameters for highlighting groups or todos
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const highlight = queryParams.get('highlight');
    
    if (!highlight || groups.length === 0 || initialLoading) return;

    // Format: highlight=group-{groupId} or highlight=todo-{todoId}
    const [type, id] = highlight.split('-');
    
    if (type === 'group') {
      // Find the group index
      const groupIndex = groups.findIndex(group => group._id === id);
      if (groupIndex !== -1) {
        setSelectedGroup(groupIndex);
        setHighlightedItem({ type: 'group', id });
      }
    } else if (type === 'todo') {
      // Find which group contains this todo
      let foundGroupIndex = -1;
      let todoInfo = null;
      
      // Search in all groups
      for (let i = 0; i < groups.length; i++) {
        if (!groups[i].todo) continue;
        
        const todoIndex = groups[i].todo.findIndex(t => t._id === id);
        if (todoIndex !== -1) {
          foundGroupIndex = i;
          todoInfo = { groupIndex: i, todoIndex };
          break;
        }
      }
      
      if (foundGroupIndex !== -1) {
        setSelectedGroup(foundGroupIndex);
        setHighlightedItem({ type: 'todo', id, groupIndex: todoInfo.groupIndex });
      }
    }
  }, [groups, location.search, initialLoading]);

  // Scroll to highlighted item once it's rendered
  useEffect(() => {
    if (!highlightedItem) return;
    
    // Allow time for the DOM to update after changing selectedGroup
    const timer = setTimeout(() => {
      if (highlightedItem.type === 'group' && groupRefs.current[highlightedItem.id]) {
        const groupElement = groupRefs.current[highlightedItem.id];
        groupElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight animation
        groupElement.classList.add('highlight-animation');
        setTimeout(() => {
          groupElement.classList.remove('highlight-animation');
          // Clear the highlighted item after animation
          setHighlightedItem(null);
        }, 2000);
      } else if (highlightedItem.type === 'todo' && todoRefs.current[highlightedItem.id]) {
        const todoElement = todoRefs.current[highlightedItem.id];
        todoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight animation
        todoElement.classList.add('highlight-animation');
        setTimeout(() => {
          todoElement.classList.remove('highlight-animation');
          // Clear the highlighted item after animation
          setHighlightedItem(null);
        }, 2000);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [highlightedItem, todo]);

  // useEffect(() => {
  //   if(groups.length > 0) {
  //     setInitialLoading(false);
  //     return;
  //   }
  //   else{
  //     getAllGroups().then(() => {
  //       // Set initialLoading to false once groups are loaded
  //       setInitialLoading(false);
  //     });
  //   }
    
  // }, []);

  useEffect(() => {
    if(!loading && initialLoading) {
      setInitialLoading(false);
    }
  }, [loading]);

  // Helper functions for special groups
  const getMyDayTasks = () => {
    // Get tasks from all groups that were created in the last 24 hours
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    let myDayTasks = [];
    let sourceMapping = {};
    
    groups.forEach((group, index) => {
      if (!group.todo) return;
      if(index === 4) return;
      const recentTasks = group.todo.filter(task => {
        const createdAt = new Date(task.createdAt);
        return createdAt >= oneDayAgo;
      });
      
      // Track the original group for each task
      recentTasks.forEach(task => {
        sourceMapping[task._id] = {
          groupId: group._id,
          groupIndex: groups.findIndex(g => g._id === group._id)
        };
      });
      
      myDayTasks = [...myDayTasks, ...recentTasks];
    });
    
    return { tasks: myDayTasks, sourceMapping };
  };
  
  const getImportantTasks = () => {
    // Get tasks from all groups that are marked as important
    let importantTasks = [];
    let sourceMapping = {};
    
    groups.forEach((group, index) => {
      if (!group.todo) return;
      if(index === 4) return;
      const importantGroupTasks = group.todo.filter(task => task.important);
      
      // Track the original group for each task
      importantGroupTasks.forEach(task => {
        sourceMapping[task._id] = {
          groupId: group._id,
          groupIndex: groups.findIndex(g => g._id === group._id)
        };
      });
      
      importantTasks = [...importantTasks, ...importantGroupTasks];
    });
    
    return { tasks: importantTasks, sourceMapping };
  };
  
  const getPlannedTasks = () => {
    // Get tasks from all groups that have a due date
    let plannedTasks = [];
    let sourceMapping = {};
    
    groups.forEach((group, index) => {
      if (!group.todo) return;
      if(index === 4) return;
      const plannedGroupTasks = group.todo.filter(task => task.due);
      
      // Track the original group for each task
      plannedGroupTasks.forEach(task => {
        sourceMapping[task._id] = {
          groupId: group._id,
          groupIndex: groups.findIndex(g => g._id === group._id)
        };
      });
      
      plannedTasks = [...plannedTasks, ...plannedGroupTasks];
    });
    
    return { tasks: plannedTasks, sourceMapping };
  };

  useEffect(() => {
    if (groups.length === 0) return;
    
    let currentTodos = [];
    let sourceMapping = {};
    
    if (selectedGroup === 0) {
      // My Day - tasks created in the last 24 hours
      const myDayResult = getMyDayTasks();
      currentTodos = myDayResult.tasks;
      sourceMapping = myDayResult.sourceMapping;
    } else if (selectedGroup === 1) {
      // Important - tasks marked as important
      const importantResult = getImportantTasks();
      currentTodos = importantResult.tasks;
      sourceMapping = importantResult.sourceMapping;
    } else if (selectedGroup === 2) {
      // Planned - tasks with due dates
      const plannedResult = getPlannedTasks();
      currentTodos = plannedResult.tasks;
      sourceMapping = plannedResult.sourceMapping;
    } else {
      // Regular group - use the group's todos
      currentTodos = groups[selectedGroup]?.todo || [];
    }
    
    // Sort todos: incomplete first, then by creation date (newest first)
    currentTodos.sort((a, b) => {
      if(a.completed && !b.completed) return 1;
      if(!a.completed && b.completed) return -1;
      return (new Date(b.createdAt)).getTime() - (new Date(a.createdAt)).getTime();
    });
    
    setTodo(currentTodos);
    setTaskSourceGroups(sourceMapping);
  }, [groups, selectedGroup]);

  useEffect(() => {
    setNewTodo({...newTodo, description: inputValue});
  }, [inputValue]);

  // Click outside listener to cancel edit mode
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if we have an active editing task, the click was not on an edit field, 
      // and not on a complete edit button (checkmark button)
      if (
        editingTaskId && 
        !event.target.closest('.editing-task') && 
        !event.target.closest('.edit-confirm-btn')
      ) {
        setEditingTaskId(null);
        setEditValue("");
      }

      // Add similar logic for group name editing
      if (
        editingGroupIndex !== null && 
        !event.target.closest('.editing-group') && 
        !event.target.closest('.edit-group-confirm-btn')
      ) {
        setEditingGroupIndex(null);
        setEditGroupValue("");
      }

      // Close date picker only when clicking outside and not on any input fields
      if (
        datePickerOpen && 
        !event.target.closest('.date-picker-container') && 
        !event.target.closest('.calendar-button') &&
        !event.target.closest('.date-input-field') &&
        isDateConfirmed
      ) {
        setDatePickerOpen(false);
        setIsDateConfirmed(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingTaskId, editingGroupIndex, datePickerOpen, isDateConfirmed]);

  // New function for handling group name edits
  const handleEditGroupName = (index, groupName) => {
    // Don't allow editing of the first 5 default groups
    if (index <= 4) return;
    
    setEditingGroupIndex(index);
    setEditGroupValue(groupName);
  };

  // Function to complete group name edit
  const completeGroupEdit = async (e, groupId, index) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      if (editGroupValue.trim() === '') return;

      // Update the local state
      setGroups(prevGroups => {
        const updatedGroups = [...prevGroups];
        updatedGroups[index] = {
          ...updatedGroups[index],
          name: editGroupValue
        };
        return updatedGroups;
      });

      // Update the database
      // updateGroup(groupId, { name: editGroupValue });
      toast.promise(
        updateGroup(groupId, { name: editGroupValue }),
        {
          loading: 'Updating group...',
          success: 'Group updated successfully',
          error: 'Failed to update group'
        }
      );

      // Exit edit mode
      setEditingGroupIndex(null);
      setEditGroupValue("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTodo = async (event) => {
    event.preventDefault();

    if (!newTodo.description.trim()) return;

    // Get the current groupId directly instead of using state
    const currentGroupId = groups[selectedGroup]?._id;
    
    // Create a todo object with the current groupId
    const todoToCreate = {
      ...newTodo,
      groupId: currentGroupId
    };    
    
    setInputValue("");
    

    setNewTodo({
      description: "",
      completed: false,
      assigned: false,
      important: false,
      user: user._id, // Keep the user ID
      due: undefined,
    });

    setUser(prevUser => ({
      ...prevUser,
      totalTasks: (prevUser?.totalTasks || 0) + 1
    }));

    // First call createTodo and await the response to get the server-generated _id
    // const createdTodo = await createTodo(todoToCreate);

    const createdTodo = await toast.promise(
      createTodo(todoToCreate),
      {
        loading: 'Creating task...',
        success: 'Task created successfully',
        error: 'Failed to create task'
      }
    )
    
    // Then update the local state with the todo that has the _id
    setGroups(prevGroups => {
      let updatedGroups = [...prevGroups];
      updatedGroups[selectedGroup] = {
        ...updatedGroups[selectedGroup],
        todo: [...(updatedGroups[selectedGroup].todo || []), createdTodo]
      };
      return updatedGroups;
    });
  }

  // Date picker handlers
  const handleDateChange = (e) => {
    setDateInput(e.target.value);
    setSelectedDate(e.target.value);
  };

  const handleDateSelect = () => {
    if (selectedDate) {
      // Convert the selected date to a date with time set to 23:59
      const dateWithTime = setDateWithEndOfDay(selectedDate);
      
      // Ensure date is valid before applying
      if (dateWithTime && !isNaN(dateWithTime.getTime())) {
        setNewTodo({...newTodo, due: dateWithTime});
        setDatePickerOpen(false);
        setIsDateConfirmed(true);
      }
    }
  };

  const clearSelectedDate = (e) => {
    e.stopPropagation();
    setNewTodo({...newTodo, due: undefined});
    setSelectedDate(null);
    setDateInput("");
  };

  const toggleDatePicker = () => {
    setDatePickerOpen(!datePickerOpen);
    setIsDateConfirmed(false);
    
    // If opening the picker and there's an existing date, set it to the input
    if (!datePickerOpen && newTodo.due) {
      const formattedDate = formatDateForInput(newTodo.due);
      setDateInput(formattedDate);
      setSelectedDate(formattedDate);
    }
  };

  // Format date for display (MM/DD/YYYY)
  const formatDate = (date) => {
    if (!date) return "";
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    // Month and day need to be padded with leading zeros
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set time to 23:59 for the selected date in user's local timezone
  const setDateWithEndOfDay = (dateString) => {
    if (!dateString) return null;
    
    // Parse the date string carefully to ensure we get the correct day
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    
    // Create date using user's local timezone (months are 0-indexed in JS Date)
    const date = new Date(year, month - 1, day, 23, 59, 0, 0);
    
    // Verify the date is valid
    if (isNaN(date.getTime())) return null;
    
    return date;
  };

  const handleToggleTask = async (taskId, index) => {
    try {
      const completedStatus = !todo[index].completed;

      if(completedStatus){
        axios.post('/api/todo/plus-completed');
        setUser(prevUser => ({
          ...prevUser,
          completedTasks: (prevUser.completedTasks || 0) + 1
        }))
      } // completed tasks + 1

      else{
        axios.post('/api/todo/minus-completed');
        setUser(prevUser => ({
          ...prevUser,
          completedTasks: (prevUser.completedTasks || 0) - 1
        }))
      } // completed tasks - 1
      console.log("passed");
      // For special groups (index <= 2), update the task in its original group
      if (selectedGroup <= 2) {
        const sourceInfo = taskSourceGroups[taskId];
        if (sourceInfo) {
          setGroups(prevGroups => {
            let updatedGroups = [...prevGroups];
            const sourceGroup = updatedGroups[sourceInfo.groupIndex];
            
            if (sourceGroup && sourceGroup.todo) {
              const taskIndex = sourceGroup.todo.findIndex(t => t._id === taskId);
              
              if (taskIndex !== -1) {
                const updatedTodos = [...sourceGroup.todo];
                updatedTodos[taskIndex] = {
                  ...updatedTodos[taskIndex],
                  completed: completedStatus
                };
                
                updatedGroups[sourceInfo.groupIndex] = {
                  ...sourceGroup,
                  todo: updatedTodos
                };
              }
            }
            
            return updatedGroups;
          });
        }
        
        // Also update the local state for the current view
        setTodo(prevTodos => {
          const updatedTodos = [...prevTodos];
          updatedTodos[index] = {
            ...updatedTodos[index],
            completed: completedStatus
          };
          return updatedTodos;
        });
      } else {
        // For regular groups, use the existing logic
        setGroups(prevGroups => {
          let updatedGroups = [...prevGroups];
          let updatedTodo = [...updatedGroups[selectedGroup].todo]; 
          updatedTodo[index] = {
            ...updatedTodo[index],
            completed: completedStatus
          };
          updatedGroups[selectedGroup] = {
            ...updatedGroups[selectedGroup],
            todo: updatedTodo
          };
          return updatedGroups;
        });
      }
      
      // updateTodo(taskId, { completed: completedStatus });
      if(completedStatus){
        toast.promise(
          updateTodo(taskId, { completed: completedStatus }),
          {
            loading: 'Updating task...',
            success: 'Task marked as completed',
            error: 'Failed to update task'
          }
        );
      } else {
        toast.promise(
          updateTodo(taskId, { completed: completedStatus }),
          {
            loading: 'Updating task...',
            success: 'Task marked as not completed',
            error: 'Failed to update task'
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleEditTask = async (taskId, taskDescription) => {
    // If we're already editing, don't do anything
    if (editingTaskId) return;
    
    // Set the task ID we're editing and initialize the edit value
    setEditingTaskId(taskId);
    setEditValue(taskDescription);
  }

  const completeEdit = async (e) => {
    // Stop the event from bubbling up to prevent the click outside handler from being triggered
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      if (!editingTaskId || editValue.trim() === '') return;
      
      // Find the index of the task being edited
      const taskIndex = todo.findIndex(task => task._id === editingTaskId);
      if (taskIndex === -1) return;

      // For special groups (index <= 2), update the task in its original group
      if (selectedGroup <= 2) {
        const sourceInfo = taskSourceGroups[editingTaskId];
        if (sourceInfo) {
          setGroups(prevGroups => {
            let updatedGroups = [...prevGroups];
            const sourceGroup = updatedGroups[sourceInfo.groupIndex];
            
            if (sourceGroup && sourceGroup.todo) {
              const taskIndex = sourceGroup.todo.findIndex(t => t._id === editingTaskId);
              
              if (taskIndex !== -1) {
                const updatedTodos = [...sourceGroup.todo];
                updatedTodos[taskIndex] = {
                  ...updatedTodos[taskIndex],
                  description: editValue
                };
                
                updatedGroups[sourceInfo.groupIndex] = {
                  ...sourceGroup,
                  todo: updatedTodos
                };
              }
            }
            
            return updatedGroups;
          });
        }
        
        // Also update the local state for the current view
        setTodo(prevTodos => {
          const updatedTodos = [...prevTodos];
          updatedTodos[taskIndex] = {
            ...updatedTodos[taskIndex],
            description: editValue
          };
          return updatedTodos;
        });
      } else {
        // For regular groups, use the existing logic
        setGroups(prevGroups => {
          let updatedGroups = [...prevGroups];
          let updatedTodo = [...updatedGroups[selectedGroup].todo];
          updatedTodo[taskIndex] = {
            ...updatedTodo[taskIndex],
            description: editValue
          };
          updatedGroups[selectedGroup] = {
            ...updatedGroups[selectedGroup],
            todo: updatedTodo
          };
          return updatedGroups;
        });
      }

      // Update in the database
      // updateTodo(editingTaskId, { description: editValue });

      toast.promise(
        updateTodo(editingTaskId, { description: editValue }),
        {
          loading: 'Updating task...',
          success: 'Task updated successfully',
          error: 'Failed to update task'
        }
      
      );

      // Exit edit mode
      setEditingTaskId(null);
      setEditValue("");
    } catch (error) {
      console.error(error);
    }
  }

  const handleDeleteTask = async (taskId, completed) => {
    try {
      // For special groups (index <= 2), update the task in its original group
      if (selectedGroup <= 2) {
        const sourceInfo = taskSourceGroups[taskId];
        if (sourceInfo) {
          setGroups(prevGroups => {
            let updatedGroups = [...prevGroups];
            const sourceGroup = updatedGroups[sourceInfo.groupIndex];
            
            if (sourceGroup && sourceGroup.todo) {
              updatedGroups[sourceInfo.groupIndex] = {
                ...sourceGroup,
                todo: sourceGroup.todo.filter(t => t._id !== taskId)
              };
            }
            
            return updatedGroups;
          });
        }
        
        // Also update the local state for the current view
        setTodo(prevTodos => prevTodos.filter(t => t._id !== taskId));
      } else {
        // For regular groups, use the existing logic
        setGroups(prevGroups => {
          let updatedGroups = [...prevGroups];
          updatedGroups[selectedGroup] = {
            ...updatedGroups[selectedGroup],
            todo: updatedGroups[selectedGroup].todo.filter(todo => todo._id !== taskId)
          };
          return updatedGroups;
        });
      }
      
      deleteTodo(taskId);
      if(completed){
        axios.post('/api/todo/minus-completed');
        setUser(prevUser => ({
          ...prevUser,
          completedTasks: (prevUser.completedTasks || 0) - 1
        })) // completed tasks - 1
      }
      setUser(prevUser => ({ ...prevUser, totalTasks: prevUser.totalTasks - 1 }));
    } catch (error) {
      console.error(error);
    }
  }

  const handleCreateGroup = async () => {
    if (newGroup.trim() === "") return;
    const newGroupObj = {
      name: newGroup
    };
    setNewGroup("");
    // const createdGroup = await createGroup(newGroupObj);
    const createdGroup = await toast.promise(
      createGroup(newGroupObj),
      {
        loading: 'Creating group...',
        success: 'Group created successfully',
        error: 'Failed to create group'
      }
    );
    setGroups([...groups, createdGroup]);
  }

  const handleDeleteGroup = async (groupId) => {
    try {
      // Find the group to be deleted
      const groupToDelete = groups.find(group => group._id === groupId);
      
      if (groupToDelete && groupToDelete.todo && groupToDelete.todo.length > 0) {
        // Delete all todos in the group first
        const deletePromises = groupToDelete.todo.map(task => handleDeleteTask(task._id, task.completed));
        Promise.all(deletePromises);
      }

      // Then delete the group itself
      setGroups(prevGroups => prevGroups.filter(group => group._id !== groupId));
      deleteGroup(groupId);
    } catch (error) {
      console.error(error);
    }
  }

  // Function to pre-fetch notifications data before navigating to notifications page
  // const navigateToNotifications = async () => {
  //   try {
  //     // Show loading toast
  //     toast.loading("Loading notifications...");
      
  //     // Pre-fetch notification data
  //     await getNotifications();
  //     await getRequests();
      
  //     // Dismiss loading toast and navigate
  //     toast.dismiss();
  //     navigate('/notifications');
  //   } catch (error) {
  //     console.error("Error pre-fetching notifications:", error);
  //     toast.error("Failed to load notifications");
  //     // Navigate anyway, the Notifications component will retry loading
  //     navigate('/notifications');
  //   }
  // };

  // Add this function to the NavBar component or pass it as a prop
  // useEffect(() => {
  //   // Find the NavBar component and add the handler for notifications
  //   const notificationsButton = document.querySelector('.notification-button');
  //   if (notificationsButton) {
  //     // Remove any existing listener to prevent duplicates
  //     const newButton = notificationsButton.cloneNode(true);
  //     notificationsButton.parentNode.replaceChild(newButton, notificationsButton);
      
  //     // Add the new click handler
  //     newButton.addEventListener('click', (e) => {
  //       e.preventDefault();
  //       navigateToNotifications();
  //     });
  //   }
  // }, []);

  // Helper function to render sidebar skeletons
  const renderSidebarSkeletons = () => {
    return Array(8).fill(0).map((_, index) => (
      <li key={index} className="select-none list-row h-10 px-4 mx-4 my-2 flex items-center">
        <div className="flex w-full flex-col">
          <div className="skeleton h-4 w-full"></div>
        </div>
      </li>
    ));
  };
  console.log(todo);
  // Helper function to render task skeletons
  const renderTaskSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <div key={index} className="px-8 h-18">
        <li className="flex items-center h-14 rounded-2xl py-2 px-4">
          <div className="skeleton h-4 w-4 mr-2 rounded-full"></div>
          <div className="flex w-full flex-col gap-2">
            <div className="skeleton h-4 w-full"></div>
          </div>
        </li>
      </div>
    ));
  };

  return (
    <>
      <Toaster />
      <div className="flex flex-col h-screen overflow-hidden">
        <style>{`
          .highlight-animation {
            animation: highlight-pulse 2s ease-in-out;
          }
          
          @keyframes highlight-pulse {
            0% { background-color: rgba(59, 130, 246, 0.2); }
            50% { background-color: rgba(59, 130, 246, 0.4); }
            100% { background-color: transparent; }
          }
        `}</style>
        <NavBar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-row flex-1 h-full overflow-hidden">
            {drawerOpen && (
              <div className="flex-shrink-0 flex flex-col h-full overflow-y-auto overflow-x-hidden w-70">
                <ul className="bg-base-100 w-full flex-1 shadow-none">
                  <div className="h-18 px-8 flex items-center">
                    <FiMenu size={36} />
                    <div 
                      className="hover:bg-[#bcbcbc31] relative left-[-38px] w-10 h-10 rounded-[10px] hover:cursor-pointer" 
                      onClick={() => setDrawerOpen(!drawerOpen)}>
                    </div>
                  </div>
                  
                  {initialLoading ? (
                    renderSidebarSkeletons()
                  ) : (
                    groups.map((group, index) => (
                      <div key={group._id}>
                        <li 
                          ref={el => groupRefs.current[group._id] = el}
                          className={`select-none list-row group ${index === selectedGroup ? "hover:bg-[#bcbcbc31]" : "hover:bg-[#7f7f7f2b]"} hover:cursor-pointer rounded-box h-10 px-4 mx-4 my-2 text-[16px] flex items-center justify-between ${index === selectedGroup ? "bg-[#bcbcbc31]" : ""}`}
                          onClick={() => editingGroupIndex !== index && setSelectedGroup(index)}
                        >
                          <div className="flex items-center">{index == 0 && (<span className="text-lg mr-2">☀️</span>)}
                          {index == 1 && (<span className="text-lg mr-2">⭐</span>)}
                          {index == 2 && (<span className="text-lg mr-2">📅</span>)}
                          {index == 3 && (<span className="mr-2"><AssignedToMe size={18} /></span>)}
                          {index == 4 && (<span className="mr-2"><AssignedByMe size={18} /></span>)}
                          {index > 4 && (<span className="mr-2"><Task size={18} /></span>)}
                          {editingGroupIndex === index ? (
                            <div className="flex-1 editing-group" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editGroupValue}
                                onChange={(e) => setEditGroupValue(e.target.value)}
                                className="input input-sm w-full focus:outline-none bg-transparent rounded-[12px]"
                                autoFocus
                                maxLength={20}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    completeGroupEdit(e, group._id, index);
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <p className="truncate" onDoubleClick={() => handleEditGroupName(index, group.name)}>{group.name}</p>
                          )}</div>
                          {index > 4 && <button 
                            className="btn btn-circle btn-sm bg-transparent border-none hover:bg-gray-200/30 hidden group-hover:flex" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(groups[index]._id);
                              setSelectedGroup(selectedGroup == index ? selectedGroup - 1 : (selectedGroup > index ? selectedGroup - 1 : selectedGroup));
                            }}
                          >
                            <span className="text-lg">❌</span>
                          </button>}
                          {editingGroupIndex === index && index > 4 && (
                            <button 
                              className="btn btn-circle btn-xs bg-transparent border-none hover:bg-gray-200/30 edit-group-confirm-btn" 
                              onClick={(e) => {
                                e.stopPropagation();
                                completeGroupEdit(e, group._id, index);
                              }}
                            >
                              <span className="text-sm">✔️</span>
                            </button>
                          )}
                        </li>
                        {index == 4 && (
                          <>
                            <div className="h-3.5"></div>
                            <div className="bg-[#484644] h-[1px] w-[230px] mx-auto"></div>
                            <div className="h-3.5"></div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </ul>
                  <div className="sticky bottom-6 flex justify-center w-full pb-4">
                    <div className="relative flex items-center w-4/5 h-15 rounded-4xl bg-white/5">
                      <input
                        type="text"
                        placeholder="New Group"
                        className="input input-bordered w-full h-15 rounded-4xl bg-white/10 backdrop-blur-md focus:outline-none shadow-md pr-24"
                        value={newGroup}
                        maxLength={20}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                        onChange={(e) => setNewGroup(e.target.value)}
                      />
                      <div className="absolute right-3">
                        <button
                          className="btn btn-circle"
                          onClick={handleCreateGroup}
                        >
                          ➕
                        </button>
                      </div>
                    </div>
                  </div>
              </div>
            )}
            <div className="flex-1 bg-base-200 flex flex-col relative h-full w-full overflow-y-auto overflow-x-hidden">
              {/* Position menu absolutely when drawer is closed so it doesn't take vertical space */}
              {!drawerOpen && (
                <div className="absolute top-0 left-0 h-18 px-8 flex items-center z-10">
                  <FiMenu size={36} />
                  <div 
                    className="hover:bg-[#bcbcbc31] relative left-[-38px] w-10 h-10 rounded-[10px] hover:cursor-pointer" 
                    onClick={() => setDrawerOpen(!drawerOpen)}>

                  </div>
                </div>
              )}

              {initialLoading ? (
                <div className={`h-14 px-8 flex items-center mt-1.5 mb-3 ${drawerOpen ? "" : "translate-x-[60px]"}`}>
                  <div className="skeleton h-8 w-8 mr-3"></div>
                  <div className="skeleton h-10 w-52"></div>
                </div>
              ) : (
                <div className={`h-14 px-8 flex items-center justify-between mt-1.5 mb-3 ${drawerOpen ? "" : "translate-x-[60px]"}`}>
                  <div className="flex items-center">
                  {selectedGroup == 0 && (<span className="text-[36px] mr-2">☀️</span>)}
                  {selectedGroup == 1 && (<span className="text-[36px] mr-2">⭐</span>)}
                  {selectedGroup == 2 && (<span className="text-[36px] mr-2">📅</span>)}
                  {selectedGroup == 3 && (<span className="mr-2"><AssignedToMe size={36} /></span>)}
                  {selectedGroup == 4 && (<span className="mr-2"><AssignedByMe size={36} /></span>)}
                  {selectedGroup > 4 && (<span className="mr-2"><Task size={36} /></span>)}
                  {editingGroupIndex === selectedGroup && selectedGroup > 4 ? (
                    <div className="editing-group flex items-center">
                      <input
                        type="text"
                        value={editGroupValue}
                        onChange={(e) => setEditGroupValue(e.target.value)}
                        className="input input-lg w-full focus:outline-none bg-transparent text-[32px] rounded-2xl"
                        autoFocus
                        maxLength={20}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            completeGroupEdit(e, groups[selectedGroup]._id, selectedGroup);
                          }
                        }}
                      />
                      <button 
                        className="btn btn-circle ml-2 edit-group-confirm-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          completeGroupEdit(e, groups[selectedGroup]._id, selectedGroup);
                        }}
                      >
                        <span className="text-lg">✔️</span>
                      </button>
                    </div>
                  ) : (
                    <span 
                      className="text-[32px]"
                      onDoubleClick={() => selectedGroup > 4 && handleEditGroupName(selectedGroup, groups[selectedGroup]?.name)}
                    >
                      {groups[selectedGroup]?.name}
                    </span>
                  )}</div>
                  {selectedGroup > 4 && <button 
                    className="btn btn-circle btn-sm bg-transparent border-none hover:bg-gray-200/30" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(groups[selectedGroup]._id);
                      setSelectedGroup(selectedGroup - 1);
                    }}
                  >
                    <span className="text-lg">❌</span>
                  </button>}
                </div>
              )}
              
              {/* Main content with consistent positioning */}
              <div className="flex-1 flex flex-col relative">
                <div className="flex-1 flex items-center justify-center">
                  {initialLoading ? (
                    <div className="w-full">
                      {renderTaskSkeletons()}
                    </div>
                  ) : (
                    <>
                      {(todo.length === 0) ? (
                        <div className="flex flex-col items-center">
                          <h1 className="text-6xl font-bold text-gray-800 select-none">Dashboard</h1>
                          <p className="mt-4 text-lg text-gray-600 select-none">
                            {selectedGroup === 0 
                              ? "Tasks from today will appear here" 
                              : selectedGroup === 1 
                                ? "Important tasks will appear here" 
                                : selectedGroup === 2 
                                  ? "Tasks with due dates will appear here"
                                  : selectedGroup === 3 
                                    ? "Tasks assigned to you show up here"
                                    : selectedGroup === 4 
                                      ? "Tasks assigned by you show up here" 
                                      : "Add tasks to get started"}
                          </p>
                        </div>
                      ) : (
                        <div className="w-full h-full">
                          <ul>
                            {todo.map((task, index) => (
                              <div key={task._id} className="px-8 h-18">
                                <li 
                                  ref={el => todoRefs.current[task._id] = el}
                                  className="flex items-center h-14 rounded-2xl shadow-white shadow-sm hover:cursor-pointer hover:bg-[#7f7f7f2b] border-gray-200 py-2 px-4 group"
                                  onClick={() => editingTaskId !== task._id && handleToggleTask(task._id, index)}
                                >
                                  <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleToggleTask(task._id, index);
                                    }}
                                    className="mr-2"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  {editingTaskId === task._id ? (
                                    <div className="flex-1 editing-task" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="input w-full focus:outline-none bg-transparent"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            completeEdit(e);
                                          }
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <span className={`flex-1 truncate ${task.completed ? "line-through text-gray-400" : ""}`}>
                                      {task.description}
                                      {selectedGroup <= 2 && taskSourceGroups[task._id] && (
                                        <span className="ml-2 text-sm text-gray-500">
                                          (from {groups[taskSourceGroups[task._id].groupIndex]?.name})
                                        </span>
                                      )}
                                      {task.due && (
                                        <span className="ml-2 text-sm text-cyan-600">
                                          Due {formatDate(new Date(task.due))}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                  {editingTaskId === task._id ? (
                                    <button 
                                      className="btn btn-circle btn-sm bg-transparent border-none hover:bg-gray-200/30 edit-confirm-btn" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        completeEdit(e);
                                      }}
                                    >
                                      <span className="text-lg">✔️</span>
                                    </button>
                                  ) : (
                                    <>
                                      <button 
                                        className="btn btn-circle btn-sm bg-transparent border-none hover:bg-gray-200/30 hidden group-hover:flex" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditTask(task._id, task.description);
                                        }}
                                      >
                                        <span className="text-lg">✏️</span>
                                      </button>
                                      <button 
                                        className="btn btn-circle btn-sm bg-transparent border-none hover:bg-gray-200/30 hidden group-hover:flex" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteTask(task._id, task.completed);
                                        }}
                                      >
                                        <span className="text-lg">❌</span>
                                      </button>
                                    </>
                                  )}
                                </li>
                              </div>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Input box with sticky positioning */}
                {!initialLoading && selectedGroup != 3 && <div className="sticky bottom-6 flex justify-center w-full pb-4">
                  <div className="relative flex items-center w-3/5">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Add a new task..." 
                      maxLength={180}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTodo(e)}
                      className="input input-bordered w-full h-15 rounded-4xl bg-white/10 backdrop-blur-md focus:outline-none shadow-md pr-24"
                    />
                    <div className="absolute right-3 flex space-x-2">
                      {/* Date picker button and implementation */}

                      {selectedGroup === 4 && (
                        <button className="btn btn-circle btn-sm bg-transparent border-none hover:bg-gray-200/30"
                          onClick={(event) => {handleSendAssignments(event)}}
                        >
                          <Teammates size={18} />
                        </button>
                      )}

                      <div className="relative calendar-button">
                        {!newTodo.due ? (
                          <button 
                            className="btn btn-circle btn-sm bg-transparent border-none hover:bg-gray-200/30"
                            onClick={toggleDatePicker}
                          >
                            <span className="text-lg">📅</span>
                          </button>
                        ) : (
                          <button 
                            className="btn btn-sm bg-cyan-400/20 border-none hover:bg-cyan-400/30 rounded-md px-2 flex items-center"
                            onClick={toggleDatePicker}
                          >
                            <span className="text-sm mr-1">{formatDate(newTodo.due)}</span>
                            <span 
                              className="text-xs cursor-pointer"
                              onClick={clearSelectedDate}
                            >❌</span>
                          </button>
                        )}
                        {datePickerOpen && (
                          <div className="absolute bottom-10 right-0 z-50 date-picker-container">
                            <div className="bg-base-100 border border-base-300 shadow-lg rounded-box p-2">
                              <div className="p-2">
                                <input 
                                  type="date" 
                                  value={dateInput}
                                  onChange={handleDateChange}
                                  onClick={(e) => e.stopPropagation()}
                                  className="input input-bordered w-full date-input-field"
                                />
                                <div className="flex justify-between mt-2">
                                  <button 
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => setDatePickerOpen(false)}
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-primary"
                                    onClick={handleDateSelect}
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <button 
                        className="btn btn-circle btn-sm bg-transparent border-none hover:bg-gray-200/30"
                        onClick={() => {setNewTodo({...newTodo, important: !newTodo.important})}}
                      >
                        {newTodo.important ? <span className="text-lg">⭐</span> : <NotImportant />}  
                      </button>
                      <button 
                        className="btn btn-primary btn-sm rounded-full px-3"
                        onClick={(event) => {handleCreateTodo(event)}}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}