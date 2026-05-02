
import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { routes, routePaths } from "@/constants/paths";
import { UserService } from "@/helpers/services/UserService";
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore";
import { supabase } from "@/helpers/supabase/client";
import LoginPage from "@/views/auth-page/LoginPage";
import NotFoundPage from "@/views/not-found-page/NotFoundPage";
import AppContainer from "@/components/app-components/app-container/AppContainer";
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner";

function ProtectedRoute({
    isAuthenticated,
    isReady,
}: {
    isAuthenticated: boolean;
    isReady: boolean;
}) {
    if (!isReady) {
        return <AppSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to={routes.login} replace />;
    }

    return <AppContainer />;
}

function GuestRoute({
    isAuthenticated,
    isReady,
}: {
    isAuthenticated: boolean;
    isReady: boolean;
}) {
    if (!isReady) {
        return <AppSpinner />;
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
    const previousEmailRef = useRef<string | null>(null);

    useEffect(() => {
        const syncAuthState = async (email?: string) => {
            if (!email) {
                clearAuthenticatedUser();
                setIsReady(true);
                return;
            }

            if (previousEmailRef.current === email) {
                setIsReady(true);
                return;
            }

            previousEmailRef.current = email;

            const userResponse = await UserService.getUserByEmail({ email });

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
    );
}
