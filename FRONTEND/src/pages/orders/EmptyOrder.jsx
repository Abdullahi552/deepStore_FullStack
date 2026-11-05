import { Package } from "lucide-react";

function EmptyOrder() {
    return (
        <div className='w-[90%] flex justify-center items-center mx-auto mb-10 p-12 rounded-2xl border-2 border-dashed border-muted-foreground shadow-[0_8px_16px_-3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_16px_-3px_rgba(0,0,0,0.08)]'>
            <div className='w-[90%] text-center'>
                <Package className="m-auto text-muted-foreground rounded-full " size={50} />
                <p className='font-medium text-muted-foreground'>No previous orders found.
                </p>
            </div>
        </div>
    )
}

export default EmptyOrder;
