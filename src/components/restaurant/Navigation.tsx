import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, ClipboardList } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">R</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Restaurant Manager</h1>
          </div>
          
          <div className="flex gap-2">
            <NavLink
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary"
              activeClassName="!bg-primary !text-primary-foreground"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </NavLink>
            <NavLink
              to="/orders"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary"
              activeClassName="!bg-primary !text-primary-foreground"
            >
              <ClipboardList className="w-5 h-5" />
              <span className="font-medium">Orders</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};
