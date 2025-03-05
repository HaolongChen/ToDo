import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function SignIn() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const { login, error: authError, loading } = useAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const result = await login(formData);
      if (result) {
        navigate('/');
      }
    } catch (error) {
      // Improved error handling, removing console.error
      if (error.response && error.response.data) {
        setError(error.response.data.message || "Invalid credentials");
      } else {
        setError(authError || "Failed to sign in");
      }
    }
  }

  return (
    <div className="bg-gradient-to-br from-fuchsia-500 via-yellow-500 to-cyan-500 w-screen h-screen flex justify-center items-center">
      <div className="card w-[600px] h-[640px] rounded-4xl shadow-lg bg-white/30 backdrop-blur-md">
        <div className="card-body">
          <div className="justify-center flex-col ">
            <div className="my-3">
              <p className="text-[48px] text-center mt-10 text-gray-600">Sign In</p>
            </div>
            <div className="mt-9 mx-10">
              <form onSubmit={handleSubmit}>
                <div className=''>
                  <div><p className="text-3xl text-gray-600">Username</p></div>
                  <input type="text" required placeholder="Username" disabled={loading} className="input block w-115 h-16 rounded-[22px] mt-7 text-[20px] validator backdrop-blur-md bg-white/0 text-gray-600" value={ formData.username } onChange={(e) => {
                    setFormData({...formData, username: e.target.value});
                  }}></input>
                  {error && <div><p className="text-[16px] text-red-600">{error}</p></div>}
                </div>
                <div className={error ? 'mt-6' : 'mt-12'}>
                  <div><p className="text-3xl text-gray-600">Password</p></div>
                  <input type="password" required placeholder="Password" disabled={loading} className="input block w-115 h-16 rounded-[22px] mt-7 text-[20px] validator backdrop-blur-md bg-white/0 text-gray-600" title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" minLength={ 6 } value={ formData.password } onChange={(e) => {
                    setFormData({...formData, password: e.target.value});
                  }}></input>
                  <div><p><a href='/signup' className='text-[16px] text-gray-600 hover:underline hover:text-gray-700 hover:cursor-pointer'>Account already exists?</a></p></div>
                </div>
                <div className='mt-13 flex justify-center'>
                  <button type="submit" disabled={loading} className='btn btn-primary w-40 h-14 rounded-[22px] text-[18px] disabled:{loading}'>{loading ? 'loading...' : 'Sign in now'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}