"use client";

import { useState, useEffect } from "react";
import type { FoodOrderData, MenuItemData, FoodOrderItem } from "@/lib/services/restaurantService";

export interface ExtendedCartItem extends FoodOrderItem {}

export interface EditableTable extends FoodOrderData {
  _id?: string;
  foods: ExtendedCartItem[];
}

interface TableManagerProps {
  tableId: string;
}

type CategoryType =
  | "all"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "desert"
  | "beverage"
  | "coctail";

const CATEGORIES: { label: string; value: CategoryType }[] = [
  { label: "All Items", value: "all" },
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
  { label: "Dessert", value: "desert" },
  { label: "Beverages", value: "beverage" },
  { label: "Cocktails", value: "coctail" },
];

const INITIAL_FORM_STATE: FoodOrderData & { foods: ExtendedCartItem[] } = {
  userId: "",
  tableId: "",
  booking_id: "",
  roomId: "",
  foods: [],
  paymentStatus: "pending",
  status: "pending",
  specialReq: "",
};

export default function Createorder({ tableId }: TableManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [, setSelectedOrder] = useState<EditableTable | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [menu, setMenu] = useState<MenuItemData[]>([]);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");

  // 1. Fetch menu on mount
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch("/api/restaurant/menu", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setMenu(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    }
  };

  // 2. Reset Form
  const resetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setSelectedOrder(null);
    setIsEditing(false);
  };

  // 3. Add to Cart
  const addToCart = (item: ExtendedCartItem) => {
    setForm((prev) => {
      const exists = prev.foods.some((f) => f.foodId === item.foodId);

      if (!exists) {
        return {
          ...prev,
          tableId: tableId,
          foods: [...prev.foods, { ...item, quantity: item.quantity || 1 }],
        };
      }

      return {
        ...prev,
        tableId: tableId,
        foods: prev.foods.map((f) =>
          f.foodId === item.foodId
            ? { ...f, quantity: f.quantity + (item.quantity || 1) }
            : f
        ),
      };
    });
  };

  // 4. Remove from Cart
  const removeFromCart = (ritem: ExtendedCartItem) => {
    setForm((prev) => ({
      ...prev,
      tableId: tableId,
      foods: prev.foods
        .map((item) =>
          item.foodId === ritem.foodId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));
  };

  // 5. Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...form,
      userId: form.userId || undefined,
      booking_id: form.booking_id || undefined,
      roomId: form.roomId || undefined,
      tableId: form.tableId || undefined,
    };

    try {
      const res = await fetch("/api/restaurant/foodorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success || res.ok) {
        alert(isEditing ? "Order updated successfully!" : "Order created successfully!");
        resetForm();
        setShowForm(false);
        fetchMenu();
      } else {
        alert(`Error: ${data.error || "Failed to save order"}`);
      }
    } catch (err) {
      console.error("Failed to submit form:", err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic order total calculation
  const totalAmount = form.foods.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const totalItemCount = form.foods.reduce((sum, item) => sum + item.quantity, 0);

  // Category Filtering Logic
  const filteredMenu = menu.filter((item: MenuItemData & { category?: string }) => {
    if (activeCategory === "all") return true;
    return item.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 antialiased font-sans text-slate-800 mt-12 sm:mt-20 pb-32 lg:pb-12">
      {/* Header Section */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 bg-white/70 backdrop-blur-xl p-5 sm:p-7 rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Restaurant Menu
            </h2>
            {tableId && (
              <span className="px-3 py-1 bg-indigo-50/80 text-indigo-700 text-xs font-black rounded-full border border-indigo-200/50 shadow-2xs tracking-wide">
                Table #{tableId}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Tap items below to build your table order
          </p>
        </div>

        {/* Desktop Cart Toggle */}
        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
          className={`hidden sm:inline-flex items-center justify-center px-6 py-3 rounded-2xl font-bold text-xs tracking-wide uppercase transition-all duration-300 shadow-md ${
            showForm
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] text-white shadow-indigo-500/25 shadow-lg"
          }`}
        >
          {showForm ? "Hide Cart" : `View Cart (${totalItemCount})`}
        </button>
      </div>

      {/* Horizontal Scrollable Category Bar */}
      <div className="mb-8 overflow-x-auto no-scrollbar scroll-smooth py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2.5 min-w-max">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wide transition-all duration-300 active:scale-95 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500"
                    : "bg-white/80 hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-xs"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Menu Items Section */}
        <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
          {filteredMenu.length === 0 ? (
            <div className="text-center py-16 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-200/60 p-8">
              <p className="text-slate-400 font-extrabold text-sm uppercase tracking-wider">
                No items available in this category
              </p>
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className="mt-3 text-indigo-600 text-xs font-black hover:underline"
              >
                View all items
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-12 sm:gap-y-12 gap-x-5 pt-4">
              {filteredMenu.map((food: MenuItemData & { _id?: string }) => {
                const menuItem: ExtendedCartItem = {
                  foodId: food._id as any,
                  name: food.name,
                  price: food.pricePerFood || 0,
                  quantity: 1,
                };

                const inCart = form.foods.find(
                  (f) => f.foodId.toString() === food._id
                );

                return (
                  <div
                    key={food._id || food.name}
                    className="group relative bg-gradient-to-b from-white to-slate-50/60 rounded-3xl p-4 border border-slate-200/70 shadow-lg shadow-slate-200/30 hover:shadow-2xl hover:shadow-indigo-900/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Overhanging Circular Hero Image */}
                      <div className="relative -mt-10 sm:-mt-12 mb-3 flex justify-center sm:justify-start">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white shadow-2xl shadow-slate-900/15 group-hover:scale-105 transition-transform duration-300 bg-slate-100">
                          {food.images?.[0]?.url ? (
                            <img
                              src={food.images?.[0]?.url}
                              alt={food.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-wider text-center p-2">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* Floating Price Pill */}
                        <span className="absolute bottom-0 right-1/2 sm:right-2 translate-x-1/2 sm:translate-x-0 translate-y-1/3 px-3 py-1 bg-slate-900/90 backdrop-blur-md text-white font-black text-xs rounded-full shadow-lg border border-slate-700/50">
                          ${food.pricePerFood || 0}
                        </span>
                      </div>

                      {/* Content Details */}
                      <div className="pt-2 pb-3 px-1 text-center sm:text-left">
                        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug tracking-tight">
                          {food.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed font-medium">
                          {food.ingridients || "Freshly prepared with choice ingredients."}
                        </p>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="pt-2 border-t border-slate-100/80">
                      {inCart ? (
                        <div className="flex items-center justify-between bg-indigo-50/90 border border-indigo-200/60 rounded-2xl p-1.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => removeFromCart(menuItem)}
                            className="w-8 h-8 rounded-xl bg-white text-indigo-700 font-black flex items-center justify-center shadow-xs active:scale-90 transition-all text-sm hover:bg-indigo-100"
                          >
                            −
                          </button>
                          <span className="text-xs font-black text-indigo-900 px-2">
                            {inCart.quantity} in order
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(menuItem)}
                            className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shadow-xs active:scale-90 transition-all text-sm hover:bg-indigo-700"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(menuItem)}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 active:scale-[0.98] text-white text-xs font-bold rounded-2xl transition-all duration-200 shadow-md group-hover:shadow-indigo-500/20"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span>Add to Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Drawer / Sidebar */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:relative lg:inset-auto lg:bg-transparent lg:z-auto lg:col-span-1 flex flex-col justify-end lg:block">
            <div className="w-full max-w-md lg:max-w-none max-h-[85vh] lg:max-h-none h-auto bg-white rounded-t-[2.5rem] lg:rounded-3xl border-t lg:border border-slate-200/80 shadow-2xl flex flex-col justify-between overflow-hidden sticky top-0 lg:top-6">
              {/* Mobile Handle Indicator */}
              <div className="w-full flex justify-center pt-3 pb-1 lg:hidden">
                <div className="w-12 h-1.5 bg-slate-300/80 rounded-full" />
              </div>

              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {isEditing ? "Editing Order" : "Current Order"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {tableId ? `Table #${tableId}` : "Takeout Order"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                    {totalItemCount} items
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all lg:hidden"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Area */}
              <form
                onSubmit={handleSubmit}
                className="p-6 flex-1 overflow-y-auto space-y-5"
              >
                {/* Cart Items List */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {form.foods.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs font-medium">
                      Cart is empty. Select items above to add.
                    </div>
                  ) : (
                    form.foods.map((item, idx) => (
                      <div
                        key={String(item.foodId) || idx}
                        className="flex items-center justify-between gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {item.name || "Food Item"}
                          </p>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            ${item.price} × {item.quantity || 1}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-900">
                            $
                            {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 active:scale-90 transition-all"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Special Request Area */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Special Requests
                  </label>
                  <textarea
                    rows={2}
                    value={form.specialReq || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, specialReq: e.target.value }))
                    }
                    placeholder="e.g. Extra spicy, sauce on the side..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/80 border border-slate-200/80 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Total and CTA */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Total
                    </span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || form.foods.length === 0}
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 text-white rounded-2xl text-xs font-black tracking-wide uppercase transition-all shadow-lg shadow-indigo-600/25"
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : isEditing
                      ? "Save Order Changes"
                      : "Submit Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Floating Mobile Sticky Checkout Bar */}
      {form.foods.length > 0 && !showForm && (
        <div className="fixed bottom-5 left-4 right-4 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full bg-slate-900/95 backdrop-blur-md text-white p-3.5 pl-4 rounded-full shadow-2xl shadow-slate-900/40 flex items-center justify-between active:scale-95 transition-all border border-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-indigo-600 rounded-full text-xs font-black flex items-center justify-center shadow-xs">
                {totalItemCount}
              </span>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">
                  View Order
                </p>
                <p className="text-sm font-black text-white mt-1 leading-none">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-black text-indigo-400 gap-1 pr-3">
              Checkout
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}