import i18next from "i18next";
import { useRef } from "react";
import { Form, type Field, type FormApi } from "react-form-krafter";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router";
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

  const { t } = useTranslation("login");

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
                    console.log(
                      "data",
                      data,
                      formApi.current?.fieldsInfo,
                      formApi.current?.fieldsInfo.errors
                    );
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
