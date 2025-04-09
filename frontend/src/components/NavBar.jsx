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