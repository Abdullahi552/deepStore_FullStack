
function OrderCard({order}) {

    const formattedDate = new Date(
        order.createdAt
    ).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });

    return (
        <div className='w-[90%] flex flex-col items-center mx-auto p-5 rounded-2xl shadow-[0_8px_16px_-3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_16px_-3px_rgba(0,0,0,0.08)]'>
                <div className="w-full flex justify-between mb-6 md:mt-0">
                    <p className='w-[70%] text-muted-foreground font-semibold'>
                        ORDER ID
                        <h4 className="text-black">{order.id}</h4>
                    </p>
                    <span className="w-[20%] h-6 rounded-xl text-destructive flex items-center justify-center text-center font-semibold">{order.status}</span>
                </div>
            <div className="w-full flex justify-between items-center md:mt-0 ">
                <p className='w-[50%] text-muted-foreground font-semibold'>
                        {formattedDate}
                        <h4 className="text-black">{order.itemCount}</h4>
                    </p>
                <span className="font-bold text-xl">${order.total}</span>
            </div>
        </div>
    )
}

export default OrderCard
