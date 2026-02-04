import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Utensils, Play, Calendar, User, Ticket } from 'lucide-react';

const BottomNav = () => {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 pb-safe">
            <div className="flex justify-around items-center h-16 px-4">
                <NavLink
                    to="/"
                    className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-sunset-orange' : 'text-gray-400'}`}
                >
                    <Home size={22} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Home</span>
                </NavLink>

                <NavLink
                    to="/dine"
                    className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-sunset-orange' : 'text-gray-400'}`}
                >
                    <Utensils size={22} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Dine</span>
                </NavLink>

                <NavLink
                    to="/login"
                    className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-sunset-orange' : 'text-gray-400'}`}
                >
                    <User size={22} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Profile</span>
                </NavLink>
                <NavLink
                    to="/tickets"
                    className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-sunset-orange' : 'text-gray-400'}`}
                >
                    <Ticket size={22} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Tickets</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default BottomNav;
