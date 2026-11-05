import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { cartApi } from "../api/cart";

const CartContext = createContext();

export default function CartProvider({ children }) {
    // Use the safe fallback exactly like your original code
    const auth = useAuth() || {};
    const currentUser = auth.currentUser;

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper to map backend response to frontend format
    const mapCartData = (items) => {
        const mapped = items.map(item => ({
            id: item.product._id,
            productId: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.images?.[0] || '', 
            quantity: item.quantity
        }));
        setCart(mapped);
    };

    // Fetch cart from backend when user logs in
    useEffect(() => {
        const fetchCart = async () => {
            if (!currentUser) {
                setCart([]); // Clear cart if logged out
                return;
            }
            setLoading(true);
            try {
                const data = await cartApi.getCart();
                mapCartData(data.items);
            } catch (error) {
                console.error("Error fetching cart:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [currentUser]);

    const addToCart = async (product) => {
        if (!currentUser) {
            alert("Please login to add items to cart");
            return;
        }
        try {
            await cartApi.addItem(product.id, 1);
            const data = await cartApi.getCart(); // Re-fetch to get exact state from DB
            mapCartData(data.items);
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert(error.response?.data?.message || "Failed to add to cart");
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await cartApi.removeItem(productId);
            setCart((current) => current.filter((item) => item.id !== productId));
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;
        try {
            await cartApi.updateQuantity(productId, quantity);
            setCart((current) =>
                current.map((item) =>
                    item.id === productId ? { ...item, quantity } : item
                )
            );
        } catch (error) {
            console.error("Error updating quantity:", error);
            alert(error.response?.data?.message || "Failed to update quantity");
        }
    };

    const clearCart = async () => {
        try {
            await cartApi.clearCart();
            setCart([]);
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    };

    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const shipping = subtotal > 0 ? 70 : 0;
    const total = subtotal + shipping;

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartItemCount,
                subtotal,
                shipping,
                total,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}