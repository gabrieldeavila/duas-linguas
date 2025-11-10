import { useEffect } from "react";
import { supabase } from "~/lib/supabase";
import Cta from "./components/cta";
import Features from "./components/features";
import Footer from "./components/footer";
import Header from "./components/header";
import HeroHome from "./components/hero";
import Workflows from "./components/workflow";
import { useNavigate } from "react-router";

export function meta() {
  return [{ title: "Duli" }];
}

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then((session) => {
      if (session?.data?.session?.user) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

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
