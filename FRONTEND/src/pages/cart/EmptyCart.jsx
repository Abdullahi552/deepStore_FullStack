import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router'


function EmptyCart() {
    return (
        <div className='w-full h-screen flex justify-center items-center'>
            <div className='w-[90%] text-center'>
                <ShoppingBag className="m-auto text-muted-foreground bg-input p-6 rounded-full " size={120} />
                <h1 className='font-bold text-4xl py-6'>Your cart is empty</h1>
                <p className='font-medium text-muted-foreground'>Looks like you haven't added anything to your cart yet.
                    <br />
                    Head back to the shop to find something you love!
                </p>
                <Link to="/">
                    <button className='text-background font-bold cursor-pointer px-6.5 py-2.5 my-6 bg-secondary-foreground rounded-3xl'>Start Shopping</button>
                </Link>
            </div>
        </div>
    )
}

export default EmptyCart
