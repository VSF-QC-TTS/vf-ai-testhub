import { ChevronRight, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

// This would typically come from shadcn/ui but we'll mock it if it's not ready
// and the user will run shadcn add later.
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function TopHeader({ className, ...props }: ComponentProps<"header">) {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <header 
      className={cn(
        "sticky top-0 z-10 flex h-14 lg:h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6",
        className
      )}
      {...props}
    >
      <div className="flex-1 overflow-x-auto scrollbar-hide">
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          {paths.map((path, index) => {
            const routeTo = `/${paths.slice(0, index + 1).join("/")}`;
            const isLast = index === paths.length - 1;
            const name = path.charAt(0).toUpperCase() + path.slice(1);
            
            return (
              <div key={path} className="flex items-center">
                <ChevronRight className="mx-1 h-4 w-4 shrink-0" />
                {isLast ? (
                  <span className="font-medium text-foreground" aria-current="page">{name}</span>
                ) : (
                  <Link to={routeTo} className="hover:text-foreground transition-colors">{name}</Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Environment affordance */}
        <div className="hidden sm:flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-passed opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-status-passed"></span>
          </span>
          DEV
        </div>

        {/* Language Switcher will go here later */}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
