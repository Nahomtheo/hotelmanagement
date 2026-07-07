"use client";
import { useEffect, useState } from "react";
import CreateRoomForm from "@/components/Create_Room";
import { ChevronDown, ChevronUp } from "lucide-react"; // Optional: UI indicators for dropdown rows

type Room = {
  id: string;
  roomNumber: string;
  type: string;
  pricePerNight: string;
  maxGuests: string;
  amenities: string;
  images: [];
  description: string;
  status: "available" | "unavailable" | "maintenance";
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Accordion Toggle States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms", { method: "GET" });
      const datas = await response.json();
      setRooms(datas.data.rooms || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center py-8">Manage Rooms</h1>
      <div className="max-w-4xl mx-auto space-y-4">

        {/* 1. Creating Dropdown Row */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <button
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            className="w-full flex items-center justify-between p-5 text-xl font-semibold text-gray-800 hover:bg-gray-50 transition"
          >
            <span>Create a New Room</span>
            {isCreateOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {isCreateOpen && (
            <div className="p-6 border-t bg-white">
              <CreateRoomForm onSuccess={() => { fetchRooms(); setIsCreateOpen(false); }} />
            </div>
          )}
        </div>

        {/* 2. Editing Dropdown Row */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <button
            onClick={() => {
              setIsEditOpen(!isEditOpen);
              if (isEditOpen) setEditingRoom(null); // Reset active edits if panel closes
            }}
            className="w-full flex items-center justify-between p-5 text-xl font-semibold text-gray-800 hover:bg-gray-50 transition"
          >
            <span>Update Existing Rooms</span>
            {isEditOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {isEditOpen && (
            <div className="p-6 border-t bg-white space-y-6">
              {/* If a room hasn't been picked for editing, show the list */}
              {!editingRoom ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-2">Select a room from the list below to begin editing:</p>
                  {rooms.length > 0 ? (
                    rooms.map((room: Room) => (
                      <div key={room.roomNumber} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition">
                        <p className="text-lg font-medium text-gray-700">Room {room.roomNumber} ({room.type})</p>
                        <button 
                          onClick={() => setEditingRoom(room)} 
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition"
                        >
                          Edit Room
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No rooms available.</p>
                  )}
                </div>
              ) : (
                /* Dynamic Form block reveals immediately when a target room is active */
                <div className="animate-fadeIn">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h3 className="text-lg font-semibold text-blue-600">
                      Editing Room Details: {editingRoom.roomNumber}
                    </h3>
                    <button 
                      onClick={() => setEditingRoom(null)} 
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Back to Room List
                    </button>
                  </div>
                  <CreateRoomForm 
                    room={editingRoom} 
                    onSuccess={() => { 
                      setEditingRoom(null); 
                      fetchRooms(); 
                    }} 
                  />
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}