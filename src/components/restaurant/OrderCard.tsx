import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order, OrderState } from "@/types/order";
import { Clock, ChevronRight, User, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface OrderCardProps {
  order: Order;
  onStateChange: (orderId: string, newState: OrderState) => void;
}

const stateColors = {
  CREATED: "border-l-blue-500",
  COOKING: "border-l-orange-500",
  PACKAGING: "border-l-yellow-500", 
  DELIVERY: "border-l-purple-500",
  DELIVERED: "border-l-green-500",
  COMPLETED: "border-l-gray-500",
  IN_PROGRESS: "border-l-blue-500"
};

const stateLabels = {
  CREATED: "Created",
  COOKING: "Cooking",
  PACKAGING: "Packaging", 
  DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress"
};

const getNextState = (currentState: OrderState): OrderState | null => {
  const stateFlow: Record<OrderState, OrderState | null> = {
    COOKING: "PACKAGING",
    PACKAGING: "DELIVERY", 
    DELIVERY: "DELIVERED",
    DELIVERED: "COMPLETED",
    COMPLETED: null,
  };
  return stateFlow[currentState] || null;
};

const productNames: Record<string, string> = {
  'pollo_1_4': 'Pollo a la Brasa (1/4)',
  'pollo_1_2': 'Pollo a la Brasa (1/2)', 
  'pollo_entero': 'Pollo a la Brasa (Entero)',
  'chicha': 'Chicha Morada',
  'inca_kola': 'Inca Kola',
  'ensalada': 'Ensalada Fresca',
  'papa': 'Papa a la Huancaína'
};

// Función segura para formatear fechas
const formatTimeAgo = (dateString: string): string => {
  try {
    if (!dateString) return "Recently";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Recently";
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.warn('Invalid date format:', dateString);
    return "Recently";
  }
};

// Función segura para obtener ID corto
const getShortId = (id: string | null | undefined): string => {
  if (!id) return "N/A";
  return id.length > 8 ? id.slice(-8) : id;
};

// Función segura para parsear precio
const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  
  try {
    return parseFloat(price) || 0;
  } catch {
    return 0;
  }
};

export const OrderCard = ({ order, onStateChange }: OrderCardProps) => {
  // Validaciones seguras para todos los campos
  const nextState = order?.status ? getNextState(order.status) : null;
  const timeAgo = order?.createdAt ? formatTimeAgo(order.createdAt) : "Recently";
  const showButton = nextState && order?.status !== 'DELIVERED' && order?.status !== 'COMPLETED';
  
  // Si no hay order, mostrar tarjeta vacía
  if (!order) {
    return (
      <Card className="p-5 border-l-4 border-l-gray-300">
        <div className="text-center text-muted-foreground">
          Invalid order data
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-5 border-l-4 ${stateColors[order.status] || 'border-l-gray-500'} hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="font-bold text-lg text-foreground">
              {getShortId(order.orderId)}
            </span>
            <span className="text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground font-medium">
              {stateLabels[order.status] || order.status || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Customer {getShortId(order.customerId)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {(order.items || []).map((item, index) => (
          <div key={`${item?.productId || index}-${index}`} className="flex justify-between items-start text-sm">
            <div className="flex-1">
              <span className="text-foreground font-medium">
                {item?.qty || "0"}x {productNames[item?.productId || ''] || item?.productId || "Unknown Product"}
              </span>
              <div className="text-xs text-muted-foreground">
                ${parsePrice(item?.price).toFixed(2)}
              </div>
              {item?.notes && (
                <p className="text-xs text-muted-foreground italic mt-0.5">
                  Note: {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {/* Mostrar mensaje si no hay items */}
        {(!order.items || order.items.length === 0) && (
          <div className="text-sm text-muted-foreground italic">
            No items in this order
          </div>
        )}
      </div>

      <div className="text-sm font-medium text-foreground mb-3">
        Total: ${(order.total || 0).toFixed(2)}
      </div>

      {showButton ? (
        <Button
          onClick={() => order.orderId && onStateChange(order.orderId, nextState!)}
          className="w-full"
          size="sm"
        >
          Move to {stateLabels[nextState!]}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      ) : (
        <div className="text-center text-sm text-muted-foreground py-2">
          {order.status === 'DELIVERED' ? 'Order delivered' : 
           order.status === 'COMPLETED' ? 'Order completed' : 'No actions available'}
        </div>
      )}
    </Card>
  );
};