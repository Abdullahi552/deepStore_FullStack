import { CheckCircle  } from "lucide-react";
import { Link } from "react-router";

function CompleteOder() {
    return (
        <div className='w-full h-screen flex justify-center items-center'>
            <div className='w-[90%] text-center'>
                <CheckCircle  className="m-auto text-muted-foreground bg-green-300 p-6 rounded-full " size={120} />
                <h1 className='font-bold text-4xl py-6'>Order Successfull!!</h1>
                <p className='font-medium text-muted-foreground'>Thank you for shopping with DeepStore.
                    <br />
                    Your order has been received and is being processed.
                </p>
                <Link to="/orders">
                    <button className='bg-background font-semibold border border-secondary-foreground hover:text-white hover:bg-accent hover:border-0 cursor-pointer px-6.5 py-2.5 my-6 text-secondary-foreground rounded-3xl'>View Order History</button>
                </Link>
            </div>
        </div>
    )
}

export default CompleteOder;
