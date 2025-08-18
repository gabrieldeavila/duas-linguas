import Header from "./components/header";
import HeroHome from "./components/hero";
import Workflows from "./components/workflow";

export function meta() {
  return [
    { title: "Duas Linguas" },
    { name: "description", content: "Welcome to Duas Linguas" },
  ];
}

function Home() {
  return (
    <>
      <Header />
      <HeroHome />
      <Workflows />
    </>
  );
}

export default Home;
