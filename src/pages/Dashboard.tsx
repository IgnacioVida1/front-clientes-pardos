import { useEffect, useState } from "react";
import { Navigation } from "@/components/restaurant/Navigation";
import { MetricCard } from "@/components/restaurant/MetricCard";
import { DashboardMetrics } from "@/types/order";
import { fetchDashboardMetrics } from "@/services/mockApi";
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2,
  Flame,
  Package,
  Truck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Real-time restaurant metrics and performance</p>
        </div>
        {/*
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Revenue Today"
            value={`$${metrics.revenue.toFixed(2)}`}
            icon={DollarSign}
            trend="+12% from yesterday"
            variant="success"
          />
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders}
            icon={ShoppingBag}
            trend={`${metrics.completedToday} completed today`}
            variant="info"
          />
          <MetricCard
            title="Active Orders"
            value={metrics.activeOrders}
            icon={Clock}
            variant="warning"
          />
          <MetricCard
            title="Avg. Order Time"
            value={`${metrics.averageOrderTime}m`}
            icon={CheckCircle2}
            trend="2m faster than average"
            variant="default"
          />
        </div>*/}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="In Kitchen"
            value={metrics.pedidosPorEstado.COOKING}
            icon={Flame}
            variant="warning"
          />
          <MetricCard
            title="Being Packaged"
            value={metrics.pedidosPorEstado.PACKAGING}
            icon={Package}
            variant="info"
          />
          <MetricCard
            title="Out for Delivery"
            value={metrics.pedidosPorEstado.DELIVERY}
            icon={Truck}
            variant="default"
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
