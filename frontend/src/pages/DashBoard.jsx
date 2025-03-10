import { useEffect } from "react";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { FiMenu } from "react-icons/fi";
import { useState } from "react";
import { IoSunnyOutline } from "react-icons/io5";
import { CiStar } from "react-icons/ci";
import { CiUser } from "react-icons/ci";
import { CiCalendarDate } from "react-icons/ci";
import { Task } from "../components/Task";

export function DashBoard() {
  const { getAllGroups, groups, createTodo, user, loading, error, teammates, setGroups } = useAuth(); // Destructure what we need
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [todo, setTodo] = useState([]);
  const [newTodo, setNewTodo] = useState({
    description: "",
    completed: false,
    assigned: false,
    important: false,
    user: user._id,
  });
  
  useEffect(() => {
    getAllGroups();
    // console.log(groups);
  }, []);

  useEffect(() => {
    setTodo(groups[selectedGroup]?.todo || []);
  }, [groups, selectedGroup]);

  useEffect(() => {
    setNewTodo({...newTodo, description: inputValue});
  }, [inputValue]);

  const handleCreateTodo = async (event) => {
    event.preventDefault();
    // Get the current groupId directly instead of using state
    const currentGroupId = groups[selectedGroup]?._id;
    
    // Create a todo object with the current groupId
    const todoToCreate = {
      ...newTodo,
      groupId: currentGroupId
    };
    
    await createTodo(todoToCreate);
    
    setInputValue("");
    setGroups(prevGroups => {
      let updatedGroups = [...prevGroups];
      updatedGroups[selectedGroup] = {
        ...updatedGroups[selectedGroup],
        todo: [...(updatedGroups[selectedGroup].todo || []), todoToCreate]
      };
      return updatedGroups;
    });

    setNewTodo({
      description: "",
      completed: false,
      assigned: false,
      important: false,
      user: user._id, // Keep the user ID
    });
    
    console.log("Todo created");
    console.log(groups);
  }
  
  return (
    <>
      <div className="flex flex-col h-screen overflow-hidden">
        <NavBar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-row flex-1 h-full overflow-hidden">
            {drawerOpen && (
              <div className="flex-shrink-0 flex flex-col h-full overflow-y-auto overflow-x-hidden w-70">
                <ul className="bg-base-100 shadow-md w-full h-full">
                  <div className="h-14 px-8 flex items-center">
                    <FiMenu size={24} />
                    <div 
                      className="hover:bg-[#bcbcbc31] relative left-[-26px] w-7 h-7 rounded-[4px] hover:cursor-pointer" 
                      onClick={() => setDrawerOpen(!drawerOpen)}>
                    </div>
                  </div>
                  {groups.map((group, index) => (
                    <div key={group._id}>
                      <li 
                        className={`select-none list-row ${index === selectedGroup ? "hover:bg-[#bcbcbc31]" : "hover:bg-[#7f7f7f2b]"} hover:cursor-pointer rounded-box h-10 px-4 mx-4 text-[16px] flex items-center ${index === selectedGroup ? "bg-[#bcbcbc31]" : ""}`}
                        onClick={() => setSelectedGroup(index)}
                      >
                        {index == 0 && (<span className="text-lg mr-2">☀️</span>)}
                        {index == 1 && (<span className="text-lg mr-2">⭐</span>)}
                        {index == 2 && (<span className="text-lg mr-2">📅</span>)}
                        {index == 3 && (<span className="text-lg mr-2">👤</span>)}
                        {index > 3 && (<span className="text-lg mr-2"><Task /></span>)}
                        <p className="truncate">{group.name}</p>
                      </li>
                      {index == 3 && (
                        <>
                          <div className="h-3.5"></div>
                          <div className="bg-[#484644] h-[1px] w-[230px] mx-auto"></div>
                          <div className="h-3.5"></div>
                        </>
                      )}
                    </div>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex-1 bg-base-200 flex flex-col relative h-full w-full overflow-y-auto overflow-x-hidden">
              {/* Position menu absolutely when drawer is closed so it doesn't take vertical space */}
              {!drawerOpen && (
                <div className="absolute top-0 left-0 h-14 px-8 flex items-center z-10">
                  <FiMenu size={24} />
                  <div 
                    className="hover:bg-[#bcbcbc31] relative left-[-27px] w-7 h-7 rounded-[4px] hover:cursor-pointer" 
                    onClick={() => setDrawerOpen(!drawerOpen)}>
                  </div>
                </div>
              )}

              <div className={`select-none h-14 px-8 flex items-center ${drawerOpen ? "" : "translate-x-[60px]"}`}>
                {selectedGroup == 0 && (<span className="text-[24px] mr-2">☀️</span>)}
                {selectedGroup == 1 && (<span className="text-[24px] mr-2">⭐</span>)}
                {selectedGroup == 2 && (<span className="text-[24px] mr-2">📅</span>)}
                {selectedGroup == 3 && (<span className="text-[24px] mr-2">👤</span>)}
                {selectedGroup > 3 && (<span className="text-[24px] mr-2"><Task /></span>)}
                <span className="text-[24px]">{groups[selectedGroup]?.name}</span>
              </div>
              
              {/* Main content with consistent positioning */}
              <div className="flex-1 flex flex-col relative">
                <div className="flex-1 flex items-center justify-center">
                  <>
                    {(todo.length === 0) ? (
                      <div className="flex flex-col items-center">
                        <h1 className="text-6xl font-bold text-gray-800 select-none">Dashboard</h1>
                        <p className="mt-4 text-lg text-gray-600 select-none">Add tasks to get started</p>
                      </div>
                    ) : (
                      <div className="w-full h-full">
                        {/* Your tasks content here */}
                      </div>
                    )}
                  </>
                </div>
                
                {/* Input box with sticky positioning */}
                <div className="sticky bottom-6 flex justify-center w-full pb-4">
                  <div className="relative flex items-center w-3/5">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Add a new task..." 
                      maxLength={180}
                      className="input input-bordered w-full h-15 rounded-4xl bg-white/10 backdrop-blur-md focus:outline-none shadow-md pr-24"
                    />
                    <div className="absolute right-3 flex space-x-2">
                      <button 
                        className="btn btn-circle btn-sm bg-transparent border-none hover:bg-gray-200/30"
                        onClick={() => {/* Your action here */}}
                      >
                        <span className="text-lg">📅</span>
                      </button>
                      <button 
                        className="btn btn-circle btn-sm bg-transparent border-none hover:bg-gray-200/30"
                        onClick={() => {/* Your action here */}}
                      >
                        <span className="text-lg">⭐</span>
                      </button>
                      <button 
                        className="btn btn-primary btn-sm rounded-full px-3"
                        onClick={(event) => {handleCreateTodo(event)}}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}