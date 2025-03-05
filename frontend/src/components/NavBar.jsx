import { useNavigate } from 'react-router-dom';

export function NavBar() {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 w-full shadow-md h-14 justify-between items-center flex flex-row">
      <div className="flex justify-start items-center flex-row space-x-4">
        <div></div>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 64 64" onClick={() => navigate('/')}>
          <rect x="8" y="12" width="48" height="44" rx="4" fill="#f9f9f9" stroke="#e0e0e0" strokeWidth="2"/>
          <rect x="20" y="4" width="24" height="12" rx="2" fill="#f9f9f9" stroke="#e0e0e0" strokeWidth="2"/>
          <path d="M22 34 L30 42 L42 26" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex justify-end items-center flex-row">
      </div>
    </div>
  );
}