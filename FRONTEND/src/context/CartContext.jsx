import { createContext, useContext, useEffect, useState } from "react";
import storage from "../services/storage";
// import { mockCurrentUser } from "./auth";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export default function CartProvider({ children }) {
    //const currentUser = mockCurrentUser;
    const auth = useAuth();
    const currentUser = auth?.currentUser;


    // Cart
    const [cart, setCart] = useState(() => {
        if (!currentUser) return [];

        return storage.get(`cart_${currentUser.cryptoId}`) || [];
    });

    // Reset or load cart when user changes
    useEffect(() => {
        if (!currentUser) {
        setCart([]); // clear cart for guests
        return;
        }
        const savedCart = storage.get(`cart_${currentUser.cryptoId}`) || [];
        setCart(savedCart);
    }, [currentUser]);

    // Persist cart for logged-in user
    useEffect(() => {
        if (!currentUser) return;
        storage.set(`cart_${currentUser.cryptoId}`, cart);
    }, [cart, currentUser]);
    const addToCart = (product) => {

        setCart((currentCart) => {
            const existingItem = currentCart.find(
                (item) => item.productId === product.id
            );

            if (existingItem) {
                return currentCart.map((item) =>
                    item.productId === product.id
                        ? {
                            ...item,
                            quantity: item.quantity + 1
                        }
                        : item
                );
            }

            return [
                ...currentCart,
                {
                    productId: product.id,
                    name: product.name,
                    price: product.priceCents,
                    image: product.image,
                    quantity: 1
                }
            ];
        });
    };

    const removeFromCart = (productId) => {
        setCart((currentCart) =>
            currentCart.filter((item) => item.productId !== productId)
        );
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;

        setCart((currentCart) =>
            currentCart.map((item) =>
                item.productId === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);

        if (currentUser) {
            storage.remove(`cart_${currentUser.id}`);
        }
    };

    // const clearCart = () => {
    //     storage.clear();
    // }

    const cartItemCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const shipping = subtotal > 0 ? 70 : 0;

    const total = subtotal + shipping;


    return (
        <CartContext.Provider
            value={{
                cart,
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
    )
}

// export default CartProvider;
export function useCart() {
    return useContext(CartContext);
}
