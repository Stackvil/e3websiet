import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
    persist(
        (set, get) => ({
            cart: [],
            isCartOpen: false,
            isDarkMode: false,

            toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

            addToCart: (item, quantity = 1) => {
                const cart = get().cart;
                const existingItem = cart.find((i) => i.id === item.id);

                if (existingItem) {
                    set({
                        cart: cart.map((i) =>
                            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
                        ),
                    });
                } else {
                    set({ cart: [...cart, { ...item, quantity: quantity }] });
                }
                // Automatically open cart on add (optional for mobile, maybe navigate?)
                set({ isCartOpen: true });
            },

            removeFromCart: (id) =>
                set((state) => ({
                    cart: state.cart.filter((i) => i.id !== id),
                })),

            updateQuantity: (id, quantity) =>
                set((state) => ({
                    cart: state.cart.map((i) =>
                        i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
                    ).filter(i => i.quantity > 0),
                })),

            clearCart: () => set({ cart: [] }),

            toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

            // Helper to check if stalls are open (9 AM - 11 PM)
            isOpen: () => {
                const hour = new Date().getHours();
                return hour >= 9 && hour < 23;
            }
        }),
        {
            name: 'ethree-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useStore;
