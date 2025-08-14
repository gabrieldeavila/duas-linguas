import { memo, type FC } from "react";
import type { RegisterFieldRenderProps } from "react-form-krafter";
import { DatePicker } from "~/components/ui/datepicker";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

const DatePickerField: FC<RegisterFieldRenderProps<Date>> = memo(
  ({ methods, field }: RegisterFieldRenderProps<Date>) => {
    return (
      <div className={cn("flex flex-col gap-2", field.wrapperClassName)}>
        <Label htmlFor={field.name}>{field.label}</Label>

        <DatePicker
          id={field.name}
          disabled={field.isDisabled}
          onChange={(e) => methods.onChange(e)}
          onFocus={methods.onFocus}
          onBlur={methods.onBlur}
          date={field.value}
        />

        {field.error && field.isErrorVisible && (
          <span className="text-xs text-destructive">{field.error}</span>
        )}
      </div>
    );
  }
);

export default DatePickerField;
