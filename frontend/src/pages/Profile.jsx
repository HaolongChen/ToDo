import { useState, useEffect, useRef } from "react";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { DefaultAvatar } from "../components/DefaultAvatar";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export function Profile() {
  const { user, loading, error, changePassword, getUserInfo, uploadImage } = useAuth();
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
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  
  useEffect(() => {
    // Get user info if needed
    if (user && user._id) {
      getUserInfo(user._id);
    }
  }, [user]);

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
      await changePassword(oldPassword, newPassword);
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
      await uploadImage(base64Image);
      
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

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 bg-base-200 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-base-100 rounded-box p-6 shadow-md mb-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-4 md:mb-0 md:mr-6">
                {user?.coverImg ? (
                  <img 
                    src={user.coverImg} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full ring ring-primary ring-offset-2"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-2 flex items-center justify-center overflow-hidden">
                    <DefaultAvatar size={128} />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user?.username || "User"}</h1>
                <p className="text-gray-500">Account created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Picture Update */}
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

          {/* Task Statistics */}
          <div className="bg-base-100 rounded-box p-6 shadow-md mt-6">
            <h2 className="text-xl font-semibold mb-4">Your Activity</h2>
            <div className="stats shadow w-full">
              <div className="stat">
                <div className="stat-title">Total Tasks</div>
                <div className="stat-value">{user?.totalTasks || 0}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Completed</div>
                <div className="stat-value text-success">{user?.completedTasks || 0}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Pending</div>
                <div className="stat-value text-warning">{user?.pendingTasks || 0}</div>
              </div>
            </div>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success mt-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{successMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}