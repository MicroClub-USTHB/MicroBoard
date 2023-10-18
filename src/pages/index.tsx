import MainLayout from "@/layouts";
import { NextPageWithLayout } from "@/types";
import { ReactElement } from "react";

const Home: NextPageWithLayout = () => {
  return (
    <section
      className={`flex min-h-screen flex-col items-center justify-center`}
    >
      <h1 className={"text-5xl font-bold"}>MICROBOARD</h1>
      <p>test ci</p>
    </section>
  );
};

export default Home;
Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
