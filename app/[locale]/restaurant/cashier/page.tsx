'use client';
import Createorder from '@/components/Creat_Order';
import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UtensilsCrossed, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ShoppingBag, 
  Receipt,
  RefreshCw,
  PlusCircle,
  ChevronDown
} from 'lucide-react';
import { ReservationData, FoodOrderItem } from '@/lib/services/restaurantService';
import { table } from 'console';
import { map } from 'zod';

interface Order {
  _id: string;
  userId: string;
  tableId?: string;
  booking_id: string;
  roomId?: string;
  totalPrice?: number;
  foods: FoodOrderItem[];
  paymentStatus: 'pending' | 'paid' | 'onroom';
  status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  specialReq?: string;
}
interface RoomData {
  _id: string;
  roomNumber: number;
  currentOrder?: Order;
}

interface TableData {
  _id: string;
  tableNumber: number;
  capacity: number;
  location: string;
  status: 'available' | 'reserved' | 'occupied' | 'cleaning';
  reservationTime?: string | Date;
  currentOrder?: Order;
}


export type TableStatus = 'occupied' | 'reserved' | 'available';

export default function CashierPage() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updateTReservation, setUpdateTReservation] = useState<ReservationData | null>(null);
  const [selectedTableO, setSelectedTableO] = useState<[]>([]);
  const [payment, setPayment] = useState<'pending' | 'paid' | 'onroom'>('pending');
  const [updateroomOrderDisp, setUpdateroomOrderDisp] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [orderDisp, setOrderDisp] = useState<boolean>(false);
  const [openDropdownTableId, setOpenDropdownTableId] = useState<string | null>(null);
   const [selectedTableId, setSelectedTableId] = useState<string>('');
   const [rooms, setRooms] = useState<RoomData[]>([]);
  const [onRoomId, setOnRoomId] = useState<string>('');
   const [roomOrderDisp, setRoomOrderDisp] = useState(false);
   const [selectedRoomId, setSelectedRoomId] = useState<string>('');


  // Form State for creating a new reservation on available tables
  const [reservationInput, setReservationInput] = useState({
    guestName: '',
    phone: '',
    reservationTime: ''
  });

  // 1. Fetch tables from API
  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/restaurant/table', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setTables(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };
    const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms?', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setRooms(data.data.rooms || []);
        console.log(rooms,"roomss")
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchRooms();
  }, []);

  // Submit/Update Reservation
  const handleReservation = async (table: TableData, customPayload?: any) => {
    if (!table._id) return;
    const params = new URLSearchParams({ tableId: table._id });
    const payload = customPayload || updateTReservation;

    try {
      const res = await fetch(`/api/restaurant/reservation?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateTReservation: payload }),
      });
      if (res.ok) {
        setOpenDropdownTableId(null);
        setReservationInput({ guestName: '', phone: '', reservationTime: '' });
        fetchTables();
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  // Submit Payment
  const handlePayment = async (order: Order) => {
    if (!order._id) return;
    const params = await order._id
    try {
      const res = await fetch(`/api/restaurant/foodorder/${params}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentStatus:payment ,
          roomId:onRoomId
        }),
      });
      if (res.ok) {
        setIsOrderModalOpen(false);
        fetchTables();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  // 2. Pure Synchronous Helper function to determine status dynamically
  const getTableStatus = (table: TableData): TableStatus => {
    


    if (table.status === 'occupied') return 'occupied';

    if (table.status === 'reserved') {
      if (table.reservationTime) {
        const now = Date.now();
        const resTime = new Date(table.reservationTime).getTime();
        const diffInMinutes = (resTime - now) / (1000 * 60);

        if (diffInMinutes > 0 && diffInMinutes <= 60) {
          return 'reserved';
        }
      }
      return 'reserved';
    }

    return 'available';
  };

  // 3. Table status counter metrics
  const metrics = useMemo(() => {
    const tableList = Array.isArray(tables) ? tables : [];
    return tableList.reduce(
      (acc, table) => {
        const status = getTableStatus(table);
        if (acc[status] !== undefined) {
          acc[status]++;
        }
        return acc;
      },
      { occupied: 0, reserved: 0, available: 0 }
    );
  }, [tables]);

  // 4. Handle table clicking (asynchronous actions triggered only on user interaction)
  const handleTableClick = async (table: TableData) => {
    const status = getTableStatus(table);
    setSelectedTable(table);
     

    // Toggle forms/info dropdown for available or reserved tables
    if (status === 'available' || status === 'reserved') {
      setOpenDropdownTableId((prev) => (prev === table._id ? null : table._id));

      if (status === 'reserved') {
        const param = new URLSearchParams({ tableID: table._id });
        try {
          const res = await fetch(`/api/restaurant/reservation?${param.toString()}`);
          if (res.ok) {
            const data = await res.json();
            setUpdateTReservation(data.data);
            console.log('this is the reservationdata;' ,data)
          }
        } catch (error) {
          console.error('Error fetching reservation info:', error);
        }
      }
      return;
    }

    // Open order details modal if occupied
    if (status === 'occupied') {
      const params = new URLSearchParams({ tableId: table._id });
      params.append("paymentStatus","pending")
      try {
        const res = await fetch(`/api/restaurant/foodorder?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          console.log (data.data,':this is the order')
          
          setSelectedTableO(data.data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    }
     setIsOrderModalOpen(true);
     console.log('booly', isOrderModalOpen)

   
     
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-6 mt-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Refresh */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-blue-600" />
              Cashier Table Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time floor status and active order management
            </p>
          </div>
          <button
            onClick={fetchTables}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors border border-slate-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
{/*add order form cashier page */}


<div className="space-y-4">
  {/* Stat Card / Button Block */}
  <div className="bg-white border-l-4 border-amber-500 p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quick Actions</p>
      <button
        onClick={() => setOrderDisp(!orderDisp)}
        className="mt-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
      >
        <PlusCircle className="w-4 h-4" />
        {orderDisp ? 'Close Add Order' : 'Add Order'}
      </button>
    </div>

    {/* Table Selection Dropdown */}
    {orderDisp && tables && tables.length > 0 && (
      <div className="flex items-center gap-2">
        <label htmlFor="table-select" className="text-xs font-semibold text-slate-600">
          Select Table:
        </label>
        <select
          id="table-select"
          value={selectedTableId}
          onChange={(e) => setSelectedTableId(e.target.value)}
          className="text-xs font-medium p-2 border rounded-lg bg-white border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
        >
          <option value="">-- Select Table --</option>
          {tables.map((table) => (
            <option key={table._id || table.tableNumber} value={table._id}>
              Table {table.tableNumber} ({table.capacity} seats)
            </option>
          ))}
        </select>
      </div>
    )}
  </div>

  {/* Render Creatorder Component when a table is selected */}
  {orderDisp && selectedTableId && (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-in fade-in duration-200">
      <Createorder tableId={selectedTableId} />
    </div>
  )}
</div>
{/* create order for room  */}

<div className="space-y-4">
  {/* Stat Card / Button Block */}
  <div className="bg-white border-l-4 border-blue-500 p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Room Service</p>
      <button
        onClick={() => setRoomOrderDisp(!roomOrderDisp)}
        className="mt-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
      >
        <PlusCircle className="w-4 h-4" />
        {roomOrderDisp ? 'Close Add Order' : 'Add Room Order'}
      </button>
    </div>

    {/* Room Selection Dropdown */}
    {roomOrderDisp && rooms && rooms.length > 0 && (
      <div className="flex items-center gap-2">
        <label htmlFor="room-select" className="text-xs font-semibold text-slate-600">
          Select Room:
        </label>
        <select
          id="room-select"
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
          className="text-xs font-medium p-2 border rounded-lg bg-white border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
        >
          <option value="">-- Select Room --</option>
          {rooms.map((room) => (
            <option key={room._id || room.roomNumber} value={room._id}>
              Room {room.roomNumber}
            </option>
          ))}
        </select>
      </div>
    )}
  </div>

  {/* Render Creatorder Component when a room is selected */}
  {roomOrderDisp && selectedRoomId && (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-in fade-in duration-200">
      {/* Assuming your Creatorder component can accept a roomId prop */}
      <Createorder roomId={selectedRoomId} />
    </div>
  )}
</div>
        

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border-l-4 border-emerald-500 p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Available</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.available}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          

          <div className="bg-white border-l-4 border-amber-500 p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Reserved (&lt; 1hr)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.reserved}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border-l-4 border-rose-500 p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Occupied</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.occupied}</h3>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
{tables.length > 0 &&
  tables.map((table, _i) => {
    const status = getTableStatus(table);
    const isDropdownOpen = openDropdownTableId === table._id;

    const statusStyles = {
      available: 'border-emerald-300 bg-emerald-50/40 text-emerald-900 cursor-pointer',
      reserved: 'border-amber-300 bg-amber-50/40 text-amber-900 cursor-pointer',
      occupied: 'border-rose-400 bg-rose-50 text-rose-900 cursor-pointer ring-2 ring-rose-200 hover:ring-rose-400',
    }[status];

    const badgeStyles = {
      available: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      reserved: 'bg-amber-100 text-amber-800 border-amber-300',
      occupied: 'bg-rose-100 text-rose-800 border-rose-300',
    }[status];

    // Compute combined total for the table popup footer
    const grandTotal = selectedTableO?.reduce((acc: number, curr: Order) => acc + (curr.totalPrice || 0), 0) || 0;

    return (
      <div
        key={table._id || table.tableNumber || _i}
        className={`rounded-xl border-2 transition-all overflow-hidden bg-white shadow-sm flex flex-col justify-between ${statusStyles}`}
      >
        <div onClick={() => handleTableClick(table)} className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xl font-black">Table {table.tableNumber}</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${badgeStyles}`}>
              {status}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs flex items-center gap-1 font-medium text-slate-600">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Seats: {table.capacity}
            </p>

            {status === 'available' && (
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 pt-1">
                <span className="flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Reserve Table
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            )}
          </div>

          {status === 'occupied' && (
            <div className="text-xs font-semibold text-rose-700 underline text-right">
              View Order &rarr;
            </div>
          )}
        </div>

        {/* Inline Reservation Form */}
        {status === 'available' && isDropdownOpen && (
          <div className="border-t border-emerald-200 bg-emerald-100/60 p-4 animate-in slide-in-from-top-2 duration-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReservation(table, {
                  ...reservationInput,
                  tableId: table._id,
                  guestsCount: table.capacity,
                });
              }}
              className="space-y-2 text-xs"
            >
              <h4 className="font-bold text-emerald-900 uppercase flex items-center gap-1.5 mb-2">
                <PlusCircle className="w-3.5 h-3.5" /> New Reservation
              </h4>
              <input
                type="text"
                required
                placeholder="Guest Name"
                value={reservationInput.guestName}
                onChange={(e) => setReservationInput({ ...reservationInput, guestName: e.target.value })}
                className="w-full p-2 rounded-md border border-emerald-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number"
                value={reservationInput.phone}
                onChange={(e) => setReservationInput({ ...reservationInput, phone: e.target.value })}
                className="w-full p-2 rounded-md border border-emerald-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <input
                type="datetime-local"
                required
                value={reservationInput.reservationTime}
                onChange={(e) => setReservationInput({ ...reservationInput, reservationTime: e.target.value })}
                className="w-full p-2 rounded-md border border-emerald-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
              >
                Save Reservation
              </button>
            </form>
          </div>
        )}

        {/* Order Details & Settlement Modal */}
        {isOrderModalOpen && selectedTable === table && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-blue-400" />
                    Table {selectedTable.tableNumber} Orders
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-400 mt-1">
                    <span>Active Tickets:</span>
                    {selectedTableO && selectedTableO.length > 0 ? (
                      selectedTableO.map((O: Order) => (
                        <span
                          key={O._id}
                          className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-[11px]"
                        >
                          #{O._id ? O._id.slice(-6) : 'N/A'}
                        </span>
                      ))
                    ) : (
                      <span>None</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsOrderModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body containing Order Tickets */}
              <div className="p-5 overflow-y-auto space-y-6 bg-slate-50/50 flex-1">
                {selectedTableO && selectedTableO.length > 0 ? (
                  selectedTableO.map((O: Order, orderIdx: number) => (
                    <div
                      key={O._id || orderIdx}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Ticket #{orderIdx + 1}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          ID: #{O._id ? O._id.slice(-6) : 'N/A'}
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2.5">
                        {O?.foods && O.foods.length > 0 ? (
                          O.foods.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {typeof item.foodId === 'object' && item.foodId?.name
                                    ? item.foodId.name
                                    : item.name || `Food Item #${idx + 1}`}
                                </p>
                                <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-bold text-slate-900">
                                ETB {(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 text-xs italic">No items listed on this ticket.</p>
                        )}
                      </div>

                      {/* Order-Level Payment Action */}
                      <div className="pt-3 border-t border-slate-100 space-y-3 bg-slate-50/70 p-3 rounded-lg">
                      <div className="space-y-3">
  {/* Payment Status Dropdown */}
  <div className="flex justify-between items-center">
    <label className="text-xs font-semibold text-slate-600">Payment Status:</label>
    <select
      value={payment}
      onChange={(e) => {
        const val = e.target.value as 'pending' | 'paid' | 'onroom';
        setPayment(val);
        // Automatically toggle display flag based on selected value
        setUpdateroomOrderDisp(val === 'onroom');
      }}
      className="text-xs font-medium px-2 py-1 border rounded-md bg-white border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="pending">Pending</option>
      <option value="paid">Paid (Cash/Card)</option>
      <option value="onroom">Charge to Room</option>
    </select>
  </div>

  {/* Room Selector - Renders conditionally in JSX */}
  {payment === 'onroom' && rooms && rooms.length > 0 && (
    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
      <label htmlFor="room-select" className="text-xs font-semibold text-slate-600">
        Select Room:
      </label>
      <select
        id="room-select"
        value={onRoomId}
        onChange={(e) => setOnRoomId(e.target.value)}
        className="text-xs font-medium p-2 border rounded-lg bg-white border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
      >
        <option value="">-- Select Room --</option>
        {rooms.map((room) => (
          <option key={room._id || room.roomNumber} value={room._id}>
            Room {room.roomNumber}
          </option>
        ))}
      </select>
    </div>
  )}
</div>

                        <div className="flex justify-between items-center font-bold text-slate-900 text-sm">
                          <span>Ticket Total:</span>
                          <span className="text-blue-600">ETB {(O.totalPrice || 0).toFixed(2)}</span>
                        </div>

                        <button
                          onClick={() => handlePayment(O)}
                          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Settle Ticket #{orderIdx + 1}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-8 text-sm">
                    No active orders found for this table.
                  </p>
                )}
              </div>

              {/* Modal Footer Summary */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Table Combined Total</p>
                  <p className="text-lg font-extrabold text-slate-900">ETB {grandTotal.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setIsOrderModalOpen(false)}
                  className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
                >
                  Close Window
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  })}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg">
  <div className="flex justify-between items-center border-b pb-4 mb-4">
    <div>
      <h3 className="text-lg font-bold text-slate-900">Shift Daily Summary</h3>
      <p className="text-xs text-slate-500">Cashier Register #1 • Today</p>
    </div>
    <button 
      onClick={() => window.print()} 
      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
    >
      Print Z-Report
    </button>
  </div>

  {/* Key Metrics */}
  <div className="grid grid-cols-2 gap-3 mb-6">
    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
      <p className="text-xs text-emerald-600 font-medium">Total Collected</p>
      <p className="text-2xl font-black text-emerald-900">$1,240.50</p>
    </div>
    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
      <p className="text-xs text-amber-600 font-medium">Unpaid / Open Bills</p>
      <p className="text-2xl font-black text-amber-900">2 Orders</p>
    </div>
  </div>

  {/* Payment Breakdown Table */}
  <div className="space-y-2 text-sm">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Breakdown</p>
    <div className="flex justify-between text-slate-600 border-b border-dashed pb-1">
      <span>Cash Drawer</span>
      <span className="font-semibold text-slate-900">$450.00</span>
    </div>
    <div className="flex justify-between text-slate-600 border-b border-dashed pb-1">
      <span>Card / POS</span>
      <span className="font-semibold text-slate-900">$620.50</span>
    </div>
    <div className="flex justify-between text-slate-600 border-b border-dashed pb-1">
      <span>Billed to Room</span>
      <span className="font-semibold text-slate-900">$170.00</span>
    </div>
  </div>

  {/* Audit Controls */}
  <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-500">
    <span>Discounts Given: <strong>$15.00</strong></span>
    <span>Voids / Cancelled: <strong>1 item ($8.50)</strong></span>
  </div>
</div>
     
    </div>
  );
}