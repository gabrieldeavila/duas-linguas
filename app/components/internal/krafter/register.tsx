import { lazy, type ComponentType } from "react";
import {
  Register,
  type RegisterComponent,
  type RegisterFieldRenderProps,
  type RegisterSettings,
} from "react-form-krafter";

type FieldsValue = number | string | Date;

const COMPONENTS: RegisterComponent<FieldsValue>[] = [
  {
    type: "text",
    render: lazy(() => import("./fields/text")) as ComponentType<
      RegisterFieldRenderProps<FieldsValue>
    >,
  },
  {
    type: "number",
    render: lazy(() => import("./fields/number")) as ComponentType<
      RegisterFieldRenderProps<FieldsValue>
    >,
  },
  {
    type: "date",
    render: lazy(() => import("./fields/datePicker")) as ComponentType<
      RegisterFieldRenderProps<FieldsValue>
    >,
  },
  {
    type: "select",
    render: lazy(() => import("./fields/select")) as ComponentType<
      RegisterFieldRenderProps<FieldsValue>
    >,
  },
];

const settings: RegisterSettings = {
  labels: {
    required: "This field is required",
  },
};

function KrafterRegister({ children }: { children: React.ReactNode }) {
  return (
    <Register<FieldsValue> components={COMPONENTS} settings={settings}>
      {children}
    </Register>
  );
}

export default KrafterRegister;
