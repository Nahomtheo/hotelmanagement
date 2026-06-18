import CreateRoomForm from "@/components/Create_Room";
export default function RoomsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center py-8">Manage Rooms</h1>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
        <CreateRoomForm />
      </div>
    </div>
  );
}