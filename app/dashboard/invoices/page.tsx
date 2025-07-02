import { fetchCardData } from "@/app/lib/data";
import React from "react";

const Page = async () => {
  console.log("invoices page run");
  const a = await fetchCardData();
  return <div>Invoices</div>;
};

export default Page;
