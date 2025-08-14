import { memo, type FC } from "react";
import FieldBase from "./base";
import type { RegisterFieldRenderProps } from "react-form-krafter";

const FieldNumber: FC<RegisterFieldRenderProps<number>> = memo(
  (props: RegisterFieldRenderProps<number>) => {
    return (
      <FieldBase
        {...props}
        type="number"
        onFieldChange={(value) => {
          const numValue = Number(value);
          console.log(isNaN(numValue) ? 0 : numValue ?? 0);

          return isNaN(numValue) ? 0 : numValue ?? 0; // Ensure valid number
        }}
      />
    );
  }
);

export default FieldNumber;
