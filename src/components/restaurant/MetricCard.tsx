// components/restaurant/MetricCard.tsx
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "info" | "destructive";
  description?: string;
  trend?: string;
}

const variantStyles = {
  default: "bg-card text-foreground border-border",
  success: "bg-green-50 text-green-800 border-green-100",
  warning: "bg-orange-50 text-orange-800 border-orange-100",
  info: "bg-blue-50 text-blue-800 border-blue-100",
  destructive: "bg-red-50 text-red-800 border-red-100",
};

const iconColors = {
  default: "text-primary",
  success: "text-green-600",
  warning: "text-orange-600",
  info: "text-blue-600",
  destructive: "text-red-600",
};

export const MetricCard = ({
  title,
  value,
  icon: Icon,
  variant = "default",
  description,
  trend,
}: MetricCardProps) => {
  return (
    <Card className={`p-6 ${variantStyles[variant]} transition-all duration-300 hover:shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${variantStyles[variant].includes('bg-') ? 'bg-white/50' : 'bg-secondary'}`}>
          <Icon className={`w-6 h-6 ${iconColors[variant]}`} />
        </div>
      </div>
      
      {description && (
        <p className="text-sm opacity-70 mt-2">{description}</p>
      )}
      
      {trend && (
        <div className="flex items-center gap-1 mt-4 text-sm">
          <span className={trend.includes('+') ? 'text-green-600' : 'text-red-600'}>
            {trend}
          </span>
          <span className="opacity-60">vs ayer</span>
        </div>
      )}
    </Card>
  );
};