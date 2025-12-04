import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order, OrderState, OrderEtapa } from "@/types/order";
import { es } from 'date-fns/locale';
import { 
  Clock, 
  ChevronRight, 
  User, 
  Hash, 
  Utensils,
  Package as PackageIcon,
  Truck, 
  CheckCircle,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";

interface OrderCardProps {
  order: Order;
  onStateChange: (orderId: string, stateToConfirm: OrderState) => Promise<void>;
  onRefresh?: () => void;
}

const stateColors = {
  COOKING: "border-l-orange-500",
  PACKAGING: "border-l-yellow-500", 
  DELIVERY: "border-l-purple-500",
  DELIVERED: "border-l-green-500",
  CREATED: "border-l-blue-500",
  COMPLETED: "border-l-gray-500",
  IN_PROGRESS: "border-l-blue-500",
  DONE: "border-l-green-500"
};

const stateLabels = {
  COOKING: "Cocción",
  PACKAGING: "Empaquetado", 
  DELIVERY: "Envío",
  DELIVERED: "Entregado",
  CREATED: "Creado",
  COMPLETED: "Completado",
  IN_PROGRESS: "En Progreso",
  DONE: "Completado"
};

const stateIcons = {
  COOKING: Utensils,
  PACKAGING: PackageIcon,
  DELIVERY: Truck,
  DELIVERED: CheckCircle
};

// FUNCIÓN AUXILIAR: Obtener nombre del producto basado en productId
const getProductName = (productId?: string): string => {
  if (!productId) return "Producto";
  
  const productMap: Record<string, string> = {
    "pollo_1_4": "1/4 de Pollo a la Brasa",
    "pollo_1_2": "1/2 Pollo a la Brasa",
    "pollo_entero": "Pollo Entero a la Brasa",
    "chicha": "Chicha Morada Grande",
    "inca_kola": "Inca Kola 500ml",
    "coca_cola": "Coca Cola 500ml",
    "agua_mineral": "Agua Mineral 625ml",
    "papas_fritas": "Papas Fritas",
    "ensalada_fresca": "Ensalada Fresca",
    "yuca_frita": "Yuca Frita",
    "arroz_chaufa": "Arroz Chaufa"
  };
  
  return productMap[productId] || productId.replace(/_/g, ' ');
};

// FUNCIÓN AUXILIAR: Obtener precio seguro
const getSafePrice = (price: any): number => {
  if (!price) return 0;
  const parsed = parseFloat(price);
  return isNaN(parsed) ? 0 : parsed;
};

// FUNCIÓN AUXILIAR: Obtener cantidad segura
const getSafeQuantity = (qty: any): number => {
  if (!qty) return 1;
  const parsed = parseInt(qty);
  return isNaN(parsed) ? 1 : Math.max(1, parsed);
};

// FUNCIÓN CORREGIDA - Prioriza etapas por orden de flujo
const getStageToConfirm = (etapas: OrderEtapa[]): OrderState | null => {
  if (!etapas || etapas.length === 0) {
    console.log("📭 No hay etapas, devolviendo COOKING");
    return "COOKING";
  }
  
  console.log("🔍 ANALIZANDO ETAPAS para determinar próxima confirmación:");
  console.table(etapas.map((e, i) => ({
    index: i,
    step: e.stepName,
    status: e.status,
    started: e.startedAt?.substring(11, 16) || 'N/A',
    finished: e.finishedAt?.substring(11, 16) || 'N/A'
  })));
  
  // ORDEN DE ETAPAS (de menos a más avanzada)
  const FLOW = ["COOKING", "PACKAGING", "DELIVERY", "DELIVERED"];
  
  // 1. Primero, identificar la etapa MÁS AVANZADA que esté IN_PROGRESS
  let mostAdvancedInProgress: OrderState | null = null;
  
  for (let i = FLOW.length - 1; i >= 0; i--) {
    const stage = FLOW[i];
    const hasStageInProgress = etapas.some(e => 
      e.stepName === stage && e.status === "IN_PROGRESS"
    );
    
    if (hasStageInProgress) {
      mostAdvancedInProgress = stage as OrderState;
      console.log(`🎯 Etapa más avanzada IN_PROGRESS: ${mostAdvancedInProgress}`);
      break;
    }
  }
  
  if (mostAdvancedInProgress) {
    // Verificar si esta etapa ya tiene un registro DONE (inconsistencia)
    const hasStageDone = etapas.some(e => 
      e.stepName === mostAdvancedInProgress && 
      (e.status === "DONE" || e.status === "COMPLETED")
    );
    
    if (hasStageDone) {
      console.log(`⚠️ INCONSISTENCIA: ${mostAdvancedInProgress} tiene tanto DONE como IN_PROGRESS`);
      
      // Buscar la siguiente etapa en el flujo
      const currentIndex = FLOW.indexOf(mostAdvancedInProgress);
      if (currentIndex < FLOW.length - 1) {
        const nextStage = FLOW[currentIndex + 1] as OrderState;
        console.log(`💡 Saltando a siguiente etapa: ${nextStage}`);
        return nextStage;
      }
    } else {
      return mostAdvancedInProgress;
    }
  }
  
  // 2. Si no hay IN_PROGRESS, determinar cuál debería ser la siguiente
  // Verificar qué etapas ya están DONE
  const etapasDone = etapas.filter(e => 
    e.status === "DONE" || e.status === "COMPLETED"
  );
  
  const cookingDone = etapasDone.some(e => e.stepName === "COOKING");
  const packagingDone = etapasDone.some(e => e.stepName === "PACKAGING");
  const deliveryDone = etapasDone.some(e => e.stepName === "DELIVERY");
  const deliveredDone = etapasDone.some(e => e.stepName === "DELIVERED");
  
  console.log("📊 Etapas DONE:", { cookingDone, packagingDone, deliveryDone, deliveredDone });
  
  // Determinar próxima etapa basada en el flujo
  if (!cookingDone) return "COOKING";
  if (cookingDone && !packagingDone) return "PACKAGING";
  if (cookingDone && packagingDone && !deliveryDone) return "DELIVERY";
  if (cookingDone && packagingDone && deliveryDone && !deliveredDone) return "DELIVERED";
  
  console.log("❌ No se encontró etapa para confirmar");
  return null;
};

// Formatear fecha
const formatTimeAgo = (dateString: string): string => {
  try {
    if (!dateString) return "Recientemente";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recientemente";
    return formatDistanceToNow(date, { addSuffix: false, locale: es});
  } catch {
    return "Recientemente";
  }
};

// Obtener ID corto
const getShortId = (id: string | null | undefined): string => {
  if (!id) return "N/A";
  return id.length > 8 ? `${id.slice(-8)}...` : id;
};

export const OrderCard = ({ order, onStateChange, onRefresh }: OrderCardProps) => {
  const [loading, setLoading] = useState(false);
  const [lastConfirmed, setLastConfirmed] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState(order);
  
  // Actualizar el pedido local cuando cambia el prop
  useEffect(() => {
    setLocalOrder(order);
    console.log("🔄 OrderCard recibió nuevo pedido:", order.orderId);
  }, [order]);
  
  // Determinar la etapa actual que necesita confirmación
  const stageToConfirm = getStageToConfirm(localOrder.etapas || []);
  
  console.log("📊 OrderCard - Estado actual:", {
    orderId: localOrder.orderId,
    status: localOrder.status,
    stageToConfirm,
    etapas: localOrder.etapas?.map(e => `${e.stepName}: ${e.status}`)
  });
  
  const timeAgo = formatTimeAgo(localOrder.createdAt);
  const StageIcon = stageToConfirm ? stateIcons[stageToConfirm as keyof typeof stateIcons] : Utensils;
  
  // Mostrar botón solo si:
  // 1. Hay una etapa para confirmar
  // 2. La etapa NO es DELIVERED (no necesita confirmación manual)
  // 3. NO estamos en proceso de confirmar esta etapa
  const showConfirmButton = stageToConfirm && 
    stageToConfirm !== "DELIVERED" &&
    !loading;
  
  const handleConfirm = async () => {
    if (!stageToConfirm || !localOrder.orderId) return;
    
    setLoading(true);
    setLastConfirmed(stageToConfirm);
    console.log(`📤 Confirmando etapa: ${stageToConfirm} para orden ${localOrder.orderId}`);
    
    try {
      await onStateChange(localOrder.orderId, stageToConfirm);
      
      // Simular actualización local mientras esperamos el refresh del backend
      if (localOrder.etapas) {
        const updatedEtapas = [...localOrder.etapas];
        // Buscar si ya existe esta etapa y actualizarla
        const etapaIndex = updatedEtapas.findIndex(e => 
          e.stepName === stageToConfirm && e.status === "IN_PROGRESS"
        );
        
        if (etapaIndex !== -1) {
          updatedEtapas[etapaIndex] = {
            ...updatedEtapas[etapaIndex],
            status: "DONE",
            finishedAt: new Date().toISOString()
          };
        } else {
          // Agregar nueva etapa como DONE
          updatedEtapas.push({
            stepName: stageToConfirm,
            status: "DONE",
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString()
          });
        }
        
        setLocalOrder(prev => ({
          ...prev,
          etapas: updatedEtapas
        }));
      }
      
      // Esperar un poco y luego refrescar
      setTimeout(() => {
        if (onRefresh) {
          onRefresh();
        }
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error confirmando etapa:", error);
      setLoading(false);
      setLastConfirmed(null);
    }
  };

  // Determinar color del borde
  const getBorderColor = () => {
    if (stageToConfirm) return stateColors[stageToConfirm] || "border-l-gray-500";
    if (localOrder.status === "DELIVERED" || localOrder.status === "COMPLETED") 
      return "border-l-green-500";
    return "border-l-gray-500";
  };

  // Determinar texto del botón
  const getButtonText = () => {
    if (loading) return "Confirmando...";
    
    switch (stageToConfirm) {
      case "COOKING": return "✅ Confirmar Cocción Lista";
      case "PACKAGING": return "📦 Confirmar Empaquetado";
      case "DELIVERY": return "🚚 Confirmar Envío";
      default: return "Confirmar Etapa";
    }
  };

  return (
    <Card className={`p-5 border-l-4 ${getBorderColor()} hover:shadow-lg transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {StageIcon && (
              <div className={`p-2 rounded-full ${
                stageToConfirm === "COOKING" ? "bg-orange-100" :
                stageToConfirm === "PACKAGING" ? "bg-yellow-100" :
                stageToConfirm === "DELIVERY" ? "bg-purple-100" :
                "bg-gray-100"
              }`}>
                <StageIcon className={`w-5 h-5 ${
                  stageToConfirm === "COOKING" ? "text-orange-600" :
                  stageToConfirm === "PACKAGING" ? "text-yellow-600" :
                  stageToConfirm === "DELIVERY" ? "text-purple-600" :
                  "text-gray-600"
                }`} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="font-bold text-lg text-foreground">
                  {getShortId(localOrder.orderId)}
                </span>
              </div>
              <div className="mt-1">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  stageToConfirm === "DELIVERED" || localOrder.status === "DELIVERED" 
                    ? "bg-green-100 text-green-800"
                    : stageToConfirm === "DELIVERY"
                    ? "bg-purple-100 text-purple-800"
                    : stageToConfirm === "PACKAGING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-orange-100 text-orange-800"
                }`}>
                  {stageToConfirm ? stateLabels[stageToConfirm] : localOrder.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <User className="w-4 h-4" />
            <span>Cliente: {getShortId(localOrder.customerId)}</span>
          </div>
        </div>
      </div>

      {/* Items - CORREGIDO CON VALIDACIONES */}
      <div className="space-y-3 mb-4">
        {(localOrder.items || []).map((item, index) => {
          // Validaciones seguras
          const productName = getProductName(item.productId);
          const quantity = getSafeQuantity(item.qty);
          const price = getSafePrice(item.price);
          const total = price * quantity;
          
          return (
            <div key={index} className="flex justify-between items-center p-2 bg-secondary/20 rounded-lg">
              <div>
                <span className="font-medium text-foreground">
                  {quantity}x {productName}
                </span>
                {item.notes && (
                  <p className="text-xs text-muted-foreground italic mt-0.5">
                    {item.notes}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="font-medium">S/. {price.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">
                  S/. {total.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total - CORREGIDO */}
      <div className="flex justify-between items-center mb-4 p-3 bg-secondary/10 rounded-lg">
        <span className="font-semibold text-foreground">Total:</span>
        <span className="font-bold text-lg">
          S/. {getSafePrice(localOrder.total).toFixed(2)}
        </span>
      </div>

      {/* Botón de confirmación o estado */}
      {showConfirmButton ? (
        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {getButtonText()}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {getButtonText()}
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      ) : (
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            {stageToConfirm === "DELIVERED" || localOrder.status === "DELIVERED" || localOrder.status === "COMPLETED" ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Pedido entregado</span>
              </>
            ) : loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span>Esperando siguiente etapa...</span>
              </>
            )}
          </div>
          {lastConfirmed && (
            <p className="text-xs text-green-600 mt-1">
              ✓ {stateLabels[lastConfirmed as keyof typeof stateLabels]} confirmada
            </p>
          )}
        </div>
      )}
    </Card>
  );
};