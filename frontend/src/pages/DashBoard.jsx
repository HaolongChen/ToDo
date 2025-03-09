import { useEffect } from "react";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { FiMenu } from "react-icons/fi";
import { useState } from "react";
import { IoSunnyOutline } from "react-icons/io5";
import { CiStar } from "react-icons/ci";
import { CiUser } from "react-icons/ci";
import { CiCalendarDate } from "react-icons/ci";

export function DashBoard() {
  const { getAllGroups, groups } = useAuth(); // Destructure what we need
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(0);

  
  
  useEffect(() => {
    getAllGroups();
  }, []); // Add getAllGroups to dependency array if needed
  
  return (
    <>
        <div className="z-50"><NavBar /></div>
        <div className="flex flex-col h-screen z-10">
          <div className="h-14"></div>
          <div className="flex flex-row flex-1 ">
            {drawerOpen && (
              <div className="flex flex-col">
                <ul className="bg-base-100 rounded-box shadow-md w-70 h-full">
                  <div className="h-14 px-8 flex items-center">
                    <FiMenu size={24} />
                    <div 
                      className="hover:bg-[#bcbcbc31] relative left-[-26px] w-7 h-7 rounded-[4px] hover:cursor-pointer" 
                      onClick={() => setDrawerOpen(!drawerOpen)}>
                    </div>
                  </div>
                  {groups.map((group, index) => (
                    <>
                      <li 
                        key={group._id}
                        className={`select-none list-row ${index === selectedGroup ? "hover:bg-[#bcbcbc31]" : "hover:bg-[#7f7f7f2b]"} hover:cursor-pointer rounded-box h-10 px-4 mx-4 text-[16px] flex items-center ${index === selectedGroup ? "bg-[#bcbcbc31]" : ""}`}
                        onClick={() => setSelectedGroup(index)}
                      >
                        {index == 0 && (<IoSunnyOutline size={24} className="mr-2" />)}
                        {index == 1 && (<CiStar size={24} className="mr-2" />)}
                        {index == 2 && (<CiCalendarDate size={24} className="mr-2" />)}
                        {index == 3 && (<CiUser size={24} className="mr-2" />)}
                        <a>{group.name}</a>
                      </li>
                      {index == 3 && (
                        <>
                          <div className="h-3.5"></div>
                          <div className="bg-[#484644] h-[1px] w-[230px] mx-auto"></div>
                          <div className="h-3.5"></div>
                        </>
                      )}
                    </>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex-1 bg-base-200 flex flex-col relative">
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
              
              {/* Main content with consistent positioning */}
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  {(groups[selectedGroup]?.todo.length === 0) ? (
                    <>
                      <h1 className="text-6xl font-bold text-gray-800 select-none">Dashboard</h1>
                      <p className="mt-4 text-lg text-gray-600 select-none">Add tasks to get started</p>
                    </>
                  ) : (
                    <div className="w-full h-full">
                      {/* Your tasks content here */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}