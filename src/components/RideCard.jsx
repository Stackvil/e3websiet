import React, { useState } from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const RideCard = ({ ride }) => {
    // console.log("Rendering RideCard", ride?.name);
    if (!ride) return null;
    const { addToCart, toggleCart } = useStore();
    const [quantity, setQuantity] = useState(1);

    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // Determine which images to use (uploaded gallery > combo images)
    const galleryImages = (ride.images && ride.images.length > 0)
        ? ride.images
        : (ride.isCombo && ride.comboImages ? ride.comboImages : []);

    // Auto-cycle images if multiple exist
    React.useEffect(() => {
        let interval;
        if (galleryImages.length > 1) {
            interval = setInterval(() => {
                setCurrentImgIndex((prev) => (prev + 1) % galleryImages.length);
            }, 2000); // Change image every 2 seconds
        }
        return () => clearInterval(interval);
    }, [galleryImages]);

    const displayImage = galleryImages.length > 0
        ? galleryImages[currentImgIndex]
        : ride.image;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart({
            id: `play-${ride._id || ride.id}`,
            name: ride.name || ride.title,
            price: Number(ride.price) || 0,
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
        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-500 group flex flex-col aspect-[3/5] md:aspect-[3/4] w-full shadow-lg hover:shadow-2xl hover:shadow-sunset-orange/20 hover:-translate-y-2">
            <div className="h-[60%] overflow-hidden relative">
                <img
                    src={getOptimizedImageUrl(displayImage, 400)}
                    alt={ride.name || ride.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('bg-charcoal-grey'); // Fallback bg
                    }}
                />
                {ride.isCombo && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-sunset-orange border-2 border-white rounded-lg shadow-lg z-10">
                        <p className="text-[9px] text-white font-black text-center whitespace-nowrap leading-tight uppercase tracking-wide">
                            Any 5 Rides
                        </p>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-sm font-bold text-sunset-orange border border-sunset-orange/50 shadow-lg">
                    {typeof ride.price === 'number' ? `₹${ride.price}` : ride.price}
                </div>
                {ride.status === 'closed' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <p className="text-white font-bold bg-red-500/80 px-4 py-2 rounded-lg text-sm transform -rotate-12 border border-red-400">CLOSED</p>
                    </div>
                )}
            </div>

            <div className="p-1 flex flex-col h-[40%] justify-between bg-white">
                <div className="flex flex-col items-center justify-center">
                    <h3 className="text-charcoal-grey font-bold leading-tight text-center line-clamp-1 text-sm">{ride.name || ride.title}</h3>
                </div>

                <div className="space-y-1.5 w-full flex-shrink-0">
                    {/* Quantity */}


                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            onClick={handleAddToCart}
                            disabled={ride.status === 'closed'}
                            className="bg-gray-100 hover:bg-gray-200 text-charcoal-grey py-1.5 rounded-md text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md flex items-center justify-center gap-1 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart size={12} /> Add
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={ride.status === 'closed'}
                            className={`py-1.5 rounded-md text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg flex items-center justify-center gap-1 ${ride.status === 'closed'
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                : 'bg-sunset-orange hover:bg-orange-600 text-white shadow-orange-500/20'
                                }`}
                        >
                            {ride.status === 'closed' ? 'Closed' : 'Buy Ticket'} {ride.status !== 'closed' && <ArrowRight size={12} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RideCard;
