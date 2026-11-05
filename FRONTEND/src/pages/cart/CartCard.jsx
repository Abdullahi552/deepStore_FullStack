import { Plus, Minus, Trash } from 'lucide-react';
import { useCart } from '../../context/CartContext';

function CartCard({id, name, price, image, quantity}) {


    const {removeFromCart, updateQuantity } = useCart();
    
    return (
        <div className='w-[95%] flex flex-col items-center mx-auto p-5 rounded-2xl shadow-[0_8px_16px_-3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_16px_-3px_rgba(0,0,0,0.08)] md:flex-row'>
            <div className='w-full md:w-[15%] h-35 md:h-30 rounded-2xl m-auto bg-cover bg-center' style={{ backgroundImage: `url(${image})` }}></div>
            <div className='w-full flex flex-col justify-between md:w-[75%]'>
            <div className="w-full mx-auto my-6 md:mt-0 flex justify-between">
                <p className='text-muted-foreground'>
                    <h4 className='font-bold text-foreground text-xl'>{name}</h4>
                    Fre standard shipping
                </p>
                <h3 className='font-bold text-xl text-ring'>{`$${price}`}</h3>
            </div>
            <div className='w-full m-auto flex justify-between items-center'>
                <div className="flex py-1 px-3 bg-input rounded-xl">
                    <Minus onClick={() => updateQuantity(id, quantity - 1)} size={24} color="black" className='cursor-pointer hover:bg-ring rounded px-1' />
                    <span className='mx-6 font-bold'>{quantity}</span>
                    <Plus onClick={() => updateQuantity(id, quantity + 1)} size={24} color="black" className='cursor-pointer hover:bg-ring rounded px-1'/>
                </div>
                <div onClick={() => removeFromCart(id)} className='flex text-destructive font-bold cursor-pointer'>
                    <Trash />
                    <span>Remove</span>
                </div>
            </div>
            </div>

        </div>
    )
}

export default CartCard
