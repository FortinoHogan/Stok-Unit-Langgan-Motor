
import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { routes, routePaths } from "@/constants/paths";
import { UserService } from "@/helpers/services/UserService";
import { useAuthStore } from "@/helpers/store/useAuthStore/useAuthStore";
import { supabase } from "@/helpers/supabase/client";
import LoginPage from "@/views/auth-page/LoginPage";
import NotFoundPage from "@/views/not-foundpage/NotFoundPage";

function ProtectedRoute({
    isAuthenticated,
    isReady,
}: {
    isAuthenticated: boolean;
    isReady: boolean;
}) {
    if (!isReady) {
        return <div>Checking session...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to={routes.login} replace />;
    }

    return <Outlet />;
}

function GuestRoute({
    isAuthenticated,
    isReady,
}: {
    isAuthenticated: boolean;
    isReady: boolean;
}) {
    if (!isReady) {
        return <div>Checking session...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to={routes.home} replace />;
    }

    return <Outlet />;
}

export default function AppRouter() {
    const authenticatedUser = useAuthStore((state) => state.authenticatedUser);
    const setAuthenticatedUser = useAuthStore(
        (state) => state.setAuthenticatedUser,
    );
    const clearAuthenticatedUser = useAuthStore(
        (state) => state.clearAuthenticatedUser,
    );
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const syncAuthState = async (email?: string) => {
            if (!email) {
                clearAuthenticatedUser();
                setIsReady(true);
                return;
            }

            const userResponse = await UserService.getUserByEmail(email);

            if (!userResponse.data) {
                clearAuthenticatedUser();
                setIsReady(true);
                return;
            }

            setAuthenticatedUser(userResponse.data);
            setIsReady(true);
        };

        const initializeAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            await syncAuthState(session?.user?.email);
        };

        void initializeAuth();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                void syncAuthState(session?.user?.email);
            },
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, [clearAuthenticatedUser, setAuthenticatedUser]);

    return (
        <Router>
            <Routes>
                <Route
                    element={
                        <GuestRoute
                            isAuthenticated={Boolean(authenticatedUser)}
                            isReady={isReady}
                        />
                    }
                >
                    <Route path={routes.login} element={<LoginPage />} />
                </Route>

                <Route
                    element={
                        <ProtectedRoute
                            isAuthenticated={Boolean(authenticatedUser)}
                            isReady={isReady}
                        />
                    }
                >
                    {routePaths.map(({ path, Component }) => (
                        <Route key={path} path={path} element={<Component />} />
                    ))}
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}
