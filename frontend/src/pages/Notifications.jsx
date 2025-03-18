import { useAuth } from "../context/AuthContext"
import { useEffect } from "react";
import { LoadingIcon } from "../components/LoadingIcon";
import toast, { Toaster } from "react-hot-toast";

export const Notifications = () => {
    const { user, notifications, acceptRequest, rejectRequest, deleteWaitlist, loading, error, getNotifications, getRequests } = useAuth();
    useEffect(() => {
        async function loadNotifications() {
            await getNotifications();
            await getRequests();
        }
        loadNotifications();
    }, []);

    return (
        <div>
            {loading ? <LoadingIcon /> : notifications.map(notification => (
                <div key={notification.id}>
                    notification: {notification.message}
                    <div className="flex justify-between">
                        <button onClick={() => acceptRequest(notification.id)}>Accept</button>
                        <button onClick={() => rejectRequest(notification.id)}>Reject</button>
                        <button onClick={() => deleteWaitlist(notification.id)}>Delete</button>
                    </div>
                </div>
            ))}
            {error && <p>{error}</p>}
        </div>
    );
}