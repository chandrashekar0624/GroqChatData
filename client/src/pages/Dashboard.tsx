import DashboardMetrics from "@/components/DashboardMetrics";
import VendorChart from "@/components/VendorChart";
import RevenueChart from "@/components/RevenueChart";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1" data-testid="text-page-title">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your analytics and key metrics
        </p>
      </div>

      <DashboardMetrics />

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueChart />
        <VendorChart />
      </div>
    </div>
  );
}
