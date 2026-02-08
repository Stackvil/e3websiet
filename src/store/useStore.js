import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set, get) => ({
            cart: [],
            isCartOpen: false,
            isDarkMode: false,

            toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
            closeCart: () => set({ isCartOpen: false }),

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
                // Automatically open cart on add
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
            },

            user: null,
            setUser: (user) => set({ user }),

            tickets: [], // Store for confirmed tickets
            addTicket: (ticket) => set((state) => {
                if (state.tickets.some(t => t.id === ticket.id)) return state;
                return { tickets: [ticket, ...state.tickets] };
            }),
            clearTickets: () => set({ tickets: [] }),
        }),
        {
            name: 'ethree-storage-v1',
        }
    )
);

export default useStore;
