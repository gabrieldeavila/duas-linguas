import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { memo, useMemo, useState, type FC } from "react";
import type { RegisterFieldRenderProps } from "react-form-krafter";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

const PasswordField: FC<RegisterFieldRenderProps<string>> = memo(
  ({ methods, field }) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputProps = useMemo(() => {
      const defaultValue =
        field.initialValue == null ? undefined : String(field.initialValue);

      if (field.value == null) return { defaultValue };

      return {
        value: String(field.value),
        defaultValue: defaultValue,
      };
    }, [field.value, field.initialValue]);

    const { t } = useTranslation("fields");

    return (
      <div className={cn("flex flex-col gap-2", field.wrapperClassName)}>
        <Label htmlFor={field.name}>{t(field.label)}</Label>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t(field.placeholder)}
            id={field.name}
            name={field.name}
            required={field.required}
            disabled={field.isDisabled}
            {...inputProps}
            onChange={(e) => methods.onChange(e.target.value)}
            onFocus={methods.onFocus}
            onBlur={methods.onBlur}
            className={cn(field.inputClassName, "pr-10")}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {field.error && field.isErrorVisible && (
          <span className="text-xs text-destructive">{field.error}</span>
        )}
      </div>
    );
  }
);

export default PasswordField;
