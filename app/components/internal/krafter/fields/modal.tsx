import { Search } from "lucide-react";
import { memo, useCallback, useRef, type FC } from "react";
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
import type { TableController } from "~/types/table.types";

type FieldDataProp = Partial<{
  id: string;
  label: string;
}>;

const ModalField: FC<RegisterFieldRenderProps<FieldDataProp>> = memo(
  ({ methods, field }: RegisterFieldRenderProps<FieldDataProp>) => {
    const { t } = useTranslation("fields");

    return (
      <div
        className={cn(
          "flex flex-col gap-2 overflow-hidden",
          field.wrapperClassName
        )}
      >
        <Label htmlFor={field.name}>{t(field.label as never)}</Label>

        <Dialog>
          <DialogTrigger asChild>
            <div
              className={cn(
                InputVariant(),
                "flex items-center justify-between gap-2 px-3 py-2 w-full"
              )}
            >
              {field.value?.label ? (
                <p
                  className={cn(
                    "goverflow-hidden whitespace-nowrap text-ellipsis"
                  )}
                >
                  {t(field.value.label as never)}
                </p>
              ) : (
                <p
                  className={cn(
                    "text-muted-foreground",
                    "overflow-hidden whitespace-nowrap text-ellipsis"
                  )}
                >
                  {t(field.placeholder as never)}
                </p>
              )}

              <button
                className="flex rounded-sm p-1 hover:bg-accent"
                type="button"
              >
                <Search size={15} />
              </button>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[90dvw]">
            <DialogHelper field={field} onChange={methods.onChange} />
          </DialogContent>
        </Dialog>

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
  onChange,
}: {
  field: RegisterFieldRenderProps<FieldDataProp>["field"];
  onChange: (value: Record<string, string>) => void;
}) => {
  const { t } = useTranslation("general");
  const tableController = useRef<TableController<never>>(null);

  const handleSave = useCallback(() => {
    if (!tableController.current) return;

    const selectedData = tableController.current.selectedData;

    onChange({
      id: selectedData[0][field.metadata?.columnSelector as never],
      label: selectedData[0][field.metadata?.columnLabel as never] || "",
    });
  }, [field.metadata?.columnSelector, field.metadata?.columnLabel, onChange]);

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
        tableController={tableController}
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
        <DialogClose>
          <Button type="submit" onClick={handleSave}>
            {t("saveChanges")}
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
};
