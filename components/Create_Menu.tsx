"use client";

import { useState, useEffect } from "react";
import type { MenuItemData, ImagesData } from "@/lib/services/restaurantService";

export interface EditableMenuItem extends MenuItemData {
  _id?: string;
}

const INITIAL_FORM_STATE: MenuItemData = {
  name: "",
  category: "lunch",
  pricePerFood: 0,
  ingridients: "",
  takingTime: 0,
  status: "available",
  images: [],
};

export default function CreateMenu() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFood, setSelectedFood] = useState<EditableMenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [menu, setMenu] = useState<EditableMenuItem[]>([]);

  // 1. Fetch menu on component mount
  useEffect(() => {
    fetchgood();
  }, []);

  const fetchgood = async () => {
    try {
      const res = await fetch("/api/restaurant/menu", { method: "GET" });
      if (res.ok) {
        const fmenu = await res.json();
        setMenu(Array.isArray(fmenu) ? fmenu : fmenu.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    }
  };

  // 2. Clear / Reset Form
  const resetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setFiles([]);
    setPreviews([]);
    setSelectedFood(null);
    setIsEditing(false);
  };

  // 3. Populate form for editing
  const handleEditSelect = (item: EditableMenuItem) => {
    setSelectedFood(item);
    setIsEditing(true);
    setForm({
      name: item.name || "",
      category: item.category || "lunch",
      pricePerFood: item.pricePerFood || 0,
      ingridients: Array.isArray(item.ingridients)
        ? item.ingridients.join(", ")
        : item.ingridients || "",
      takingTime: item.takingTime || 0,
      status: item.status || "available",
      images: item.images || [],
    });
    setShowForm(true);
  };

  // Initialize form state as a single object
  const [form, setForm] = useState<MenuItemData>(INITIAL_FORM_STATE);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "pricePerFood" || name === "takingTime" ? Number(value) : value,
    }));
  };

  // Handle ingredients input
  const handleIngredientsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      ingridients: e.target.value,
    }));
  };

  // Handle new image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    setFiles((prev) => [...prev, ...selected]);
    const newUrls = selected.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newUrls]);
  };

  // Remove newly selected image
  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing uploaded image
  const removeExistingImage = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== indexToRemove),
    }));
  };

  // Upload images to R2
  const uploadImages = async () => {
    const uploadedKeys: ImagesData[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/uploadIMG", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        uploadedKeys.push({
          url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${data.key}`,
          publicId: data.key,
        });
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }
    return uploadedKeys;
  };

  // Handle Form Submission (POST/PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newUploadedImages = await uploadImages();

      const finalPayload = {
        ...form,
        images: [...(form.images || []), ...newUploadedImages],
      };

      if (isEditing) {
        const res = await fetch(`/api/restaurant/menu/${selectedFood?._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalPayload),
        });
        const data = await res.json();
        if (data.success) {
          alert("Menu item updated!");
          resetForm();
          setShowForm(false);
          fetchgood();
        } else {
          alert(`Error: ${data.error}`);
        }
      } else {
        const res = await fetch("/api/restaurant/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalPayload),
        });
        const data = await res.json();
        if (data.success) {
          alert("Menu item created!");
          resetForm();
          setShowForm(false);
          fetchgood();
        } else {
          alert(`Error: ${data.error}`);
        }
      }
    } catch (err: any) {
      console.error("Failed to submit form:", err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 antialiased font-sans text-slate-800">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Chef Menu Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your kitchen's offerings and real-time menu availability
          </p>
        </div>
        <button
          className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm ${
            showForm
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-indigo-200 shadow-lg"
          }`}
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close Form
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New Item
            </>
          )}
        </button>
      </div>

      {/* Form Container */}
      {showForm && (
        <div className="mb-10 bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100/50 overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isEditing ? "bg-amber-500" : "bg-indigo-600"}`} />
              {isEditing ? `Editing "${selectedFood?.name}"` : "New Menu Item"}
            </h3>
            {isEditing && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200/60">
                Edit Mode
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Item Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Food Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="e.g. Double Stack Truffle Burger"
              />
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all capitalize"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="desert">Desert</option>
                  <option value="beverage">Beverage</option>
                  <option value="coctail">Cocktail</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Price ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="pricePerFood"
                    value={form.pricePerFood || ""}
                    onChange={handleChange}
                    required
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="14.99"
                  />
                </div>
              </div>
            </div>

            {/* Preparation Time & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Prep Time (Minutes)
                </label>
                <input
                  type="number"
                  name="takingTime"
                  value={form.takingTime || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Availability
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="available">Available</option>
                  <option value="not_available">Not Available</option>
                </select>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Ingredients <span className="text-slate-400 font-normal lowercase">(comma separated)</span>
              </label>
              <input
                type="text"
                value={form.ingridients || ""}
                onChange={handleIngredientsChange}
                className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Aged Cheddar, Wagyu Beef, Brioche Bun, Secret Sauce"
              />
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Food Images
              </label>
              <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-xl p-6 transition-all text-center group cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="p-3 bg-white rounded-full shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-slate-700">
                    <span className="text-indigo-600 font-semibold">Click to upload</span> or drag images here
                  </p>
                  <p className="text-[11px] text-slate-400">PNG, JPG or WEBP up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Selected Image Previews */}
            {previews.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">New Upload Previews:</p>
                <div className="flex flex-wrap gap-3">
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-slate-900/70 hover:bg-red-600 text-white rounded-full p-1 transition-colors backdrop-blur-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previously Uploaded Images Pool */}
            {(form.images?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Existing Item Gallery:</p>
                <div className="flex flex-wrap gap-3">
                  {form.images?.map((img, idx) => (
                    <div key={img.publicId || idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="uploaded" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 bg-slate-900/70 hover:bg-red-600 text-white rounded-full p-1 transition-colors backdrop-blur-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit & Cancel Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 inline-flex items-center justify-center font-medium py-3 px-5 rounded-xl text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-50 text-white shadow-sm ${
                  isEditing
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isEditing ? "Updating..." : "Creating..."}
                  </span>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Publish Menu Item"
                )}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Menu Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu?.map((item: EditableMenuItem) => (
          <div
            key={item._id || item.name}
            className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div>
              {/* Display Image Preview */}
              <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.images[0].url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Status Badge */}
                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 text-[11px] font-semibold rounded-full backdrop-blur-md border shadow-sm capitalize ${
                    item.status === "available"
                      ? "bg-emerald-500/90 text-white border-emerald-400/30"
                      : "bg-slate-900/80 text-slate-200 border-slate-700/50"
                  }`}
                >
                  {item.status === "available" ? "Available" : "Unavailable"}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {item.name}
                  </h3>
                  <span className="font-extrabold text-slate-900 text-base bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    ${item.pricePerFood}
                  </span>
                </div>

                {/* Category & Prep Time */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-medium rounded-md capitalize">
                    {item.category}
                  </span>
                  {Boolean(item.takingTime) && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {item.takingTime} min
                    </span>
                  )}
                </div>

                {/* Ingredients */}
                {item.ingridients && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    <span className="font-medium text-slate-700">Ingredients:</span>{" "}
                    {Array.isArray(item.ingridients)
                      ? item.ingridients.join(", ")
                      : item.ingridients}
                  </p>
                )}
              </div>
            </div>

            {/* Edit Trigger Button */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => handleEditSelect(item)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 text-xs font-semibold rounded-xl border border-slate-200/80 hover:border-amber-200/80 transition-all shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}