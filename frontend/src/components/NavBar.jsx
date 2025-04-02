import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Avatar } from './Avatar';
import { searchItems } from '../utils/api';
import debounce from 'lodash.debounce';
import { DefaultAvatar } from './DefaultAvatar';
import { Bell } from './Bell';
import { BellWithRedDot } from './BellWithRedDot';
import { useAuth } from '../context/AuthContext';

export function NavBar() {
  const { notifications, requests } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [search, setSearch] = useState({
    query: "",
    userResult: [],
    todoResult: [],
    groupResult: []
  });
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  // Handle clicks outside of the search dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce search function to prevent too many API calls
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearch(prev => ({
          ...prev,
          userResult: [],
          todoResult: [],
          groupResult: []
        }));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const results = await searchItems(query);
        setSearch(prev => ({
          ...prev,
          userResult: results.users || [],
          todoResult: results.todos || [],
          groupResult: results.groups || []
        }));
        setShowResults(true);
        setError('');
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(prev => ({ ...prev, query }));
    debouncedSearch(query);
  };

  // Navigate to appropriate page on item click
  const handleItemClick = (type, id) => {
    setShowResults(false);
    
    switch (type) {
      case 'user':
        navigate(`/user/${id}`);
        break;
      case 'todo':
        navigate(`/dashboard?highlight=todo-${id}`);
        break;
      case 'group':
        navigate(`/dashboard?highlight=group-${id}`);
        break;
      default:
        break;
    }
  };

  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 w-full shadow-md h-14 justify-between items-center flex flex-row z-50 backdrop-blur-md bg-base-100/80">
        <div className="flex justify-start items-center flex-row space-x-4">
          <div></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 64 64" onClick={() => navigate('/')}>
            <rect x="8" y="12" width="48" height="44" rx="4" fill="#f9f9f9" stroke="#e0e0e0" strokeWidth="2"/>
            <rect x="20" y="4" width="24" height="12" rx="2" fill="#f9f9f9" stroke="#e0e0e0" strokeWidth="2"/>
            <path d="M22 34 L30 42 L42 26" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className='flex justify-center items-center relative' ref={searchRef}>
          <label className="input rounded-[20px] w-120">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input 
              type="search" 
              value={search.query} 
              placeholder="Search users, groups, todos..." 
              onChange={handleSearchChange}
              onClick={() => search.query && setShowResults(true)}
            />
            {loading && <span className="loading loading-spinner loading-xs absolute right-3 top-1/2 transform -translate-y-1/2"></span>}
          </label>
          
          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-1 w-full bg-base-100 shadow-lg rounded-md z-50 max-h-96 overflow-y-auto">
              {/* Users section */}
              {search.userResult.length > 0 && (
                <div className="border-b border-base-300">
                  <div className="p-2 font-semibold text-sm opacity-70">Users</div>
                  <ul>
                    {search.userResult.map(user => (
                      <li 
                        key={user._id}
                        className="p-2 hover:bg-base-200 cursor-pointer flex items-center"
                        onClick={() => handleItemClick('user', user._id)}
                      >
                        <div className="avatar mr-2">
                          <div className="w-8 rounded-full">
                            {/* <img src={user.coverImg || '/default-avatar.png'} alt={user.username} /> */}
                            {user.coverImg ? (
                              <img src={user.coverImg} alt={user.username} />
                            ) : (
                              <DefaultAvatar username={user.username} size={32} />
                            )}
                          </div>
                        </div>
                        <span>{user.username}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Groups section */}
              {search.groupResult.length > 0 && (
                <div className="border-b border-base-300">
                  <div className="p-2 font-semibold text-sm opacity-70">Groups</div>
                  <ul>
                    {search.groupResult.map(group => (
                      <li 
                        key={group._id}
                        className="p-2 hover:bg-base-200 cursor-pointer flex items-center"
                        onClick={() => handleItemClick('group', group._id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span>{group.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Todos section */}
              {search.todoResult.length > 0 && (
                <div>
                  <div className="p-2 font-semibold text-sm opacity-70">Tasks</div>
                  <ul>
                    {search.todoResult.map(todo => (
                      <li 
                        key={todo._id}
                        className="p-2 hover:bg-base-200 cursor-pointer flex items-center"
                        onClick={() => handleItemClick('todo', todo._id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>{todo.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* No results message */}
              {search.query && 
               !loading && 
               search.userResult.length === 0 && 
               search.todoResult.length === 0 && 
               search.groupResult.length === 0 && (
                <div className="p-4 text-center text-base-content opacity-70">
                  No results found
                </div>
              )}
              
              {/* Error message */}
              {error && (
                <div className="p-4 text-center text-error">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className='flex justify-end items-center space-x-4'>
          <label className="swap swap-rotate">
            <input 
              type="checkbox" 
              className="theme-controller" 
              onChange={toggleTheme}
              checked={theme === 'dark'}
            />
            {/* sun icon */}
            <svg
              className="swap-off h-8 w-8 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24">
              <path
                d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>

            {/* moon icon */}
            <svg
              className="swap-on h-8 w-8 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24">
              <path
                d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>
          <button className='hover:cursor-pointer notification-button' onClick={() => navigate('/notifications')}>{notifications.length > 0 || requests.length > 0 ? (<BellWithRedDot className="w-6 h-6" />) : (<Bell className="w-6 h-6" />)}</button>
          <Avatar size={32} />
          <div></div>
        </div>
      </div>
      {/* Add a spacer div to prevent content from moving up under the navbar */}
      <div className="h-14 w-full"></div>
    </>
  );
}