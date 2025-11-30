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
  return data;
};

export const updateOrderState = async (orderId: string, newState: OrderState): Promise<void> => {
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
  
  if (!response.ok) {
    throw new Error('Failed to update order state');
  }
  
  return response.json();
};