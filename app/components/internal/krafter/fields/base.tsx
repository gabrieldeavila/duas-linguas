import { memo } from "react";
import type { FieldMethods, RegisterField } from "react-form-krafter";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export type FieldBaseProps = {
  field: RegisterField<string | number>;
  methods: FieldMethods;
  type?: string;
};

const FieldBase = memo(
  ({
    methods,
    field,
    type,
    onFieldChange,
  }: FieldBaseProps & {
    onFieldChange: (value: unknown) => string | number;
  }) => {
    return (
      <div className={cn("flex flex-col gap-2", field.wrapperClassName)}>
        <Label htmlFor={field.name}>{field.label}</Label>

        <Input
          type={type}
          placeholder={field.placeholder}
          id={field.name}
          name={field.name}
          required={field.required}
          disabled={field.isDisabled}
          value={
            type === "number"
              ? Number(field.value)
              : typeof field.value === "string"
                ? field.value
                : ""
          }
          defaultValue={
            type === "number"
              ? Number(field.initialValue)
              : String(field.initialValue)
          }
          onChange={(e) => methods.onChange(onFieldChange(e.target.value))}
          onFocus={methods.onFocus}
          onBlur={methods.onBlur}
          className={cn(field.inputClassName)}
        />

        {field.error && field.isErrorVisible && (
          <span className="text-xs text-destructive">{field.error}</span>
        )}
      </div>
    );
  }
);

export default FieldBase;
