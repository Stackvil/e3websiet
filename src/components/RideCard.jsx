import React, { useState } from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';

const RideCard = ({ ride }) => {
    const { addToCart, toggleCart } = useStore();
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart({
            id: `play-${ride.id}`,
            name: ride.title,
            price: typeof ride.price === 'number' ? ride.price : 0,
            image: ride.image,
            stall: ride.category
        }, quantity);
        setQuantity(1);
    };

    const handleBuyNow = (e) => {
        e.stopPropagation();
        handleAddToCart(e);
        useStore.getState().isCartOpen || toggleCart();
    };

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all group flex flex-col aspect-square w-full shadow-lg">
            <div className="h-[50%] overflow-hidden relative">
                <img
                    src={ride.image}
                    alt={ride.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-sm font-bold text-sunset-orange border border-sunset-orange/50 shadow-lg">
                    {typeof ride.price === 'number' ? `₹${ride.price}` : ride.price}
                </div>
            </div>

            <div className="p-1.5 flex flex-col h-[50%] justify-center gap-1">
                <h3 className="text-white font-bold text-xs leading-tight truncate text-center">{ride.title}</h3>

                <div className="space-y-1 w-full">
                    {/* Quantity */}
                    <div className="flex items-center justify-between bg-black/20 rounded-md p-0.5 border border-white/5">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-5 h-5 flex items-center justify-center text-white hover:bg-white/10 rounded transition-colors font-bold text-[10px]"
                        >
                            -
                        </button>
                        <span className="text-white font-bold text-[10px] w-5 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-white hover:bg-white/10 rounded transition-colors font-bold text-[10px]"
                        >
                            +
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                        <button
                            onClick={handleAddToCart}
                            className="bg-white/10 hover:bg-white/20 text-white py-1 rounded-md text-[9px] font-bold transition-colors flex items-center justify-center gap-1"
                        >
                            <ShoppingCart size={10} /> Add
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="bg-sunset-orange hover:bg-orange-600 text-white py-1 rounded-md text-[9px] font-bold transition-colors flex items-center justify-center gap-1 shadow-lg shadow-orange-500/20"
                        >
                            Buy <ArrowRight size={10} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RideCard;
