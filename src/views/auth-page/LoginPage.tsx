import { useState } from "react";
import { UserService } from "@/helpers/services/UserService";
import { supabase } from "@/helpers/supabase/client";
import AppTextField from "@/components/app-components/app-text-field/AppTextField";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import AppModal from "@/components/app-components/app-modal/AppModal";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isShowError, setIsShowError] = useState(false);

    const configuredAuthRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim()

    function getAuthRedirectUrl() {
        if (configuredAuthRedirectUrl) {
            return configuredAuthRedirectUrl
        }

        return window.location.origin
    }

    const authenticateUser = async (email: string) => {
        const res = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: getAuthRedirectUrl(),
            },
        })

        if (res.error) {
            setIsShowError(true);
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

        await UserService.getUserByEmail({
            email: normalizedEmail,
            setIsLoading,
        })
            .then((res) => {
                if (res.data) {
                    authenticateUser(normalizedEmail);
                } else {
                    setIsShowError(true);
                    setErrorMessage("Account is not authenticated. Please contact administrator to authenticate your account.");
                }
            })
            .catch((error) => {
                setIsShowError(true);
                setErrorMessage(error.error.message);
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
            <AppModal
                open={isShowError}
                onOpenChange={setIsShowError}
                title={statusMessage ? "Success" : "Error"}
                showCloseButton={true}
                contentProps={{
                    onOpenAutoFocus: (event) => {
                        event.preventDefault();
                    },
                    onCloseAutoFocus: (event) => {
                        event.preventDefault();
                    },
                }}
                classNames={{
                    content: "sm:max-w-sm",
                    header: "gap-1",
                    title: "text-lg",
                    description: "text-xs",
                    body: "space-y-3",
                    footer: "bg-muted/30",
                }}
                footer={
                    <div className="flex w-full justify-center">
                        <Button
                            type="button"
                            onClick={() => {
                                setErrorMessage("");
                                setIsShowError(false);
                            }}
                        >
                            OK
                        </Button>
                    </div>
                }
            >
                {statusMessage ? (
                    <p>{statusMessage}</p>
                ) : (
                    <p>{errorMessage}</p>
                )}
            </AppModal>
        </main>
    );
}
