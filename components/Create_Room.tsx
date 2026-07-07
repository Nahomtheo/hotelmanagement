"use client";

import { useState, useEffect } from "react";

// Define strict prop types matching your RoomsPage invocation
interface CreateRoomFormProps {
  room?: any; // This is what you passed as 'room={editingRoom}'
  onSuccess?: () => void;
}

export default function CreateRoomForm({ room, onSuccess }: CreateRoomFormProps) {
  // Use a state resetting effect so if a user switches rooms, the form updates its fields
  const [form, setForm] = useState({
    roomNumber: "",
    type: "single",
    pricePerNight: "",
    maxGuests: "",
    amenities: "",
    images: [] as any[],
    description: "",
    status: "available",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Sync incoming room data to state if editing mode changes
  useEffect(() => {
    if (room) {
      
      
      setForm({
        roomNumber: room.roomNumber || "",
        type: room.type || "single",
        pricePerNight: room.pricePerNight || "",
        maxGuests: room.maxGuests || "",
        amenities: Array.isArray(room.amenities) ? room.amenities.join(", ") : "",
        images: room.images || [],
        description: room.description || "",
        status: room.status || "available",
      });
    } else {
      // Reset form if creating a fresh room
      setForm({
        roomNumber: "",
        type: "single",
        pricePerNight: "",
        maxGuests: "",
        amenities: "",
        images: [],
        description: "",
        status: "available",
      });
    }
    setFiles([]);
    setPreviews([]);
  }, [room]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);

    const urls = selected.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper to remove an already uploaded image from the existing pool
  const removeExistingImage = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove),
    }));
  };

  const uploadImages = async () => {
    const uploadedKeys: any[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/uploadIMG", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        const fulldata = {
          url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${data.key}`,
          publicId: data.key,
        };
        uploadedKeys.push(fulldata);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }
    return uploadedKeys;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newImageKeys = await uploadImages();
    const roomData = {
      ...form,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      amenities: form.amenities.split(",").map((item: string) => item.trim()),
      images: newImageKeys, // Fresh creation uses only newly uploaded images
    };

    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roomData),
    });

    if (res.ok && onSuccess) {
      onSuccess();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const newImageKeys = await uploadImages();
    const roomData = {
      ...form,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      amenities: form.amenities.split(",").map((item: string) => item.trim()),
      // Merge kept existing images with newly uploaded images
      images: [...form.images, ...newImageKeys],
    };

    const res = await fetch(`/api/rooms/${room._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roomData),
    });

    if (res.ok && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form
      onSubmit={room ? handleUpdate : handleSubmit}
      className="max-w-2xl mx-auto bg-white p-6 rounded-xl space-y-5"
    >
      <h2 className="text-2xl font-bold">
        {room ? `Update Room: ${room.roomNumber}` : "Create New Room"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Room Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* IMAGE PREVIEWS (Both existing on server & newly staged files) */}
      <div className="grid grid-cols-3 gap-3">
        {form.images?.map((img: any, index: number) => (
          <div key={`existing-${index}`} className="relative group">
            <img src={img.url} alt="Room Asset" className="h-32 w-full object-cover rounded opacity-80" />
            <button
              type="button"
              onClick={() => removeExistingImage(index)}
              className="absolute top-1 right-1 bg-gray-800/80 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition"
              title="Remove existing image"
            >
              ×
            </button>
          </div>
        ))}
        
        {previews.map((src, index) => (
          <div key={`new-${src}`} className="relative">
            <img src={src} alt="Staged Upload Preview" className="h-32 w-full object-cover rounded border-2 border-blue-400" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
        <input
          name="roomNumber"
          value={form.roomNumber}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Enter room number"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
          <option value="deluxe">Deluxe</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Night</label>
        <input
          type="number"
          name="pricePerNight"
          value={form.pricePerNight}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Enter price per night"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Guests</label>
        <input
          type="number"
          name="maxGuests"
          value={form.maxGuests}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Enter maximum guests"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
        <input
          name="amenities"
          value={form.amenities}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="WiFi, TV, AC, Minibar"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Enter room description"
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Button safely submits form natively without custom onClick handlers */}
      <button
        type="submit"
        className="w-full bg-black hover:bg-gray-800 text-white p-3 rounded-lg font-medium transition"
      >
        {room ? "Update Room Details" : "Create Room"}
      </button>
    </form>
  );
}