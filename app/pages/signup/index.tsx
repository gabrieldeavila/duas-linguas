import i18next from "i18next";
import { useCallback, useRef, useState } from "react";
import { Form, type Field, type FormApi } from "react-form-krafter";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";
import KrafterRegister from "~/components/internal/krafter/register";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { supabase } from "~/lib/supabase";
import { cn } from "~/lib/utils";

const SIGNUP_FIELDS: Field[] = [
  {
    name: "email",
    label: "email.label",
    placeholder: "email.placeholder",
    required: true,
    disabled: false,
    type: "email",
    initialValue: "",
    wrapperClassName: "grid gap-3",
  },
  {
    name: "password",
    label: "password.label",
    placeholder: "password.placeholder",
    required: true,
    disabled: false,
    type: "password",
    initialValue: "",
    wrapperClassName: "grid gap-3",
  },
  {
    name: "confirm_password",
    label: "confirm_password.label",
    placeholder: "confirm_password.placeholder",
    required: true,
    disabled: false,
    type: "password",
    initialValue: "",
    wrapperClassName: "grid gap-3",
  },
];

const schema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(6),
  confirm_password: z.string().min(6),
});

type Schema = typeof schema;
type Validator = z.infer<Schema>;

export function meta() {
  return [
    { title: i18next.t("login:signUp.title") },
    { name: "description", content: i18next.t("login:signUp.description") },
  ];
}

function SignUp({ className, ...props }: React.ComponentProps<"div">) {
  const formApi = useRef<FormApi<Validator> | null>(null);

  const { t, i18n } = useTranslation("login");
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signUpNewUser = useCallback(
    async (email: string, password: string) => {
      setIsSigningIn(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      setIsSigningIn(false);

      if (error) {
        const errorMessage = i18n.exists(`login:errors.${error.code}`)
          ? t(`errors.${error.code}` as never)
          : t("errors.bad_json");

        toast.error(errorMessage);
      } else {
        navigate("/dashboard");
      }
    },
    [i18n, navigate, t]
  );

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>{t("signUp.headline")}</CardTitle>
              <CardDescription>{t("signUp.subheading")}</CardDescription>
            </CardHeader>
            <CardContent>
              <KrafterRegister>
                <Form<Validator, Schema>
                  formClassName="flex flex-col gap-6"
                  fields={SIGNUP_FIELDS}
                  schema={schema}
                  formApi={formApi}
                  onSubmit={async (data) => {
                    if (data?.success) {
                      await signUpNewUser(
                        data.state.email,
                        data.state.password
                      );
                    } else {
                      toast.error(t("errors.fix_errors"));
                    }
                  }}
                  onChange={(data) => {
                    if (formApi.current === null) return;

                    if (
                      ["password", "confirm_password"].includes(data.fieldName)
                    ) {
                      const isValid =
                        data.currentState.confirm_password ===
                        data.currentState.password;

                      formApi.current.setError(
                        "confirm_password",
                        isValid ? null : t("signUp.passwordsDoNotMatch")
                      );
                    }
                  }}
                >
                  <div className="flex flex-col gap-3">
                    <Button disabled={isSigningIn} type="submit">{t("signUp.button")}</Button>
                  </div>
                </Form>

                <div className="mt-4 text-center text-sm">
                  <Trans
                    t={t}
                    keyParams="a"
                    i18nKey="signUp.alreadyHaveAccount"
                  >
                    <Link
                      to="/signin"
                      className="underline underline-offset-4"
                    />
                  </Trans>
                </div>
              </KrafterRegister>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
