import CartCard from "./CartCard"
import Checkout from "./Checkout"
import { useCart } from '../../context/CartContext';

function CartDeails() {

    const {cart} = useCart();

    return (
        <div>
            <h1 className='font-bold text-4xl my-12 text-foreground ml-8'>Shopping Cart</h1>
            <div className="flex flex-col lg:flex-row">
                <div className="lg:w-[65%]">
                    {cart.map((item) => (
                        <CartCard
                            key={item.id}
                            id={item.productId}
                            image={item.image}
                            name={item.name}
                            price={item.price}
                            quantity={item.quantity}
                        />
                    ))}
                </div>
                <div className="lg:w-[30%]">
                    <Checkout />
                </div>
            </div>

        </div>
    )
}

export default CartDeails;
