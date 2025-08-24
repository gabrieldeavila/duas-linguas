import { memo, type FC } from "react";
import FieldBase from "./base";
import type { RegisterFieldRenderProps } from "react-form-krafter";

const FieldEmail: FC<RegisterFieldRenderProps<string>> = memo(
  (props: RegisterFieldRenderProps<string>) => {
    return (
      <FieldBase
        {...props}
        type="email"
        onFieldChange={(value) => {
          return String(value);
        }}
      />
    );
  }
);

export default FieldEmail;
