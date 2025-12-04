import { useEffect, useState } from "react";
import { Navigation } from "@/components/restaurant/Navigation";
import { MetricCard } from "@/components/restaurant/MetricCard";
import { SimpleChart } from "@/components/restaurant/SimpleChart";
import { DashboardMetrics, DashboardResumen } from "@/types/order";
import { fetchDashboardResumen, fetchDashboardMetrics } from "@/services/mockApi";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2,
  Flame,
  Package,
  Truck,
  Users,
  TrendingUp,
  BarChart3,
  Calendar,
  PieChart,
  Utensils,
  Package as PackageIcon,
  Car,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Dashboard = () => {
  const [resumen, setResumen] = useState<DashboardResumen | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [resumenData, metricsData] = await Promise.all([
        fetchDashboardResumen(),
        fetchDashboardMetrics()
      ]);
      
      console.log("📊 Datos cargados:", { resumenData, metricsData });
      
      setResumen(resumenData);
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setError("No se pudieron cargar los datos del dashboard");
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener valores seguros de metrics
  const getSafeMetrics = () => {
    if (!metrics) {
      return {
        pedidosPorEstado: {
          CREATED: 0,
          COOKING: 0,
          PACKAGING: 0,
          DELIVERY: 0,
          DELIVERED: 0,
          COMPLETED: 0,
          IN_PROGRESS: 0
        },
        tiemposPorEtapa: {
          COOKING: 0,
          PACKAGING: 0,
          DELIVERY: 0
        },
        pedidosUltimaSemana: [0, 0, 0, 0, 0, 0, 0],
        productosPopulares: []
      };
    }
    return metrics;
  };

  // Función para obtener valores seguros de resumen
  const getSafeResumen = () => {
    if (!resumen) {
      return {
        totalPedidos: 0,
        pedidosHoy: 0,
        pedidosActivos: 0,
        tiempoPromedioEntrega: 0,
        ultimaActualizacion: new Date().toISOString()
      };
    }
    return resumen;
  };

  const safeMetrics = getSafeMetrics();
  const safeResumen = getSafeResumen();

  // Calcular total de pedidos activos sumando estados relevantes
const totalActivos = 
  safeMetrics.pedidosPorEstado.CREATED +
  safeMetrics.pedidosPorEstado.COOKING +
  safeMetrics.pedidosPorEstado.PACKAGING +
  safeMetrics.pedidosPorEstado.DELIVERY +
  safeMetrics.pedidosPorEstado.IN_PROGRESS;

// Y para debuggear, agrega:
console.log("🔍 Cálculo de activos:", {
  CREATED: safeMetrics.pedidosPorEstado.CREATED,
  COOKING: safeMetrics.pedidosPorEstado.COOKING,
  PACKAGING: safeMetrics.pedidosPorEstado.PACKAGING,
  DELIVERY: safeMetrics.pedidosPorEstado.DELIVERY,
  IN_PROGRESS: safeMetrics.pedidosPorEstado.IN_PROGRESS,
  totalActivos
});

  // Calcular tasa de completitud
  const totalCompletados = safeMetrics.pedidosPorEstado.DELIVERED + safeMetrics.pedidosPorEstado.COMPLETED;
  const totalTodos = Object.values(safeMetrics.pedidosPorEstado).reduce((a, b) => a + b, 0);
  const tasaCompletitud = totalTodos > 0 ? Math.round((totalCompletados / totalTodos) * 100) : 0;

  // Formatear fecha de última actualización
  const lastUpdated = safeResumen.ultimaActualizacion 
    ? format(new Date(safeResumen.ultimaActualizacion), 'PPpp')
    : 'N/A';

  // Días de la semana para el gráfico
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando datos del dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 text-red-500 mx-auto mb-4">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Error al cargar datos</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard del Restaurante</h2>
              <p className="text-muted-foreground">
                Métricas en tiempo real y análisis de desempeño
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Última actualización: {lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Pedidos"
            value={safeResumen.totalPedidos.toString()}
            icon={ShoppingBag}
            variant="default"
            description="Todos los pedidos registrados"
          />
          
          <MetricCard
            title="Pedidos Hoy"
            value={safeResumen.pedidosHoy.toString()}
            icon={Calendar}
            variant="info"
            description="Pedidos creados hoy"
          />
          
          <MetricCard
            title="Tiempo Promedio"
            value={`${safeResumen.tiempoPromedioEntrega}m`}
            icon={Clock}
            variant="success"
            description="Tiempo promedio de entrega"
          />
        </div>

        {/* Distribución por estado y gráfico semanal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Distribución por estado */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Distribución por Estado</h3>
            </div>
            
            
            
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tasa de Completitud</span>
                <span className="font-semibold text-foreground">{tasaCompletitud}%</span>
              </div>
              <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${tasaCompletitud}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gráfico de pedidos última semana */}
          <SimpleChart
            data={safeMetrics.pedidosUltimaSemana}
            labels={weekDays}
            title="Pedidos Última Semana"
            color="blue"
          />
        </div>

        {/* Tiempos por etapa y productos populares */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
         

          {/* Productos populares */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Productos Más Populares</h3>
            </div>
            
            <div className="space-y-4">
              {safeMetrics.productosPopulares.length > 0 ? (
                safeMetrics.productosPopulares.map((producto, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${
                        index === 0 ? 'bg-amber-100 text-amber-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{producto.producto}</span>
                        <div className="text-xs text-muted-foreground">
                          {index === 0 ? '🥇 Más vendido' : 
                           index === 1 ? '🥈 Segundo' : 
                           '🥉 Tercero'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{producto.cantidad}</div>
                      <div className="text-xs text-muted-foreground">unidades</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de productos populares disponibles
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total productos vendidos</span>
                <span className="font-semibold">
                  {safeMetrics.productosPopulares.reduce((sum, p) => sum + p.cantidad, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estado detallado - Tarjetas horizontales */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Estado Detallado de Pedidos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <MetricCard
            title="Pedidos Activos"
            value={totalActivos ? totalActivos.toString() : "0"}
            icon={Users}
            variant="warning"
            description="En proceso actualmente"
            />
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-800">Completados</span>
                <div className="p-2 bg-green-100 rounded">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-700">{safeMetrics.pedidosPorEstado.COMPLETED}</div>
              <div className="text-xs text-green-600 mt-1">Proceso finalizado</div>
            </div>
          </div>
        </div>

        {/* Footer del dashboard */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <p>Dashboard actualizado automáticamente cada 30 segundos</p>
            </div>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar Datos
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;