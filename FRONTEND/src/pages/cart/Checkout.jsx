import { ArrowRight } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router";

function Checkout() {
    const { cart, subtotal, shipping, total } = useCart();

    const navigate = useNavigate()

    const handleCheckout = () => {
        
        if (cart.length === 0) {
            return;
        }

        navigate("/orders");
    };

    return (
        <div className="w-[95%] flex flex-col gap-4 my-8 mx-auto bg-foreground text-accent-foreground p-8 rounded-2xl lg:my-0">
            <h3 className="text-2xl font-bold">Order Summary</h3>
            <div className="flex justify-between font-bold">
                <p className="text-input">Subtotal </p>
                <span>${`${subtotal}`}</span>
            </div>
            <div className="flex justify-between font-bold">
                <p className="text-input">Shipping</p>
                <span>${`${shipping}`}</span>
            </div>
            <div className="flex justify-between font-bold">
                <p className="text-input">Estimamted Tax </p>
                <span>$54.75</span>
            </div>
            <hr className="text-input my-3" />
            <div className="flex justify-between font-bold text-2xl">
                <h3>Total </h3>
                <span>${`${total}`}</span>
            </div>
            <button onClick= {handleCheckout} disabled={cart.length === 0} className="font-bold mt-3 text-foreground bg-card py-4 rounded-2xl flex justify-center items-center gap-2 cursor-pointer">
                Checkout <ArrowRight size={18} />
            </button>
            <p className="text-center text-muted-foreground">
                secure checkout powered by local storage
            </p>
        </div>
    );
}

export default Checkout;
