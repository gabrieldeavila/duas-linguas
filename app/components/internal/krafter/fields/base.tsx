import { memo, useMemo } from "react";
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
    const inputProps = useMemo(() => {
      const defaultValue =
        field.initialValue == null
          ? undefined
          : type === "number"
            ? Number(field.initialValue)
            : String(field.initialValue);

      if (field.value == null) return { defaultValue };

      if (type === "number") {
        return {
          value: Number(field.value),
          defaultValue: defaultValue,
        };
      }

      return {
        value: String(field.value),
        defaultValue: defaultValue,
      };
    }, [field.value, field.initialValue, type]);

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
          {...inputProps}
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
