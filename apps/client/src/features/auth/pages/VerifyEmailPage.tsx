import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { useVerifyEmail } from "../../auth.queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api/errors";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState("");
  const { mutate: verifyEmail } = useVerifyEmail();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage(t("auth:verifyEmail.invalidToken", "Invalid or missing verification token."));
      return;
    }

    verifyEmail({ token }, {
      onSuccess: () => {
        setStatus('success');
      },
      onError: (err) => {
        setStatus('error');
        if (err instanceof ApiError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage(t("auth:verifyEmail.error", "Verification failed."));
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Card className="border-border shadow-sm">
      {status === 'verifying' && (
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t("auth:verifyEmail.verifying", "Verifying your email...")}</p>
        </CardContent>
      )}

      {status === 'success' && (
        <>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-center">{t("auth:verifyEmail.successTitle", "Email Verified")}</CardTitle>
            <CardDescription className="text-center">
              {t("auth:verifyEmail.successDesc", "Your email address has been successfully verified. You can now use your account.")}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild className="w-full">
              <Link to="/">{t("auth:verifyEmail.continue", "Continue to App")}</Link>
            </Button>
          </CardFooter>
        </>
      )}

      {status === 'error' && (
        <>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-center text-destructive">{t("auth:verifyEmail.errorTitle", "Verification Failed")}</CardTitle>
            <CardDescription className="text-center">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center space-x-4">
            <Button asChild variant="outline">
              <Link to="/login">{t("auth:verifyEmail.toLogin", "Back to Login")}</Link>
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
