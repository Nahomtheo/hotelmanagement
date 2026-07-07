import Room from '@/lib/mongodb/models/Room';
export async function updateRoom(roomId: string, status: string) {
  return await Room.findByIdAndUpdate(roomId, { status });
} 