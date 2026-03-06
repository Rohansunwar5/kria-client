import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { Role, fetchProfile } from '../../store/slices/authSlice';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    allowedRoles: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { accessToken, role, user, isLoading } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const location = useLocation();
    const profileFetched = useRef(false);

    // Rehydrate user on refresh: token exists but user was lost from Redux
    useEffect(() => {
        if (accessToken && !user && !isLoading && !profileFetched.current) {
            profileFetched.current = true;
            dispatch(fetchProfile());
        }
    }, [accessToken, user, isLoading, dispatch]);

    // Not logged in at all -> send to login page
    if (!accessToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Still rehydrating user after a refresh — show spinner
    if (!user && isLoading) {
        return (
            <div className="min-h-screen bg-[#111] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Finished logging in, but they're trying to access a page outside of their role
    if (role && !allowedRoles.includes(role)) {
        // Route them back to their respective home
        return <Navigate to={`/${role}/home`} replace />;
    }

    // Role is allowed and accessToken exists, render child routes
    return <Outlet />;
};
