// services/mockApi.ts
import { Order, OrderState, DashboardMetrics, Orders } from "@/types/order";

const BASE_URL = "https://wlgzjwd1w9.execute-api.us-east-1.amazonaws.com";

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const response = await fetch(BASE_URL + '/dashboard/metricas');
  if (!response.ok) throw new Error('Failed to fetch metrics');
  return response.json();
};

export const fetchActiveOrders = async (): Promise<Orders> => {
  const response = await fetch(BASE_URL + '/dashboard/pedidos');
  if (!response.ok) throw new Error('Failed to fetch orders');
  const data = await response.json();
  
  // Filtrar solo pedidos que no están COMPLETED
  const activePedidos = data.pedidos.filter((pedido: any) => 
    pedido.status !== "COMPLETED"
  );
  
  return {
    ...data,
    pedidos: activePedidos,
    total: activePedidos.length
  };
};

export const updateOrderState = async (orderId: string, newState: OrderState): Promise<void> => {
  console.log(`📤 Enviando confirm-stage para ${orderId}`);
  console.log(`Estado a confirmar: ${newState}`);
  console.log(`Body completo:`, { 
    stage: newState, 
    userId: "supervisor_cocina", 
    tenantId: "pardos" 
  });
  
  const response = await fetch(BASE_URL + `/orders/${orderId}/confirm-stage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      stage: newState, 
      userId: "supervisor_cocina", 
      tenantId: "pardos" 
    })
  });
  
  console.log(`📥 Respuesta del backend: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error del backend:', errorText);
    throw new Error(`Failed to update order state: ${errorText}`);
  }
  
  const result = await response.json();
  console.log('✅ Resultado del backend:', result);
  return result;
};