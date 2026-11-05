import { Input } from "../ui/input";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useCart } from '../../context/CartContext';
import { Search, ShoppingCart, Package, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
const Header = ({Link}) => {
  const { currentUser, logout } = useAuth();  
  const { cart } = useCart();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" id="header">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
           <Link to="/" className="text-2xl font-bold tracking-tight text-primary">DeepStore</Link>
           <div className="hidden md:flex relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for gadgets, fashion..." className="pl-10 h-10 w-full rounded-full bg-secondary border-none" />
          </div>

        </div>
         <nav className="flex items-center gap-2 md:gap-6">
          <Link to="/cart" className="relative p-2 hover:bg-secondary rounded-full transition-colors">
            <ShoppingCart className="h-6 w-6" />
            {cart.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full" >
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </Badge>
            )}
          </Link>
          
          <Link to="/orders" className="p-2 hover:bg-secondary rounded-full transition-colors flex items-center gap-2">
            <Package className="h-6 w-6" />
            <span className="hidden sm:inline text-sm font-medium">Orders</span>
          </Link>
          {currentUser ? (
            <div className="flex items-center gap-4 ml-2">
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Welcome,</span>
                <span className="text-sm font-semibold">{currentUser.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { logout(); navigate('/'); }}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="default" className="rounded-full px-6">Login</Button>
            </Link>
          )}
         </nav>
      </div>
    </header>
  )
};
export default Header