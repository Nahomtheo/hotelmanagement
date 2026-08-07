'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChefHat, 
  Bell, 
  Filter, 
  Flame, 
  RotateCcw,
  Utensils
} from 'lucide-react';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  completed?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableOrRoom: string;
  serverName: string;
  createdAt: Date;
  status: OrderStatus;
  items: OrderItem[];
}

// Initial mock data
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: '#101',
    tableOrRoom: 'Table 4',
    serverName: 'Sarah M.',
    createdAt: new Date(Date.now() - 1000 * 60 * 18), // 18 mins ago (Urgent)
    status: 'PREPARING',
    items: [
      { id: 'item-1', name: 'Ribeye Steak (Medium Rare)', quantity: 2, notes: 'No garlic butter', completed: false },
      { id: 'item-2', name: 'Truffle Fries', quantity: 1, completed: true },
      { id: 'item-3', name: 'Caesar Salad', quantity: 1, notes: 'Extra dressing on side', completed: true },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: '#102',
    tableOrRoom: 'Room 304 (In-Room)',
    serverName: 'Abebe K.',
    createdAt: new Date(Date.now() - 1000 * 60 * 6), // 6 mins ago
    status: 'PENDING',
    items: [
      { id: 'item-4', name: 'Club Sandwich', quantity: 2, notes: 'Whole wheat bread', completed: false },
      { id: 'item-5', name: 'Fresh Orange Juice', quantity: 2, completed: false },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: '#103',
    tableOrRoom: 'Table 12',
    serverName: 'Sarah M.',
    createdAt: new Date(Date.now() - 1000 * 60 * 22), // 22 mins ago (Critical)
    status: 'PREPARING',
    items: [
      { id: 'item-6', name: 'Grilled Salmon', quantity: 1, notes: 'Well done', completed: false },
      { id: 'item-7', name: 'Mashed Potatoes', quantity: 1, completed: false },
      { id: 'item-8', name: 'Steamed Vegetables', quantity: 1, completed: false },
    ],
  },
  {
    id: 'ord-104',
    orderNumber: '#104',
    tableOrRoom: 'Table 2',
    serverName: 'Daniel T.',
    createdAt: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
    status: 'READY',
    items: [
      { id: 'item-9', name: 'Margherita Pizza', quantity: 1, completed: true },
      { id: 'item-10', name: 'Garlic Bread', quantity: 1, completed: true },
    ],
  },
];

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'PREPARING' | 'READY'>('ALL');
  const [now, setNow] = useState<Date>(new Date());

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper: Calculate elapsed time in minutes & seconds
  const getElapsedTime = (createdAt: Date) => {
    const diffMs = now.getTime() - new Date(createdAt).getTime();
    const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return { mins, secs, totalMins: mins };
  };

  // Helper: Get visual badge color based on elapsed prep time
  const getUrgencyBadge = (totalMins: number, status: OrderStatus) => {
    if (status === 'READY') return 'bg-emerald-950 text-emerald-400 border-emerald-700';
    if (totalMins >= 20) return 'bg-red-950 text-red-400 border-red-700 animate-pulse';
    if (totalMins >= 10) return 'bg-amber-950 text-amber-400 border-amber-700';
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  // Update overall order status
  const updateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        
        // If moving to READY or COMPLETED, mark all items completed
        const updatedItems = order.items.map((item) => ({
          ...item,
          completed: nextStatus === 'READY' || nextStatus === 'COMPLETED' ? true : item.completed,
        }));

        return { ...order, status: nextStatus, items: updatedItems };
      })
    );
  };

  // Toggle single item readiness checkmark
  const toggleItemComplete = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );

        // Auto-advance to READY if all items checked
        const allChecked = updatedItems.every((i) => i.completed);
        const nextStatus = allChecked ? 'READY' : order.status === 'READY' ? 'PREPARING' : order.status;

        return { ...order, items: updatedItems, status: nextStatus };
      })
    );
  };

  // Filtered order list (exclude COMPLETED by default)
  const filteredOrders = orders.filter((o) => {
    if (o.status === 'COMPLETED') return false;
    if (activeFilter === 'ALL') return true;
    return o.status === activeFilter;
  });

  // Summary counts
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-4 sm:p-6 select-none">
      {/* KDS Header Bar */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-zinc-950 rounded-xl font-bold">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide uppercase">Kitchen Display System</h1>
            <p className="text-xs text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Order Stream • {now.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeFilter === 'ALL'
                ? 'bg-zinc-700 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Active ({pendingCount + preparingCount + readyCount})
          </button>
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            New ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('PREPARING')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeFilter === 'PREPARING'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            In Prep ({preparingCount})
          </button>
          <button
            onClick={() => setActiveFilter('READY')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeFilter === 'READY'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ready ({readyCount})
          </button>
        </div>
      </header>

      {/* Main Grid Display */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
          <Utensils className="w-16 h-16 mb-4 stroke-[1.5]" />
          <p className="text-lg font-semibold text-zinc-400">All caught up!</p>
          <p className="text-sm">No active kitchen tickets in this view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => {
            const { mins, secs, totalMins } = getElapsedTime(order.createdAt);
            const urgencyClass = getUrgencyBadge(totalMins, order.status);

            return (
              <div
                key={order.id}
                className={`flex flex-col justify-between rounded-xl border bg-zinc-900 overflow-hidden shadow-lg transition-all ${
                  order.status === 'READY'
                    ? 'border-emerald-600/60 ring-1 ring-emerald-500/20'
                    : totalMins >= 20
                    ? 'border-red-600/80 ring-2 ring-red-500/30'
                    : 'border-zinc-800'
                }`}
              >
                {/* Ticket Header */}
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-black text-amber-400 tracking-wider">
                      {order.orderNumber}
                    </span>
                    <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border flex items-center gap-1.5 ${urgencyClass}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {mins}:{secs < 10 ? `0${secs}` : secs}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-200">{order.tableOrRoom}</span>
                    <span>Server: {order.serverName}</span>
                  </div>
                </div>

                {/* Ticket Items List */}
                <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[360px]">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItemComplete(order.id, item.id)}
                      className={`p-2.5 rounded-lg border transition cursor-pointer flex items-start gap-3 ${
                        item.completed
                          ? 'bg-zinc-950/60 border-zinc-800/80 text-zinc-500 line-through'
                          : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-100 hover:bg-zinc-800'
                      }`}
                    >
                      <button
                        type="button"
                        className={`mt-0.5 rounded p-0.5 transition ${
                          item.completed ? 'text-emerald-400' : 'text-zinc-600'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-sm ${item.completed ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                            <span className="text-amber-400 mr-1.5">{item.quantity}x</span>
                            {item.name}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-amber-300/90 font-medium mt-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 inline-block">
                            ⚠️ {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ticket Footer Action Buttons */}
                <div className="p-3 border-t border-zinc-800 bg-zinc-950/60">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-lg text-sm tracking-wide uppercase transition flex items-center justify-center gap-2"
                    >
                      <Flame className="w-4 h-4" /> Start Cooking
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'READY')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-lg text-sm tracking-wide uppercase transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Order Ready
                    </button>
                  )}

                  {order.status === 'READY' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-sm tracking-wide uppercase transition flex items-center justify-center gap-2"
                    >
                      Bump / Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}