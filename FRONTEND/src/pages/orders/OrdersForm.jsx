import { MapPin, Wallet } from 'lucide-react'
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

function OrdersForm({onOrderCreated, completeOrder}) {

    const navigate = useNavigate();

    const { currentUser } = useAuth();

    const {
        cart,
        clearCart,
        total,
    } = useCart();

    const {
        register,
        handleSubmit,
        formState: {
            isValid,
        },
    } = useForm({
        mode: "onChange",
    });

    const handlePlaceOrder = (shippingData) => {
        // Check authentication
        if (!currentUser) {
            alert("Please login to place an order");

            navigate("/login");

            return;
        }

        // Check cart
        if (cart.length === 0) {
            alert("Your cart is empty");

            return;
        }

        try {
            // Create snapshot of cart items
            const orderItems = cart.map((item) => ({
                productId: item.id,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
            }));

            // Create order
            const newOrder = orderService.createOrder(
                currentUser.cryptoId,
                {
                    items: orderItems,

                    itemCount: orderItems.length,

                    shippingDetails: shippingData,

                    total: total,

                    paymentMethod: "cash_on_delivery",

                    status: "processing",
                }
            );

            // Update the order history immediately
            onOrderCreated(newOrder)

            // Clear the cart
            clearCart();

            // alert("Order placed successfully!");
            completeOrder();


        } catch (error) {
            console.error("Failed to place order:", error);

            alert("Failed to place order");
        }
    };


    return (
        <div className='xl:w-[40%]'>
            <div className='my-5 ml-6 flex gap-3 items-center'>
                <MapPin className='text-ring' />
                <h1 className='font-semibold text-2xl text-foreground'>Shipping Details</h1>
            </div>
            <form 
                onSubmit={handleSubmit(handlePlaceOrder)}
                className="w-full p-6 bg-white">
                <div className="flex flex-wrap -mx-3 ">
                    <div className="w-1/2 px-3 mb-6 md:mb-0">
                        <label className="font-bold block tracking-wide text-gray-700 text-xs mb-2" htmlFor="first-name">
                            First Name
                        </label>
                        <input 
                            className="appearance-none block w-full text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="first-name" 
                            type="text" 
                            placeholder="First Name"
                            required
                            {...register("fullName", {
                                required: true,
                            })}
                            />
                    </div>
                    <div className="w-1/2 px-3">
                        <label className="font-bold block tracking-wide text-gray-700 text-xs mb-2" htmlFor="last-name">
                            Last Name
                        </label>
                        <input className="appearance-none block w-full text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                            id="last-name" 
                            type="text" 
                            placeholder="Last Name"
                            required
                            {...register("Last Name", {
                                required: true,
                            })}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3 mt-6">
                        <label className="font-bold block tracking-wide text-gray-700 text-xs mb-2" htmlFor="address">
                            Address
                        </label>
                        <input className="appearance-none block w-full text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                            id="address" 
                            type="text" 
                            placeholder="123 Deep Tech Street"
                            required
                            {...register("Address", {
                                required: true,
                            })}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap -mx-3">
                    <div className="w-1/2 px-3 md:mb-0">
                        <label className="font-bold block tracking-wide text-gray-700 text-xs mb-2" htmlFor="city">
                            City
                        </label>
                        <input className="appearance-none block w-full text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                            id="city" 
                            type="text" 
                            placeholder="Lagos"
                            required
                            {...register("fullName", {
                                required: true,
                            })}
                        />
                    </div>
                    <div className="w-1/2 px-3">
                        <label className="font-bold block tracking-wide text-gray-700 text-xs mb-2" htmlFor="zip">
                            Zip
                        </label>
                        <input className="appearance-none block w-full text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                            id="zip" 
                            type="text" 
                            placeholder="100001"
                            required
                            {...register("Zip Code", {
                                required: true,
                            })}
                        />
                    </div>
                </div>
                <div className="payment-section">
                    <div className='my-6 flex gap-3 items-center'>
                        <Wallet className='text-ring' />
                        <h1 className='font-semibold text-2xl text-foreground'>Payment</h1>
                    </div>
                    <div className="w-full text-sm font-semibold py-6 px-4 text-muted-foreground border-2 bg-muted border-dashed border-muted-foregroundforeground rounded-xl">
                        <p className='mb-3 '>Payment Method: <span className='text-ring'>Cash on Delivery</span></p>
                        <p>For this internship project, we only simulate cash on delivery orders. No real transaction will occur</p>
                    </div>
                </div>

                <button className="w-full mt-4 bg-ring text-white font-bold py-4 rounded-xl focus:outline-none focus:shadow-outline"
                        type="submit"
                        disabled={cart.length === 0}
                >
                    Confirm Order(${total})
                </button>
            </form>
            { !currentUser && <p className='text-center text-destructive font-semibold'>Please login first to place an order.</p>}
            { cart.length === 0 && <p className='text-center text-muted-foreground font-semibold'>Add items to cart to checkout</p>}


        </div>
    )
}

export default OrdersForm;
