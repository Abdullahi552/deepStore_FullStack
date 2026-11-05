import { useEffect, useState } from "react";
import { orderService } from "../../services/orderService";
import OrderHistory from "./OrderHistory"
import OrdersForm from "./OrdersForm"
import OrdersHeader from "./OrdersHeader"
import CompleteOder from "./CompleteOder";
import { useAuth } from "../../context/AuthContext";

function Orders() {

    const { currentUser } = useAuth();    

    const [completeOrder, setCompleteOrder] = useState(false);

    // const currentUser = mockCurrentUser

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!currentUser) {
            setOrders([]);
            return;
        }

        const savedOrders = orderService.getOrders(
            currentUser.cryptoId
        );

        setOrders(savedOrders);
    }, [currentUser]);


    const handleOrderCreated = (newOrder) => {
        setOrders((previousOrders) => [
            newOrder,
            ...previousOrders,
        ]);
    };

    const completed = () => {

            setCompleteOrder(true)

            setTimeout(() => {
                setCompleteOrder(prev => !prev)
            }, 5000);
    }


    return (
        <div>
            {completeOrder ? 
                <CompleteOder /> :
                <div>
                <OrdersHeader />
                <div className="mt-12 flex flex-col xl:flex-row">
                    <OrdersForm onOrderCreated={handleOrderCreated} completeOrder= {completed} />
                    <OrderHistory orders={orders} />
                </div>
            </div>
            }

        </div>
    )
}

export default Orders
