import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";

export function ButtonLoading({
  children,
  isLoading,
  ...props
}: {
  children?: React.ReactNode;
  isLoading: boolean;
} & React.ComponentProps<"button">) {
  return (
    <Button variant="outline" disabled={isLoading} {...props}>
      {isLoading && <Spinner />}
      {children}
    </Button>
  );
}
