import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { tmeta } from "~/lib/utils";
import { ReadingList } from "../dashboard";

export function meta() {
  i18next.loadNamespaces("general");

  return [
    { title: tmeta("general:your_library.title") },
    {
      name: "description",
      content: tmeta("general:your_library.description"),
    },
  ];
}

function YourLibrary() {
  const { t } = useTranslation("general");

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbPage>{t("your_library.title")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ReadingList />

      <ReadingList isSearchingFinishedBooks />
    </div>
  );
}

export default YourLibrary;
