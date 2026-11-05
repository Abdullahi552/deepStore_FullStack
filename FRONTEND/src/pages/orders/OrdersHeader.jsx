import { useAuth } from '../../context/AuthContext';

function OrdersHeader() {

    const {currentUser} = useAuth();    

    return (
        <div className="flex flex-col justify-center my-8 md:ml-6 items-center gap-4 md:flex-row md:justify-between xl:w-[70%]">
            <p className='text-muted-foreground text-center '>
                <h4 className='font-bold text-foreground text-4xl xl:ml-0'>Checkout & Orders</h4>
                    Manage your orders and complete your purchase.
            </p>
            {!currentUser && <p className="w-fit text-sm text-primary-foreground py-1.5 px-4 rounded-3xl font-bold bg-destructive ">Login required to place orders</p>}
        </div>
    )
}

export default OrdersHeader;
