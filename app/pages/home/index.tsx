import Cta from "./components/cta";
import Features from "./components/features";
import Footer from "./components/footer";
import Header from "./components/header";
import HeroHome from "./components/hero";
import Workflows from "./components/workflow";

export function meta() {
  return [{ title: "Duas Linguas" }];
}

function Home() {
  return (
    <>
      <Header />
      <HeroHome />
      <Workflows />
      <Features />
      <Cta />
      <Footer />
    </>
  );
}

export default Home;
