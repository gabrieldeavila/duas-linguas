import i18next from "i18next";
import { useCallback, useRef } from "react";
import { Form, type Field, type FormApi } from "react-form-krafter";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router";
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

export function meta() {
  return [
    { title: i18next.t("login:signIn.title") },
    { name: "description", content: i18next.t("login:signIn.description") },
  ];
}

const SIGNIN_FIELDS: Field[] = [
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
];

const schema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(6),
});

type Schema = typeof schema;
type Validator = z.infer<Schema>;

function SignIn({ className, ...props }: React.ComponentProps<"div">) {
  const formApi = useRef<FormApi<Validator> | null>(null);

  const { t, i18n } = useTranslation("login");

  const signInUser = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorMessage = i18n.exists(`login:errors.${error.code}`)
          ? t(`errors.${error.code}` as never)
          : t("errors.bad_json");

        toast.error(errorMessage);
      } else {
        console.log("Sign up successful:", data);
      }
    },
    [i18n, t]
  );

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>{t("signIn.headline")}</CardTitle>
              <CardDescription>{t("signIn.subheading")}</CardDescription>
            </CardHeader>
            <CardContent>
              <KrafterRegister>
                <Form<Validator, Schema>
                  formClassName="flex flex-col gap-6"
                  fields={SIGNIN_FIELDS}
                  schema={schema}
                  formApi={formApi}
                  onSubmit={async (data) => {
                    if (data?.success) {
                      await signInUser(data.state.email, data.state.password);
                    } else {
                      alert("Sign in failed. Please try again.");
                    }
                  }}
                >
                  <div className="flex flex-col gap-3">
                    <Button type="submit">{t("signIn.button")}</Button>
                  </div>
                </Form>

                <div className="mt-4 text-center text-sm">
                  <Trans t={t} i18nKey="signIn.dontHaveAccount">
                    <Link
                      to="/signup"
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

export default SignIn;
