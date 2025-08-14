export function meta() {
  return [
    { title: "Doc" },
    { name: "description", content: "Try doing something cool!" },
  ];
}

function Docs() {
  return (
    <div className="flex w-full justify-center">
      <div className="container">Docs</div>
    </div>
  );
}

export default Docs;
