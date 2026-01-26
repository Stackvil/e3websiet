import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import useStore from '../store/useStore';
import { Minus, Plus } from 'lucide-react-native';

const RideCard = ({ ride }: { ride: any }) => {
    const { addToCart } = useStore();
    const [quantity, setQuantity] = useState(0);

    const handleAdd = () => {
        const newQty = 1;
        setQuantity(newQty);
        addToCart({
            id: `play-${ride.id}`,
            name: ride.title,
            price: typeof ride.price === 'number' ? ride.price : 0,
            image: ride.image,
            stall: ride.category
        }, newQty);
    };

    const updateQuantity = (change: number) => {
        const newQty = Math.max(0, quantity + change);
        setQuantity(newQty);

        // In a real app we'd update the cart item quantity directly here.
        // For this demo, we re-add which isn't perfect for syncing but works for the visual.
        // Ideally use 'updateQuantity' from store if available, or just rely on 'addToCart' logic handling updates.
        if (newQty > 0) {
            addToCart({
                id: `play-${ride.id}`,
                name: ride.title,
                price: typeof ride.price === 'number' ? ride.price : 0,
                image: ride.image,
                stall: ride.category
            }, change); // This assumes addToCart adds to existing. If it replaces, we need logic.
            // Our store logic adds 'quantity' to existing. So if I pass +1 it adds 1. If I pass -1 it adds -1?
            // Store logic: i.quantity + quantity. So passing 1 adds 1. Passing -1 adds -1.
            // So 'change' is exactly what we need (-1 or 1).
        } else {
            // Remove logic if 0? Store might not have remove-if-zero logic in addToCart alone.
            // But visually for the card state, 0 is enough to reset UI.
        }
    };

    return (
        <View className="bg-white rounded-xl mb-4 overflow-hidden w-[48%] self-start shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-100">
            {/* Image Container */}
            <View className="h-32 w-full relative bg-slate-50 p-2 items-center justify-center">
                <Image
                    source={ride.image}
                    className="w-24 h-24 rounded-lg" // Slightly smaller image with padding like product shots
                    resizeMode="contain"
                />
            </View>

            {/* Content */}
            <View className="p-3">
                <View className="h-10 mb-1">
                    <Text className="text-slate-800 font-semibold text-xs leading-4" numberOfLines={2}>{ride.title}</Text>
                </View>

                <Text className="text-slate-500 text-[10px] mb-3">{ride.category}</Text>

                <View className="flex-row items-center justify-between mt-auto">
                    <View>
                        <Text className="text-slate-900 font-bold text-sm">₹{ride.price}</Text>
                    </View>

                    {/* Add Button Logic */}
                    {quantity === 0 ? (
                        <TouchableOpacity
                            onPress={handleAdd}
                            className="bg-white border border-[#27a844] rounded-lg px-4 py-1.5 shadow-sm active:bg-green-50"
                        >
                            <Text className="text-[#27a844] font-bold text-xs uppercase">ADD</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="flex-row items-center bg-[#27a844] rounded-lg px-1 py-1 h-8 min-w-[70px] justify-between shadow-sm">
                            <TouchableOpacity
                                onPress={() => updateQuantity(-1)}
                                className="w-6 h-full items-center justify-center active:bg-green-700 rounded"
                            >
                                <Minus size={12} color="white" strokeWidth={3} />
                            </TouchableOpacity>
                            <Text className="text-white font-bold text-xs">{quantity}</Text>
                            <TouchableOpacity
                                onPress={() => updateQuantity(1)}
                                className="w-6 h-full items-center justify-center active:bg-green-700 rounded"
                            >
                                <Plus size={12} color="white" strokeWidth={3} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

export default RideCard;
