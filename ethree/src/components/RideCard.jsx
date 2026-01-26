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
        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all group flex flex-col h-full">
            <div className="h-40 overflow-hidden relative">
                <img
                    src={ride.image}
                    alt={ride.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white border border-white/10">
                    {typeof ride.price === 'number' ? `₹${ride.price}` : ride.price}
                </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-white font-bold text-lg mb-1 leading-tight">{ride.title}</h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2 flex-grow">{ride.desc}</p>

                <div className="mt-auto space-y-3">
                    {/* Quantity */}
                    <div className="flex items-center justify-between bg-black/20 rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-md transition-colors font-bold"
                        >
                            -
                        </button>
                        <span className="text-white font-bold text-sm w-6 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-md transition-colors font-bold"
                        >
                            +
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleAddToCart}
                            className="bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        >
                            Add <ShoppingCart size={14} />
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="bg-sunset-orange hover:bg-orange-600 text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-lg shadow-orange-500/20"
                        >
                            Buy <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RideCard;
