import { useAuth } from "../context/AuthContext"
import { useEffect, useState } from "react";
import { LoadingIcon } from "../components/LoadingIcon";
import toast, { Toaster } from "react-hot-toast";
import { NavBar } from "../components/NavBar";
import { DefaultAvatar } from "../components/DefaultAvatar";
import { useNavigate } from "react-router-dom";

export const Notifications = () => {
    const { user, notifications, requests, acceptRequest, rejectRequest, deleteWaitlist, loading, error, getNotifications, getRequests, getUserInfo } = useAuth();
    const navigate = useNavigate();
    const [initLoading, setInitLoading] = useState(true);

    useEffect(() => {
        async function loadNotifications() {
            try {
                await getNotifications();
                await getRequests();
            } catch (error) {
                console.error("Error loading notifications:", error);
                toast.error("Failed to load notifications");
            }
        }
        loadNotifications();
    }, []);

    useEffect(() => {
        if(initLoading && !loading) {
            setInitLoading(false);
        }
        if (error) {
            toast.error("An error occurred while loading notifications.");
        }
    }, [loading, error]);

    // Handle accepting a request
    const handleAcceptRequest = async (requestId) => {
        try {
            await toast.promise(
                acceptRequest(requestId),
                {
                    loading: 'Accepting request...',
                    success: 'Request accepted successfully!',
                    error: 'Failed to accept request.'
                }
            );
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    // Handle rejecting a request
    const handleRejectRequest = async (requestId) => {
        try {
            await toast.promise(
                rejectRequest(requestId),
                {
                    loading: 'Rejecting request...',
                    success: 'Request rejected.',
                    error: 'Failed to reject request.'
                }
            );
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    };

    // Handle deleting a notification
    const handleDeleteNotification = async (notificationId) => {
        try {
            await toast.promise(
                deleteWaitlist(notificationId),
                {
                    loading: 'Deleting notification...',
                    success: 'Notification deleted.',
                    error: 'Failed to delete notification.'
                }
            );
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Toaster />
            <NavBar />
            <div className="flex-1 bg-base-200 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Notifications</h1>
                    
                    {initLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingIcon />
                        </div>
                    ) : (
                        <>
                            {/* Requests Section */}
                            {requests && requests.length > 0 ? (
                                <div className="bg-base-100 rounded-box p-6 shadow-md mb-6">
                                    <h2 className="text-xl font-semibold mb-4">Team Requests</h2>
                                    <div className="space-y-4">
                                        {requests.map((request) => (
                                            <div key={request._id} className="flex items-center justify-between bg-base-200 p-4 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="w-12 h-12 rounded-full hover:cursor-pointer" onClick={() => navigate(`/user/${request.fromUser?._id || request.fromUser}`)}>
                                                            {request.fromUser?.coverImg ? (
                                                                <img src={request.fromUser.coverImg} alt={request.fromUser.username} />
                                                            ) : (
                                                                <DefaultAvatar username={request.fromUser?.username || "User"} size={48} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span 
                                                                className="font-medium cursor-pointer hover:underline"
                                                                onClick={() => navigate(`/user/${request.fromUser?._id || request.fromUser}`)}
                                                            >
                                                                {request.fromUser?.username || "User"}
                                                            </span>
                                                            <span className="text-sm opacity-70">wants to add you to their team</span>
                                                        </div>
                                                        <div className="text-xs opacity-60 mt-1">
                                                            {formatDate(request.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {!request.isProcessed && (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleAcceptRequest(request._id)}
                                                        >
                                                            <span className="mr-1">✓</span> Accept
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-error"
                                                            onClick={() => handleRejectRequest(request._id)}
                                                        >
                                                            <span className="mr-1">✗</span> Reject
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                {request.isProcessed && (
                                                    <div className="badge badge-secondary">Processed</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {/* Notifications Section */}
                            {notifications && notifications.length > 0 ? (
                                <div className="bg-base-100 rounded-box p-6 shadow-md">
                                    <h2 className="text-xl font-semibold mb-4">Your Notifications</h2>
                                    <div className="space-y-4">
                                        {notifications.map((notification) => (
                                            <div key={notification._id} className="flex items-center justify-between bg-base-200 p-4 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="w-12 h-12 rounded-full">
                                                            {notification.fromUser?.coverImg ? (
                                                                <img src={notification.fromUser.coverImg} alt={notification.fromUser.username} />
                                                            ) : (
                                                                <DefaultAvatar username={notification.fromUser?.username || "User"} size={48} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span 
                                                                className="font-medium cursor-pointer hover:underline"
                                                                onClick={() => navigate(`/user/${notification.fromUser?._id}`)}
                                                            >
                                                                {notification.fromUser?.username || "User"}
                                                            </span>
                                                            <span className="text-sm opacity-70">
                                                                {notification.message || "sent you a notification"}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs opacity-60 mt-1">
                                                            {formatDate(notification.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() => handleDeleteNotification(notification._id)}
                                                    title="Delete notification"
                                                >
                                                    <span className="text-lg">×</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {/* Empty State */}
                            {(!requests || requests.length === 0) && (!notifications || notifications.length === 0) && (
                                <div className="bg-base-100 rounded-box p-12 shadow-md text-center">
                                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <h3 className="mt-4 text-lg font-medium text-gray-500">No notifications</h3>
                                    <p className="mt-2 text-sm text-gray-400">
                                        You don't have any notifications right now.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                    
                    {error && (
                        <div className="bg-error text-error-content p-4 rounded-lg mt-4">
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}