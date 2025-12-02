import { useEffect, useState } from "react";
import { Navigation } from "@/components/restaurant/Navigation";
import { OrderCard } from "@/components/restaurant/OrderCard";
import { Orders, OrderState, OrderEtapa } from "@/types/order";
import { fetchActiveOrders, updateOrderState } from "@/services/mockApi";
import { useToast } from "@/hooks/use-toast";

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState<Orders>({pedidos: [], total: 0});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
    // Poll for new orders every 10 seconds
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

const loadOrders = async () => {
  try {
    const data = await fetchActiveOrders();
    
    // Validar y limpiar datos
    const validatedOrders = {
      ...data,
      pedidos: (data.pedidos || []).map(order => ({
        orderId: order.orderId || `unknown-${Math.random().toString(36).substr(2, 9)}`,
        customerId: order.customerId || "unknown-customer",
        status: order.status || "COOKING",
        createdAt: order.createdAt || new Date().toISOString(),
        etapas: order.etapas || [],
        items: order.items || [],
        total: order.total || 0
      }))
    };
    
    setOrdenes(validatedOrders);
  } catch (error) {
    console.error('Error loading orders:', error);
    toast({
      title: "Error",
      description: "Failed to load orders",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

const handleStateChange = async (orderId: string, stageToConfirm: OrderState) => {
  try {
    console.log(`🔄 Actualizando orden ${orderId}: confirmando etapa ${stageToConfirm}`);
    
    await updateOrderState(orderId, stageToConfirm);
    
    // Actualizar el estado local
    setOrdenes(prevOrdenes => ({
      ...prevOrdenes,
      pedidos: prevOrdenes.pedidos.map(order => {
        if (order.orderId === orderId) {
          // Crear una nueva etapa IN_PROGRESS (esto lo hará el backend realmente)
          const newEtapa: OrderEtapa = {
            stepName: stageToConfirm,
            status: "IN_PROGRESS", // Temporal, el backend lo cambiará a DONE
            startedAt: new Date().toISOString(),
            finishedAt: null
          };
          
          return {
            ...order,
            // No actualizar status directamente, esperar a que el backend actualice
            etapas: [...(order.etapas || []), newEtapa]
          };
        }
        return order;
      })
    }));
    
    toast({
      title: "Etapa Confirmada",
      description: `Etapa ${stageToConfirm.toLowerCase()} confirmada exitosamente`,
    });

    // Recargar los pedidos después de 2 segundos para obtener el estado actualizado del backend
    setTimeout(() => {
      loadOrders();
    }, 2000);
    
  } catch (error) {
    console.error("Error actualizando estado:", error);
    toast({
      title: "Error",
      description: "Failed to confirm stage",
      variant: "destructive",
    });
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Active Orders</h2>
          <p className="text-muted-foreground">
            {ordenes.pedidos.length} active order{ordenes.pedidos.length !== 1 ? 's' : ''} to manage
          </p>
        </div>

        {ordenes.pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-card rounded-lg border border-border">
            <p className="text-xl text-muted-foreground mb-2">No active orders</p>
            <p className="text-sm text-muted-foreground">New orders will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
            {ordenes.pedidos.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onStateChange={handleStateChange}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Ordenes;
