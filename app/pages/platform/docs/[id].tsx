import { useParams } from "react-router";

export function meta({ params }: { params: { id: string } }) {
  return [
    { title: `Doc: ${params.id}` },
    { name: "description", content: "Try doing something cool!" },
  ];
}

function DocId() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex w-full justify-center">
      <div className="container">DocId: {id}</div>
    </div>
  );
}

export default DocId;
