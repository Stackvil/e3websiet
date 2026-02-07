import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Calendar, Users, Utensils, Power, Gamepad2, Ticket, Package } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', category: 'dine', price: '', description: '', image: '' });

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const headers = { 'x-auth-token': token };
            try {
                const [bookingsRes, productsRes] = await Promise.all([
                    fetch('http://localhost:5001/api/bookings', { headers }).catch(err => ({ ok: false, json: () => [] })),
                    fetch('http://localhost:5001/api/products')
                ]);

                const bookingsData = await bookingsRes.json();
                const productsData = await productsRes.json();

                if (Array.isArray(bookingsData)) setBookings(bookingsData);
                if (Array.isArray(productsData)) setProducts(productsData);
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };
        fetchData();


    }, []);

    const handleEditItem = (item) => {
        setEditingItem(item);
        // Default category to 'play' if in 'rides' tab, else 'dine' or item's category
        const defaultCategory = activeTab === 'rides' ? 'play' : 'dine';
        setFormData(item ? { ...item } : { name: '', category: defaultCategory, price: '', description: '', image: '' });
        setShowModal(true);
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`http://localhost:5001/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            setProducts(products.filter(p => p._id !== id));
        } catch (err) {
            alert('Error deleting item');
        }
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = editingItem
            ? `http://localhost:5001/api/products/${editingItem._id}`
            : 'http://localhost:5001/api/products';
        const method = editingItem ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(formData)
            });
            const savedItem = await res.json();
            if (editingItem) {
                setProducts(products.map(p => p._id === savedItem._id ? savedItem : p));
            } else {
                setProducts([...products, savedItem]);
            }
            setShowModal(false);
        } catch (err) {
            alert('Error saving item');
        }
    };

    const tabs = [
        { id: 'bookings', label: 'Bookings', icon: Calendar },
        { id: 'dine', label: 'Dine', icon: Utensils },
        { id: 'rides', label: 'Rides', icon: Gamepad2 },
        { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
    ];

    // Helper to get filtered products
    const getVisibleProducts = () => {
        if (activeTab === 'rides') return products.filter(p => p.category === 'play');
        if (activeTab === 'dine') return products.filter(p => p.category === 'dine' || !p.category); // Dine shows food items
        return [];
    };

    const visibleProducts = getVisibleProducts();

    return (
        <div className="min-h-screen bg-gray-50 flex pt-20">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r h-[calc(100vh-80px)] fixed left-0">
                <div className="p-6">
                    <h2 className="text-xl font-heading font-bold text-charcoal-grey">Admin Panel</h2>
                </div>
                <nav className="mt-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-6 py-4 transition-colors ${activeTab === tab.id
                                ? 'bg-riverside-teal/10 text-riverside-teal border-r-4 border-riverside-teal'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <header className="mb-10 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-charcoal-grey">
                                {tabs.find(t => t.id === activeTab).label}
                            </h1>
                            <p className="text-gray-500 mt-2">Manage your Ethree operations seamlessly.</p>
                        </div>
                        <button className="flex items-center text-red-500 hover:text-red-600 font-medium">
                            <Power className="w-5 h-5 mr-2" />
                            Logout
                        </button>
                    </header>



                    {activeTab === 'bookings' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="bg-white p-6 rounded-xl border shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 bg-riverside-teal/10 text-riverside-teal rounded-full text-xs font-bold font-heading">
                                            {booking.facility}
                                        </span>
                                        <span className="text-gray-400 text-sm">#{booking.id}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-charcoal-grey">{booking.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{booking.date}</p>
                                    <div className="mt-6 flex gap-2">
                                        <button className="flex-1 bg-riverside-teal text-white py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors">Confirm</button>
                                        <button className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'dine' && (
                        <div>
                            <div className="mb-6 flex justify-end">
                                <button
                                    onClick={() => handleEditItem(null)} // Open modal for new item
                                    className="bg-riverside-teal text-white px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors flex items-center"
                                >
                                    <Utensils className="w-5 h-5 mr-2" />
                                    Add New Item
                                </button>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {visibleProducts.map((item) => (
                                    <div key={item._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group relative hover:shadow-md transition-all">
                                        <div className="relative h-40 overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute top-2 right-2 bg-charcoal-grey/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white">
                                                ₹{item.price}
                                            </div>
                                            {item.status === 'off' && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                                    <p className="text-white font-bold bg-red-500/80 px-3 py-1 rounded text-xs">Closed</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <div className="mb-4">
                                                <h3 className="font-bold text-charcoal-grey truncate">{item.stall || item.name}</h3>
                                                <p className="text-gray-400 text-xs truncate capitalize">{item.cuisine || item.category} Cuisine</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handleEditItem(item)}
                                                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-gray-50 text-charcoal-grey hover:bg-riverside-teal hover:text-white transition-colors border border-gray-100"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item._id)}
                                                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'rides' && (
                        <div>
                            <div className="mb-6 flex justify-end">
                                <button
                                    onClick={() => handleEditItem(null)}
                                    className="bg-riverside-teal text-white px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors flex items-center"
                                >
                                    <Package className="w-5 h-5 mr-2" />
                                    Add New Ride
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {visibleProducts.map((ride) => (
                                    <div key={ride._id} className="bg-white backdrop-blur-md rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group flex flex-col aspect-square w-full shadow-sm relative">
                                        <div className="h-[55%] overflow-hidden relative">
                                            <img
                                                src={ride.image}
                                                alt={ride.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-sm font-bold text-sunset-orange border border-sunset-orange/50 shadow-lg">
                                                ₹{ride.price}
                                            </div>
                                        </div>

                                        <div className="p-2 flex flex-col h-[45%] justify-between bg-charcoal-grey">
                                            <div className="flex flex-col items-center justify-center flex-grow">
                                                <h3 className="text-white font-bold text-xs leading-tight text-center line-clamp-2">{ride.name}</h3>
                                                {ride.isCombo && <p className="text-[10px] text-sunset-orange font-bold text-center mt-0.5">Any 5 Rides</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                                <button
                                                    onClick={() => handleEditItem(ride)}
                                                    className="bg-riverside-teal/20 hover:bg-riverside-teal/30 text-riverside-teal py-1 rounded-md text-[10px] font-bold transition-colors border border-riverside-teal/50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(ride._id)}
                                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-1 rounded-md text-[10px] font-bold transition-colors border border-red-500/50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inventory Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-8 max-w-md w-full">
                                <h3 className="text-xl font-bold mb-6">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                                <form onSubmit={handleSaveItem} className="space-y-4">
                                    <input placeholder="Name" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    <select className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option value="dine">Dine (Food)</option>
                                        <option value="play">Play (Rides)</option>
                                        <option value="events">Event</option>
                                    </select>
                                    <input type="number" placeholder="Price" className="w-full border p-2 rounded" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                    <textarea placeholder="Description" className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                    <input placeholder="Image URL" className="w-full border p-2 rounded" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                                    <div className="flex gap-4 mt-6">
                                        <button type="submit" className="flex-1 bg-riverside-teal text-white py-2 rounded font-bold">Save</button>
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded font-bold">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
