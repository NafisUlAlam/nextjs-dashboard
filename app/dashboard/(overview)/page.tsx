import CardWrapper, { Card } from "@/app/ui/dashboard/cards";
import RevenueChart from "@/app/ui/dashboard/revenue-chart";
import LatestInvoices from "@/app/ui/dashboard/latest-invoices";
import { lusitana } from "@/app/ui/fonts";
import {
  fetchCardData,
  fetchLatestInvoices,
  fetchRevenue,
} from "@/app/lib/data";
import { Suspense } from "react";
import {
  CardSkeleton,
  LatestInvoicesSkeleton,
  RevenueChartSkeleton,
} from "@/app/ui/skeletons";

export default async function Page() {
  //const latestInvoices = await fetchLatestInvoices();
  // const {
  //   numberOfCustomers,
  //   numberOfInvoices,
  //   totalPaidInvoices,
  //   totalPendingInvoices,
  // } = await fetchCardData();
  // const rPromise = fetchRevenue();
  // const iPromise = fetchLatestInvoices();
  // const cPromise = fetchCardData();
  // const data = await Promise.all([rPromise, iPromise, cPromise]);
  // const revenue = data[0];
  // const latestInvoices = data[1];
  // const {
  //   totalPaidInvoices,
  //   totalPendingInvoices,
  //   numberOfInvoices,
  //   numberOfCustomers,
  // } = data[2];
  console.log("dashboard page run inside route group overview folder");
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardSkeleton></CardSkeleton>}>
          <CardWrapper></CardWrapper>
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton></RevenueChartSkeleton>}>
          <RevenueChart />
        </Suspense>

        <Suspense fallback={<LatestInvoicesSkeleton></LatestInvoicesSkeleton>}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}
