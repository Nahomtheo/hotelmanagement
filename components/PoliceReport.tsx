"use client";
import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

interface GuestRecord {
  _id: string;  // Assuming you might want to include an ID for database updates
  guestName: string;
  nationality: string;
  passport_no: string;
  id_no: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  reasonOfStay: string;
}

interface PoliceReportProps {
  hotelName?: string;
  managerName?: string;
  managerPhone?: string;
  ownerName?: string;
  ownerPhone?: string;
  guests?: GuestRecord[];
}

const PoliceReport: React.FC<PoliceReportProps> = ({
  hotelName = "GRAND HORIZON HOTEL",
  managerName = "John Doe",
  managerPhone = "+1 (555) 019-2834",
  ownerName = "Jane Smith",
  ownerPhone = "+1 (555) 019-5678",
  guests = []
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const minimumRows = 6;

  // Prepare fully padded array FIRST so state initializes cleanly with all rows
  const paddedGuests = [...guests];
  while (paddedGuests.length < minimumRows) {
    paddedGuests.push({
      _id: "",  // Assuming you might want to include an ID for database updates
      guestName: "",
      nationality: "",
      passport_no: "",
      id_no: "",
      guestPhone: "",
      checkInDate: "",
      checkOutDate: "",
      reasonOfStay: ""
    });
  }

  const [form, setForm] = useState<GuestRecord[]>(paddedGuests);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: "Police_Report",
  });

  const handleInputChange = (index: number, field: keyof GuestRecord, value: string) => {
    const newForm = [...form];
    newForm[index] = { ...newForm[index], [field]: value };
    setForm(newForm);
  };

  // Synchronize dynamic updates back using PUT via passport number
  const handleSaveRow = async (index: number) => {
    const guestToSave = form[index];

    // Ensure DB connection is established before making the request

  

    setIsSaving(true);
    try {
      const response = await fetch(`/api/bookings/${guestToSave._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to update guest details in the database');
      }

      setEditingIndex(-1);
    } catch (error) {
      console.error("Database save error:", error);
      alert("Error saving guest data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-100 p-6 min-h-screen font-sans screen:pb-12">
      {/* Print Action Button */}
      <div className="max-w-6xl mx-auto mb-4 flex justify-end print:hidden">
        <button 
          onClick={() => handlePrint()}
          className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-5 rounded shadow text-sm transition-colors"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Main Report Container */}
      <div ref={reportRef} className="max-w-[297mm] mx-auto bg-white p-[15mm] shadow-lg print:shadow-none print:p-0 rounded-sm box-border">
        
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { 
              size: A4 landscape; 
              margin: 15mm; 
            }
            body { 
              background: #fff; 
              color: #000;
            }
            input { border: none !important; padding: 0 !important; background: transparent !important; pointer-events: none; }
          }
        `}} />

        {/* Top Header */}
        <div className="text-center border-b-2 border-slate-800 pb-3 mb-6">
          <h1 className="text-2xl font-black tracking-wider uppercase text-slate-900 m-0">
            Police Report
          </h1>
          <div className="text-lg font-bold text-slate-600 mt-1 uppercase">
            {hotelName}
          </div>
        </div>

        {/* Management & Owner Contact Row */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded p-3 mb-6 text-xs">
          <div>
            <span className="block font-semibold uppercase tracking-wider text-[10px] text-slate-500 mb-1">
              Manager Details
            </span>
            <div className="text-slate-800">
              <span className="font-medium">Name:</span> {managerName} 
              <span className="mx-2 text-slate-300">|</span> 
              <span className="font-medium">Phone:</span> {managerPhone}
            </div>
          </div>
          <div className="text-right">
            <span className="block font-semibold uppercase tracking-wider text-[10px] text-slate-500 mb-1">
              Owner Details
            </span>
            <div className="text-slate-800">
              <span className="font-medium">Name:</span> {ownerName} 
              <span className="mx-2 text-slate-300">|</span> 
              <span className="font-medium">Phone:</span> {ownerPhone}
            </div>
          </div>
        </div>

        {/* Guest Data Table Form */}
        <div className="w-full overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse border border-slate-300 text-left text-xs">
            <thead>
              <tr className="bg-slate-800 text-white uppercase tracking-wider text-[10px]">
                <th className="border border-slate-800 p-2.5 w-[16%]">Guest Name</th>
                <th className="border border-slate-800 p-2.5 w-[10%]">Nationality</th>
                <th className="border border-slate-800 p-2.5 w-[11%]">Passport No.</th>
                <th className="border border-slate-800 p-2.5 w-[11%]">ID Number</th>
                <th className="border border-slate-800 p-2.5 w-[11%]">Phone No.</th>
                <th className="border border-slate-800 p-2.5 w-[10%]">Check-In</th>
                <th className="border border-slate-800 p-2.5 w-[10%]">Check-Out</th>
                <th className="border border-slate-800 p-2.5 w-[16%]">Reason of Stay</th>
                <th className="border border-slate-800 p-2.5 w-[5%] print:hidden">Action</th>
              </tr>
            </thead>
            <tbody>
              {form.map((guest, index) => {
                const isEditing = editingIndex === index;
                // Safely format dates to avoid crash when splitting undefined variables
                const checkInFormatted = guest.checkInDate ? guest.checkInDate.split('T')[0] : '';
                const checkOutFormatted = guest.checkOutDate ? guest.checkOutDate.split('T')[0] : '';

                return (
                  <tr 
                    key={index} 
                    className={`${guest.guestName ? 'h-auto' : 'h-10'} odd:bg-white even:bg-slate-50/50 ${isEditing ? 'bg-amber-50/60' : ''}`}
                  >
                    <td className="border border-slate-300 p-1 font-medium text-slate-900">
                      {isEditing ? <input type="text" className="w-full p-1 border rounded text-xs bg-white" value={guest.guestName || ""} onChange={(e) => handleInputChange(index, 'guestName', e.target.value)} autoFocus /> : (guest.guestName || "")}
                    </td>
                    <td className="border border-slate-300 p-1 text-slate-700">
                      {isEditing ? <input type="text" className="w-full p-1 border rounded text-xs bg-white" value={guest.nationality || ""} onChange={(e) => handleInputChange(index, 'nationality', e.target.value)} /> : (guest.nationality || "")}
                    </td>
                    <td className="border border-slate-300 p-1 text-slate-700">
                      {isEditing ? <input type="text" className="w-full p-1 border rounded text-xs bg-white" value={guest.passport_no || ""} onChange={(e) => handleInputChange(index, 'passport_no', e.target.value)} /> : (guest.passport_no || "")}
                    </td>
                    <td className="border border-slate-300 p-1 text-slate-700">
                      {isEditing ? <input type="text" className="w-full p-1 border rounded text-xs bg-white" value={guest.id_no || ""} onChange={(e) => handleInputChange(index, 'id_no', e.target.value)} /> : (guest.id_no || "")}
                    </td>
                    <td className="border border-slate-300 p-1 text-slate-700">
                      {isEditing ? <input type="text" className="w-full p-1 border rounded text-xs bg-white" value={guest.guestPhone || ""} onChange={(e) => handleInputChange(index, 'guestPhone', e.target.value)} /> : (guest.guestPhone || "")}
                    </td>
                    <td className="border border-slate-300 p-1 text-slate-700">
                      {isEditing ? <input type="date" className="w-full p-1 border rounded text-xs bg-white" value={checkInFormatted} onChange={(e) => handleInputChange(index, 'checkInDate', e.target.value)} /> : checkInFormatted}
                    </td>
                    <td className="border border-slate-300 p-1 text-slate-700">
                      {isEditing ? <input type="date" className="w-full p-1 border rounded text-xs bg-white" value={checkOutFormatted} onChange={(e) => handleInputChange(index, 'checkOutDate', e.target.value)} /> : checkOutFormatted}
                    </td>
                    <td className="border border-slate-300 p-1 text-slate-700">
                      {isEditing ? <input type="text" className="w-full p-1 border rounded text-xs bg-white" value={guest.reasonOfStay || ""} onChange={(e) => handleInputChange(index, 'reasonOfStay', e.target.value)} /> : (guest.reasonOfStay || "")}
                    </td>
                    <td className="border border-slate-300 p-1 text-center print:hidden">
                      {isEditing ? (
                        <button 
                          onClick={() => handleSaveRow(index)} 
                          disabled={isSaving}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1 px-2.5 rounded text-[10px] transition-colors"
                        >
                          {isSaving ? "..." : "Save"}
                        </button>
                      ) : (
                        <button 
                          onClick={() => setEditingIndex(index)} 
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-1 px-2.5 rounded text-[10px] transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Verification Section */}
        <div className="flex justify-between mt-12 text-xs print:break-inside-avoid">
          <div className="w-[42%] flex flex-col gap-3">
            <div className="font-bold uppercase tracking-wide text-slate-800 border-b border-slate-800 pb-1 mb-1">
              Checked By (Hotel Staff)
            </div>
            <div className="flex items-end h-5"><span className="w-20 font-semibold text-slate-500">Name:</span><span className="flex-1 border-b border-dotted border-slate-400"></span></div>
            <div className="flex items-end h-5"><span className="w-20 font-semibold text-slate-500">Position:</span><span className="flex-1 border-b border-dotted border-slate-400"></span></div>
            <div className="flex items-end h-5"><span className="w-20 font-semibold text-slate-500">Signature:</span><span className="flex-1 border-b border-dotted border-slate-400"></span></div>
            <div className="flex items-end h-5"><span className="w-20 font-semibold text-slate-500">Date:</span><span className="flex-1 border-b border-dotted border-slate-400"></span></div>
          </div>

          <div className="w-[42%] flex flex-col gap-3">
            <div className="font-bold uppercase tracking-wide text-slate-800 border-b border-slate-800 pb-1 mb-1">
              Checked By (Police Department)
            </div>
            <div className="flex items-end h-5"><span className="w-20 font-semibold text-slate-500">Name:</span><span className="flex-1 border-b border-dotted border-slate-400"></span></div>
            <div className="flex items-end h-5"><span className="w-20 font-semibold text-slate-500">Position:</span><span className="flex-1 border-b border-dotted border-slate-400"></span></div>
            <div className="flex items-end h-5"><span className="w-20 font-semibold text-slate-500">Signature:</span><span className="flex-1 border-b border-dotted border-slate-400"></span></div>
            <div className="flex items-end h-5"><span className="w-20 font-semibold text-slate-500">Date:</span><span className="flex-1 border-b border-dotted border-slate-400"></span></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PoliceReport;