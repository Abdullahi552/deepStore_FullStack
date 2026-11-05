import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { cartApi } from "../api/cart";

const CartContext = createContext();

export default function CartProvider({ children }) {
    const auth = useAuth();
    const currentUser = auth?.currentUser;

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch cart from backend whenever user logs in or out
    useEffect(() => {
        const fetchCart = async () => {
            if (!currentUser) {
                setCart([]);
                return;
            }
            setLoading(true);
            try {
                const data = await cartApi.getCart();
                // Backend returns items: [{ product: {...}, quantity, lineTotal }]
                // Map it to what your UI components expect
                const mappedItems = data.items.map(item => ({
                    id: item.product._id,
                    productId: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image,
                    quantity: item.quantity
                }));
                setCart(mappedItems);
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
            // product.id comes from the mapped UI object
            await cartApi.addItem(product.id, 1);
            // Re-fetch cart to get updated state from DB
            const data = await cartApi.getCart();
            const mappedItems = data.items.map(item => ({
                id: item.product._id,
                productId: item.product._id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image,
                quantity: item.quantity
            }));
            setCart(mappedItems);
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert(error.response?.data?.message || "Failed to add to cart");
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await cartApi.removeItem(productId);
            setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;
        try {
            await cartApi.updateQuantity(productId, quantity);
            setCart((currentCart) =>
                currentCart.map((item) =>
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