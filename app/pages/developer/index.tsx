export function meta() {
  return [
    { title: "Developer Page" },
    { name: "description", content: "Try doing something cool!" },
  ];
}

function DeveloperPage() {
  return (
    <div className="flex w-full justify-center">
      <div className="container">This is such a cool page</div>
    </div>
  );
}

export default DeveloperPage;
