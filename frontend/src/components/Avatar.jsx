import { useAuth } from "../context/AuthContext";
import { DefaultAvatar } from "./DefaultAvatar"
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { set } from "mongoose";

export const Avatar = ({size}) => {
    const { user, loading, error } = useAuth();
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        // More robust loading handling:
        // 1. Show skeleton on first render
        // 2. Continue showing skeleton while auth is loading
        // 3. Once loading is done, check if we have user data
        // if (loading) {
        //     setInitialLoading(true);
        // } else if (user) {
        //     // We have user data and loading is done
        //     setInitialLoading(false);
        // }
        if(!initialLoading) return;
        if(!loading && user){
            setInitialLoading(false);
        }
    }, [loading, user]);

    const navigate = useNavigate();
    
    return (
        <div>
            {initialLoading ? (
                <div className="skeleton shrink-0 rounded-full" style={{ width: size, height: size }}></div>
            ) : (<div className="hover:cursor-pointer" onClick={() => navigate('/profile')}>
                {user.coverImg ? (
                    <div className="avatar">
                        <div className="ring-primary ring-offset-base-100 rounded-full ring ring-offset-2">
                            <img src={user.coverImg} alt="User Cover" style={{ width: size, height: size }} />
                        </div>
                    </div>
                ) : (
                    <DefaultAvatar username={user.username} size={size} />
                )}
            </div>)}
        </div>
    );
}