import { Search } from "lucide-react";
import { memo, type FC } from "react";
import type { RegisterFieldRenderProps } from "react-form-krafter";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { InputVariant } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import TableBuilder from "../../table/builder";

const ModalField: FC<RegisterFieldRenderProps<string>> = memo(
  ({ methods, field }: RegisterFieldRenderProps<string>) => {
    const { t } = useTranslation("fields");

    return (
      <div className={cn("flex flex-col gap-2", field.wrapperClassName)}>
        <Label htmlFor={field.name}>{t(field.label as never)}</Label>

        <div
          className={cn(
            InputVariant(),
            "flex items-center justify-between gap-2 px-3 py-2"
          )}
        >
          <p>{field.value ?? field.placeholder}</p>

          <Dialog>
            <DialogTrigger asChild>
              <button className="rounded-sm p-1 hover:bg-accent" type="button">
                <Search size={15} />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHelper field={field} />
            </DialogContent>
          </Dialog>
        </div>

        {field.error && field.isErrorVisible && (
          <span className="text-xs text-destructive">{field.error}</span>
        )}
      </div>
    );
  }
);

export default ModalField;

const DialogHelper = ({
  field,
}: {
  field: RegisterFieldRenderProps<string>["field"];
}) => {
  const { t } = useTranslation("general");

  return (
    <>
      <DialogHeader>
        <DialogTitle>{field.label}</DialogTitle>
        <DialogDescription>
          {field.placeholder && <p>{field.placeholder}</p>}
        </DialogDescription>
      </DialogHeader>

      <TableBuilder<never>
        tableName={field.metadata?.table as never}
        columns={field.metadata?.columns as never}
        settings={{
          hideAdd: true,
          limitHeight: true,
          singleSelection: true,
          columnSelector: field.metadata?.columnSelector as never,
        }}
      />

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">{t("cancel")}</Button>
        </DialogClose>
        <Button type="submit">{t("saveChanges")}</Button>
      </DialogFooter>
    </>
  );
};
