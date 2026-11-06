import { useEffect } from "react";
import { Masthead } from "@/components/Masthead";
import { Intro } from "@/components/home/Intro";
import { Work } from "@/components/home/Work";
import { Practice } from "@/components/home/Practice";
import { Record } from "@/components/home/Record";
import { Toolkit } from "@/components/home/Toolkit";
import { Contact } from "@/components/home/Contact";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useSeo } from "@/hooks/use-seo";

export default function Home() {
  const portfolio = usePortfolio();

  useSeo({
    title: `${portfolio.identity.shortName}: Frontend Engineer, Lagos`,
    description: `${portfolio.identity.fullName} (${portfolio.identity.shortName}) is a frontend engineer in Lagos, building complex products in React, Next.js and TypeScript, from the interface to the systems behind it.`,
    path: "/",
  });

  // Arriving from another page at /#work: go to that sheet straight away.
  useEffect(() => {
    if (window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "instant" });
    }
  }, []);

  return (
    <>
      <Masthead />
      <main id="main">
        <Intro identity={portfolio.identity} intro={portfolio.intro} />
        <Work projects={portfolio.projects} />
        <Practice data={portfolio.practice} />
        <Record data={portfolio.record} />
        <Toolkit data={portfolio.toolkit} />
        <Contact identity={portfolio.identity} data={portfolio.contact} />
      </main>
    </>
  );
}
