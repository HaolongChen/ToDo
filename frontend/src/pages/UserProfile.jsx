import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../utils/api';
import { LoadingIcon } from '../components/LoadingIcon';
import { DefaultAvatar } from '../components/DefaultAvatar';

export function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setLoading(true);
        const userData = await getUserProfile(userId);
        setUser(userData);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [userId]);

  // Calculate task completion percentage
  const taskPercentage = user && user.totalTasks > 0
    ? Math.round((user.completedTasks / user.totalTasks) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingIcon size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-error mb-4">{error}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-lg mb-4">User not found</p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* User Avatar */}
            <div className="avatar">
              <div className="w-32 h-32 rounded-full">
                {user.coverImg ? (
                  <img src={user.coverImg} alt={user.username} />
                ) : (
                  <DefaultAvatar username={user.username} size={128} />
                )}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{user.username}</h1>
              {user.email && (
                <p className="text-sm opacity-70 mt-1">{user.email}</p>
              )}
              {user.bio && (
                <p className="mt-4">{user.bio}</p>
              )}
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Tasks</div>
              <div className="stat-value">{user.totalTasks}</div>
              <div className="stat-desc">Total tasks created</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Completed</div>
              <div className="stat-value">{user.completedTasks}</div>
              <div className="stat-desc">Tasks completed</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Teams</div>
              <div className="stat-value">{user.totalTeams}</div>
              <div className="stat-desc">Team memberships</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Task Completion</span>
              <span className="text-sm font-medium">{taskPercentage}%</span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${taskPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Team Members */}
          {user.team && user.team.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Team Members</h2>
              <div className="flex flex-wrap gap-3">
                {user.team.map(member => (
                  <div 
                    key={member._id} 
                    className="flex items-center gap-2 bg-base-200 p-2 rounded-lg cursor-pointer hover:bg-base-300 transition-colors"
                    onClick={() => navigate(`/user/${member._id}`)}
                  >
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full">
                        {member.coverImg ? (
                          <img src={member.coverImg} alt={member.username} />
                        ) : (
                          <DefaultAvatar username={member.username} size={32} />
                        )}
                      </div>
                    </div>
                    <span>{member.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back button */}
          <div className="mt-8 flex justify-center">
            <button 
              className="btn btn-primary" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}