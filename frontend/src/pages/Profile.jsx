import { useState, useEffect, useRef } from "react";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { DefaultAvatar } from "../components/DefaultAvatar";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function Profile() {
  const navigate = useNavigate();
  const { user, loading, error, changePassword, getUserInfo, uploadImage, logout, updateUserProfile } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ unit: '%', width: 100, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [teammates, setTeammates] = useState([]);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    if (user && user._id) {
      getUserInfo(user._id);
      setEmail(user.email || "");
      setBio(user.bio || "");
      // Fetch teammate details when user data is available
      if (user.team && user.team.length > 0) {
        fetchTeammateDetails();
      }
    }
  }, [user]);

  const fetchTeammateDetails = async () => {
    try {
      const teammatePromises = user.team.map(teammateId => 
        axios.get(`/api/search/user/${teammateId}`)
      );
      const responses = await Promise.all(teammatePromises);
      const teammateData = responses.map(response => response.data);
      setTeammates(teammateData);
    } catch (error) {
      console.error('Error fetching teammate details:', error);
    }
  };

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
  }, [completedCrop]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setSuccessMessage("");
    
    try {
      // await changePassword(oldPassword, newPassword);
      toast.promise(
        changePassword(oldPassword, newPassword),
        {
          loading: 'Changing your password...',
          success: 'Password changed successfully!',
          error: 'Error changing password. Please try again.'
        }
      );
      setSuccessMessage("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Failed to change password");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = () => {
    if (!previewCanvasRef.current) {
      return null;
    }
    
    // Return the cropped image as a data URL
    const croppedImageUrl = previewCanvasRef.current.toDataURL('image/jpeg');
    return croppedImageUrl;
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!completedCrop) return;
    
    setIsUploading(true);
    try {
      // Get the cropped image
      const croppedImageUrl = getCroppedImg();
      if (!croppedImageUrl) {
        throw new Error('Could not crop image');
      }
      
      // Extract the base64 data from the croppedImageUrl
      const base64Image = croppedImageUrl.split(',')[1];
      
      // Pass just the base64 string to the uploadImage function
      // await uploadImage(base64Image);

      toast.promise(
        uploadImage(base64Image),
        {
          loading: 'Uploading your image...',
          success: 'Image uploaded successfully!',
          error: 'Error uploading image. Please try again.'
        }
      );
      
      // Clear the form after successful upload
      setSuccessMessage("Profile picture updated successfully");
      setImageFile(null);
      setImagePreview(null);
      setShowCropper(false);
      setCompletedCrop(null);
      setIsUploading(false);
    } catch (error) {
      setImageError(error.response?.data?.message || "Failed to upload image");
      setIsUploading(false);
    }
  };

  const cancelCrop = () => {
    setImageFile(null);
    setImagePreview(null);
    setShowCropper(false);
    setCompletedCrop(null);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await toast.promise(
        updateUserProfile({ email, bio }),
        {
          loading: 'Updating profile...',
          success: 'Profile updated successfully!',
          error: 'Error updating profile. Please try again.'
        }
      );
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Calculate task completion percentage
  const taskPercentage = user && user.totalTasks > 0
    ? Math.round((user.completedTasks / user.totalTasks) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 bg-base-200 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-base-100 rounded-box p-6 shadow-md mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="avatar">
                <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-2">
                  {user?.coverImg ? (
                    <img src={user.coverImg} alt="Profile" />
                  ) : (
                    <DefaultAvatar size={128} />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{user?.username || "User"}</h1>
                {!isEditingProfile ? (
                  <div className="space-y-2">
                    <p className="text-sm opacity-70">{user?.email || "No email added"}</p>
                    <p className="text-base">{user?.bio || "No bio added"}</p>
                    <button 
                      className="btn btn-primary btn-sm mt-2"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Edit Profile Info
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="form-control">
                      <input 
                        type="email" 
                        className="input input-bordered w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="form-control">
                      <textarea 
                        className="textarea textarea-bordered w-full"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-sm"
                      >
                        Save Changes
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEmail(user?.email || "");
                          setBio(user?.bio || "");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                <p className="text-gray-500 text-sm mt-4">Account created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* User Stats and Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-base-100 rounded-box p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Task Statistics</h2>
              <div className="stats shadow w-full">
                <div className="stat">
                  <div className="stat-title">Total Tasks</div>
                  <div className="stat-value">{user?.totalTasks}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Completed</div>
                  <div className="stat-value text-success">{user?.completedTasks}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Pending</div>
                  <div className="stat-value text-warning">{user?.totalTasks - user?.completedTasks}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
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
            </div>

            {/* Team Members */}
            <div className="bg-base-100 rounded-box p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Team Members</h2>
              {teammates.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {teammates.map(member => (
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
              ) : (
                <p className="text-gray-500">No team members yet</p>
              )}
            </div>
          </div>

          {/* Profile Picture Update */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-base-100 rounded-box p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Update Profile Picture</h2>
              
              {!showCropper ? (
                <form>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Choose an image</span>
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="file-input file-input-bordered w-full" 
                      onChange={handleImageChange}
                    />
                  </div>
                </form>
              ) : (
                <div>
                  <div className="mb-4">
                    <p className="text-sm mb-2">
                      Select a circular area for your profile picture. Drag the circle to position it correctly over your image.
                    </p>
                    <div className="crop-container border rounded-lg p-2 overflow-hidden">
                      <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={1}
                        circularCrop
                      >
                        <img
                          ref={imgRef}
                          src={imagePreview}
                          alt="Upload preview"
                          style={{ maxHeight: '300px' }}
                        />
                      </ReactCrop>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm mb-2">Preview of your profile picture:</p>
                    <div className="flex justify-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
                        <canvas
                          ref={previewCanvasRef}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '50%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button 
                      className="btn btn-primary flex-1"
                      onClick={handleImageUpload}
                      disabled={!completedCrop || isUploading}
                    >
                      {isUploading ? "Uploading..." : "Save Profile Picture"}
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={cancelCrop}
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {imageError && (
                <div className="text-error mt-2">{imageError}</div>
              )}
            </div>

            {/* Password Change */}
            <div className="bg-base-100 rounded-box p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Current Password</span>
                  </label>
                  <input 
                    type="password" 
                    className="input input-bordered"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">New Password</span>
                  </label>
                  <input 
                    type="password" 
                    className="input input-bordered"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500">Password must be at least 6 characters</span>
                  </label>
                </div>
                
                {passwordError && (
                  <div className="text-error mt-2">{passwordError}</div>
                )}
                
                <button 
                  type="submit" 
                  className="btn btn-primary mt-4"
                  disabled={!oldPassword || !newPassword}
                >
                  Change Password
                </button>
              </form>
            </div>
          </div>

          <Toaster />
          <div className="mt-6 flex items-center justify-center">
            <button className="btn btn-outline btn-error w-full rounded-2xl" onClick={() => {logout()}}>Sign out</button>
          </div>
        </div>
      </div>
    </div>
  );
}