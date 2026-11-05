import { Clock } from 'lucide-react';
import OrderCard from './OrderCard';
import EmptyOrder from './EmptyOrder';

function OrderHistory({orders}) {
    return (
        <div className='xl:w-[35%]'>
            <div className='my-5 ml-6 flex gap-3 items-center'>
                <Clock className='text-ring' />
                <h1 className='font-semibold text-2xl  text-foreground'>Order History</h1>
            </div>
            <div className="mt-10">
                {orders.length === 0 ?
                    <EmptyOrder /> :
                    orders.map((order) => (
                        <OrderCard key= {order.id} order={order} />
                    ))
                }
            </div>

        </div>
    )
}

export default OrderHistory
