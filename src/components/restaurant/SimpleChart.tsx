// components/restaurant/SimpleChart.tsx
import { TrendingUp, TrendingDown } from "lucide-react";

interface SimpleChartProps {
  data: number[];
  labels?: string[];
  title: string;
  color?: string;
}

export const SimpleChart = ({ data, labels, title, color = "blue" }: SimpleChartProps) => {
  // Si no hay datos, mostrar mensaje
  if (!data || data.length === 0 || data.every(val => val === 0)) {
    return (
      <div className="bg-card p-4 rounded-lg border border-border">
        <h3 className="font-medium text-foreground mb-2">{title}</h3>
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const trend = data[data.length - 1] > data[0] ? "up" : "down";
  
  const getColorClasses = () => {
    switch(color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'orange': return 'bg-orange-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-foreground">{title}</h3>
        <div className="flex items-center gap-1 text-sm">
          {trend === "up" ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
            {trend === "up" ? "+" : "-"}{Math.abs(data[data.length - 1] - data[0])}
          </span>
        </div>
      </div>
      
      <div className="flex items-end h-32 gap-1">
        {data.map((value, index) => {
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const dayLabels = labels || ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                {dayLabels[index]}
              </div>
              <div 
                className={`w-full ${getColorClasses()} rounded-t transition-all duration-300`}
                style={{ height: `${height}%` }}
                title={`${value} pedidos`}
              />
              <div className="text-xs mt-1 text-muted-foreground">
                {value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};