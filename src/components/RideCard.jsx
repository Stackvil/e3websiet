import React, { useState } from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';

const RideCard = ({ ride }) => {
    const { addToCart, toggleCart } = useStore();
    const [quantity, setQuantity] = useState(1);

    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // Auto-cycle images for combo packs
    React.useEffect(() => {
        let interval;
        if (ride.isCombo && ride.comboImages && ride.comboImages.length > 0) {
            interval = setInterval(() => {
                setCurrentImgIndex((prev) => (prev + 1) % ride.comboImages.length);
            }, 2000); // Change image every 2 seconds
        }
        return () => clearInterval(interval);
    }, [ride.isCombo, ride.comboImages]);

    const displayImage = (ride.isCombo && ride.comboImages && ride.comboImages.length > 0)
        ? ride.comboImages[currentImgIndex]
        : ride.image;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart({
            id: `play-${ride._id || ride.id}`,
            name: ride.name || ride.title,
            price: typeof ride.price === 'number' ? ride.price : 0,
            image: ride.image,
            stall: ride.stall || ride.category
        }, quantity);
        setQuantity(1);
    };

    const handleBuyNow = (e) => {
        e.stopPropagation();
        handleAddToCart(e);
        useStore.getState().isCartOpen || toggleCart();
    };

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-500 group flex flex-col aspect-square w-full shadow-lg hover:shadow-2xl hover:shadow-sunset-orange/20 hover:-translate-y-2">
            <div className="h-[55%] overflow-hidden relative">
                <img
                    src={displayImage}
                    alt={ride.name || ride.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('bg-charcoal-grey'); // Fallback bg
                    }}
                />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-sm font-bold text-sunset-orange border border-sunset-orange/50 shadow-lg">
                    {typeof ride.price === 'number' ? `₹${ride.price}` : ride.price}
                </div>
                {ride.status === 'closed' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <p className="text-white font-bold bg-red-500/80 px-4 py-2 rounded-lg text-sm transform -rotate-12 border border-red-400">CLOSED</p>
                    </div>
                )}
            </div>

            <div className="p-1.5 flex flex-col h-[45%] justify-between">
                <div className="flex flex-col items-center justify-center flex-grow">
                    <h3 className={`text-white font-bold leading-tight text-center line-clamp-2 ${ride.isCombo ? 'text-[10px]' : 'text-xs'}`}>{ride.name || ride.title}</h3>
                    {ride.isCombo && <p className="text-[8px] text-sunset-orange font-bold text-center mt-0 whitespace-nowrap leading-tight">Any 5 Rides</p>}
                </div>

                <div className="space-y-1 w-full flex-shrink-0">
                    {/* Quantity */}
                    <div className="flex items-center justify-between bg-black/20 rounded-md p-0.5 border border-white/5 transition-colors hover:border-white/20">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={ride.status === 'closed'}
                            className="w-5 h-5 flex items-center justify-center text-white hover:bg-white/10 rounded transition-all duration-300 hover:scale-110 active:scale-90 font-bold text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            -
                        </button>
                        <span className="text-white font-bold text-[10px] w-5 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            disabled={ride.status === 'closed'}
                            className="w-5 h-5 flex items-center justify-center text-white hover:bg-white/10 rounded transition-all duration-300 hover:scale-110 active:scale-90 font-bold text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            +
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                        <button
                            onClick={handleAddToCart}
                            disabled={ride.status === 'closed'}
                            className="bg-white/10 hover:bg-white/20 text-white py-0.5 rounded-md text-[9px] font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart size={10} /> Add
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={ride.status === 'closed'}
                            className={`py-0.5 rounded-md text-[9px] font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg flex items-center justify-center gap-1 ${ride.status === 'closed'
                                ? 'bg-gray-500 text-gray-300 cursor-not-allowed shadow-none'
                                : 'bg-sunset-orange hover:bg-orange-600 text-white shadow-orange-500/20'
                                }`}
                        >
                            {ride.status === 'closed' ? 'Closed' : 'Buy'} {ride.status !== 'closed' && <ArrowRight size={10} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RideCard;
