import { useState } from "react";
import { routes } from "@/constants/paths";
import { UserService } from "@/helpers/services/UserService";
import { supabase } from "@/helpers/supabase/client";
import AppTextField from "@/components/app-components/app-text-field/AppTextField";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const authenticateUser = async (email: string) => {
        const res = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: `${window.location.origin}${routes.home}`,
            },
        })

        if (res.error) {
            setErrorMessage(res.error.message);
        } else {
            setStatusMessage("Verification link sent! Please check your email.");
        }
    }

    const onSubmit = async () => {

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            return;
        }

        await UserService.getUserByEmail(normalizedEmail, setIsLoading,)
            .then((res) => {
                if (res.data) {
                    authenticateUser(normalizedEmail);
                } else {
                    setErrorMessage("Account is not authenticated. Please contact administrator to authenticate your account.");
                }
            })
            .catch((error) => {
                setErrorMessage(error.message);
            });
    };

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                Sign in
            </h1>
            <p className="leading-7 mb-5">
                Enter your email to receive a verification link.
            </p>

            <div className="mb-5">
                <AppTextField
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e)}
                    type="email"
                    required
                    description={statusMessage ? "" : undefined}
                />
                <div className="flex items-center justify-center">
                    <Button disabled={isLoading} onClick={onSubmit}>
                        {isLoading ? <Spinner /> : "Send Verification Link"}
                    </Button>
                </div>
            </div>

            {statusMessage && (
                <p className="rounded-md border border-green-200 bg-green-50 p-2 text-sm text-green-700">
                    {statusMessage}
                </p>
            )}

            {errorMessage && (
                <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                    {errorMessage}
                </p>
            )}
        </main>
    );
}
