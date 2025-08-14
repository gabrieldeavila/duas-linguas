import { memo, useCallback } from "react";
import {
  Form,
  useFieldsErrors,
  useFieldsState,
  type Field,
} from "react-form-krafter";
import { z } from "zod";
import KrafterRegister from "~/components/internal/krafter/register";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  // surname: z.string().min(3, "Surname must be at least 3 characters long"),
  age: z
    .number()
    .min(18, "Age must be at least 18")
    .max(100, "Age must be less than 100"),
  birthDate: z
    .date()
    .refine(
      (date) => date instanceof Date && !isNaN(date.getTime()),
      "Invalid date"
    )
    // .max(new Date(), "Date cannot be in the future")
    .refine((date) => date <= new Date(), "Date cannot be in the future"),
  // about: z.string().max(500, "About must be less than 500 characters"),
});

type Schema = typeof schema;
type Validator = z.infer<Schema>;

const fields: Field[] = [
  {
    name: "name",
    label: "Name",
    placeholder: "Enter a name",
    required: true,
    disabled: false,
    type: "text",
  },
  {
    name: "age",
    label: "Age",
    placeholder: "Enter age",
    required: true,
    disabled: false,
    type: "number",
  },
  {
    name: "birthDate",
    label: "Birth Date",
    required: true,
    disabled: false,
    type: "date",
  },
  {
    name: "favoriteLanguage",
    label: "Favorite Language",
    placeholder: "Select your favorite",
    required: true,
    disabled: false,
    type: "select",
    options: [
      { value: "javascript", label: "JavaScript" },
      { value: "typescript", label: "TypeScript" },
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
      { value: "csharp", label: "C#" },
      { value: "ruby", label: "Ruby" },
    ],
  },
];

function FormFeatures() {
  const onSubmit = useCallback(
    ({
      errors,
      state,
      success,
    }: {
      state: Validator;
      errors: Record<keyof Validator, string | null>;
      success: boolean;
    }) => {
      if (!success) {
        alert("Form submission failed. Check errors in the console.");
        console.error("Form submission errors:", errors);
        return;
      }

      alert("Form submitted successfully!");
      console.log("Form submitted with values:", state);
    },
    []
  );

  return (
    <KrafterRegister>
      <Form<Validator, Schema>
        formClassName={cn(
          "grid gap-4",
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        )}
        loaderFallback={
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-12 rounded-md" />
            <Skeleton className="h-12 rounded-md" />
            <Skeleton className="h-12 rounded-md" />
            <Skeleton className="h-12 rounded-md" />
          </div>
        }
        fields={fields}
        schema={schema}
        onSubmit={onSubmit}
      >
        <Submit />

        <FormInfo />
        <FormErrors />
      </Form>
    </KrafterRegister>
  );
}

export default FormFeatures;

const FormInfo = memo(() => {
  const fieldsState = useFieldsState<Validator>();

  const cleaned = Object.fromEntries(
    Object.entries(fieldsState).map(([key, value]) => [
      key,
      value === undefined ? "undefined" : value,
    ])
  );

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-4">
      <h2 className="text-lg font-semibold">Form State</h2>
      <p className="text-sm text-muted-foreground">
        <pre>{JSON.stringify(cleaned, null, 2)}</pre>
      </p>
    </div>
  );
});

const FormErrors = memo(() => {
  const fieldsError = useFieldsErrors<Validator>();
  const cleaned = Object.fromEntries(
    Object.entries(fieldsError).map(([key, value]) => [
      key,
      value === "" || value == null ? "No error" : value,
    ])
  );

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-4">
      <h2 className="text-lg font-semibold">Form Errors</h2>
      <p className="text-sm text-destructive">
        <pre>{JSON.stringify(cleaned, null, 2)}</pre>
      </p>
    </div>
  );
});

const Submit = memo(() => {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-4">
      <Button type="submit">Submit</Button>
    </div>
  );
});
