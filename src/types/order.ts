export type OrderState = "COOKING" | "PACKAGING" | "DELIVERY" | "DELIVERED" | "COMPLETED";

export interface DashboardMetrics {
  pedidosPorEstado: {
    CREATED: number;
    COOKING: number;
    PACKAGING: number;
    DELIVERY: number;
    DELIVERED: number;
    COMPLETED: number;
    IN_PROGRESS: number;
  };
  tiempoPorEtapa: {
    COOKING: number;
    PACKAGING: number;
    DELIVERY: number;
  };
  pedidosUltimaSemana: number[];
  productosPopulares: productoPopular[];
}

export interface productoPopular {
  producto: string;
  cantidad: number;
}

export interface OrderItem {
  productId: string;
  price: string;
  qty: string;
  notes?: string;
}

export interface OrderEtapa {
  stepName: string;
  status: OrderState;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface Orders {
  pedidos: Order[];
  total: number;
  message?: string;
}

export interface Order {
  orderId: string;
  customerId: string;
  status: OrderState; // Este es el campo importante
  createdAt: string;
  etapas: OrderEtapa[];
  items: OrderItem[];
  total: number;
  // Agregar estos campos opcionales si tu backend los provee
  currentStep?: string;
  customerName?: string;
}