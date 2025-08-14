import { memo, type FC } from "react";
import type { RegisterFieldRenderProps } from "react-form-krafter";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const SelectField: FC<RegisterFieldRenderProps<Date>> = memo(
  ({ methods, field }: RegisterFieldRenderProps<Date>) => {
    return (
      <div className={cn("flex flex-col gap-2", field.wrapperClassName)}>
        <Label htmlFor={field.name}>{field.label}</Label>

        <Select
          value={field.value?.toString() || ""}
          onValueChange={(value) => {
            methods.onChange(value);
            methods.onBlur();
          }}
          onOpenChange={(open) => {
            if (open) {
              methods.onFocus();
            }
          }}
        >
          <SelectTrigger className={cn("w-full", field.inputClassName)}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{field.label}</SelectLabel>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {field.error && field.isErrorVisible && (
          <span className="text-xs text-destructive">{field.error}</span>
        )}
      </div>
    );
  }
);

export default SelectField;
