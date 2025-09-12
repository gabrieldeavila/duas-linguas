import { Link } from "react-router";
import type { AdminCardProps } from "~/types";

export function meta() {
  return [
    { title: "Admin" },
    { name: "description", content: "Welcome to the Admin Panel!" },
  ];
}

function Admin() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>

      <div className="flex flex-wrap gap-6">
        <AdminCard
          title="Books"
          description="Add books titles and authors"
          link={{ to: "/admin/books", label: "Manage Books" }}
        />
      </div>
    </div>
  );
}

export default Admin;

const AdminCard = ({ title, description, link }: AdminCardProps) => {
  return (
    <div className="border p-4 rounded w-fit">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="mb-4">{description}</p>
      <Link
        className="bg-ring text-white px-4 py-2 rounded hover:bg-sidebar-ring"
        to={link.to}
      >
        {link.label}
      </Link>
    </div>
  );
};
