import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
}

function MetricCard({ title, value, change, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold" data-testid={`text-${title.toLowerCase().replace(/\s/g, '-')}-value`}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className={trend === "up" ? "text-chart-2" : "text-destructive"}>
            {change}
          </span>{" "}
          from last month
        </p>
      </CardContent>
    </Card>
  );
}

interface MetricsData {
  totalRevenue: string;
  revenueChange: string;
  activeVendors: string;
  vendorsChange: string;
  totalOrders: string;
  ordersChange: string;
  growthRate: string;
  growthChange: string;
}

export default function DashboardMetrics() {
  const { data, isLoading } = useQuery<MetricsData>({
    queryKey: ["/api/analytics/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Revenue",
      value: data?.totalRevenue || "$0.00",
      change: data?.revenueChange || "+0%",
      icon: <DollarSign className="h-4 w-4" />,
      trend: "up" as const,
    },
    {
      title: "Active Vendors",
      value: data?.activeVendors || "0",
      change: data?.vendorsChange || "+0%",
      icon: <Users className="h-4 w-4" />,
      trend: "up" as const,
    },
    {
      title: "Total Orders",
      value: data?.totalOrders || "0",
      change: data?.ordersChange || "+0%",
      icon: <Package className="h-4 w-4" />,
      trend: "up" as const,
    },
    {
      title: "Growth Rate",
      value: data?.growthRate || "0%",
      change: data?.growthChange || "+0%",
      icon: <TrendingUp className="h-4 w-4" />,
      trend: "up" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
