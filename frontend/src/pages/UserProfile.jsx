import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../utils/api';
import { LoadingIcon } from '../components/LoadingIcon';
import { DefaultAvatar } from '../components/DefaultAvatar';
import { NavBar } from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [otherUser, setOtherUser] = useState(null);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, sendAssignment, sendRequest, removeFromTeam, teammates: authTeammates } = useAuth();

  // Load other user's profile data
  useEffect(() => {
    async function loadUserProfile() {
      try {
        setInitLoading(true);
        const userData = await getUserProfile(userId);
        setOtherUser(userData);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load user profile.');
      } finally {
        setInitLoading(false);
      }
    }

    loadUserProfile();
  }, [userId]);

  // Reload profile when actions are taken
  const handleSendRequest = async () => {
    try {
      await toast.promise(
        sendRequest(otherUser._id), 
        {
          loading: 'Sending request...',
          success: 'Request sent',
          error: 'Failed to send request'
        }
      );
      
      // Force re-load of other user profile to get updated relationship status
      const userData = await getUserProfile(userId);
      setOtherUser(userData);
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  // Handle removing from team
  const handleRemoveFromTeam = async () => {
    try {
      await toast.promise(
        removeFromTeam(otherUser._id),
        {
          loading: 'Removing from team...',
          success: 'User removed from team',
          error: 'Failed to remove user from team'
        }
      );
      
      // Force re-load of other user profile to get updated relationship status
      const userData = await getUserProfile(userId);
      setOtherUser(userData);
    } catch (error) {
      console.error('Error removing from team:', error);
    }
  };

  // Calculate task completion percentage
  const taskPercentage = otherUser && otherUser.totalTasks > 0
    ? Math.round((otherUser.completedTasks / otherUser.totalTasks) * 100)
    : 0;

  // Helper function to check if a request is pending
  const hasPendingRequest = () => {
    if (!user || !user.pendingTeam || !otherUser) return false;
    return user.pendingTeam.some(request => request.userId === otherUser._id);
  };

  // Helper function to check if users are teammates
  const isTeammate = () => {
    if (!user || !user.team || !otherUser) return false;
    return user.team.includes(otherUser._id);
  };

  if (initLoading) {
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
  

  if (!otherUser) {
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
    <>
    <NavBar />
    <Toaster />
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* User Avatar */}
            <div className="avatar">
              <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-2">
                {otherUser.coverImg ? (
                  <img src={otherUser.coverImg} alt={otherUser.username} />
                ) : (
                  <DefaultAvatar username={otherUser.username} size={128} />
                )}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{otherUser.username}</h1>
              <div className="space-y-2">
                <p className="text-sm opacity-70">{otherUser.email || "No email added"}</p>
                <p className="text-base">{otherUser.bio || "No bio added"}</p>
              </div>
              
              {/* Team relationship actions */}
              {hasPendingRequest() ? (
                <div className="mt-4">
                  <button 
                    className="btn btn-secondary" 
                    disabled
                  >
                    Request Sent
                  </button>
                </div>
              ) : isTeammate() ? (
                <div className="mt-4">
                  <button 
                    className="btn btn-error" 
                    onClick={handleRemoveFromTeam}
                  >
                    Remove from Team
                  </button>
                </div>
              ) : user._id !== otherUser._id ? (
                <div className="mt-4">
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSendRequest}
                  >
                    Add to Team
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Tasks</div>
              <div className="stat-value">{otherUser.totalTasks}</div>
              <div className="stat-desc">Total tasks created</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Completed</div>
              <div className="stat-value">{otherUser.completedTasks}</div>
              <div className="stat-desc">Tasks completed</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Teams</div>
              <div className="stat-value">{otherUser.totalTeams}</div>
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
                className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${taskPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Team Members */}
          {otherUser.team && otherUser.team.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Team Members</h2>
              <div className="flex flex-wrap gap-3">
                {otherUser.team.map(teammateId => {
                  // First try to find the teammate in the pre-fetched authTeammates
                  const authTeammate = authTeammates?.find(t => t._id === teammateId);
                  // If found in pre-fetched data, use that (improves performance)
                  // If not found, fall back to using data from otherUser.team
                  const memberData = authTeammate || 
                    (typeof teammateId === 'object' ? teammateId : { _id: teammateId });
                  
                  return (
                    <div 
                      key={memberData._id} 
                      className="flex items-center gap-2 bg-base-200 p-2 rounded-lg cursor-pointer hover:bg-base-300 transition-colors"
                      onClick={() => navigate(`/user/${memberData._id}`)}
                    >
                      <div className="avatar">
                        <div className="w-8 h-8 rounded-full">
                          {memberData.coverImg ? (
                            <img src={memberData.coverImg} alt={memberData.username} />
                          ) : (
                            <DefaultAvatar username={memberData.username || "User"} size={32} />
                          )}
                        </div>
                      </div>
                      <span>{memberData.username || "User"}</span>
                    </div>
                  );
                })}
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
    </>
  );
}