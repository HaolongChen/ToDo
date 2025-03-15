import { useAuth } from "../context/AuthContext";
import { DefaultAvatar } from "./DefaultAvatar"
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const Avatar = ({size}) => {
    const { user, loading, error } = useAuth();
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        setInitialLoading(false);
    }, [loading]);

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
                    <div className="avatar">
                        <div className="ring-primary ring-offset-base-100 rounded-full ring ring-offset-2">
                            <DefaultAvatar size={size} alt="Default Avatar" />
                        </div>
                    </div>
                )}
            </div>)}
        </div>
    );
}