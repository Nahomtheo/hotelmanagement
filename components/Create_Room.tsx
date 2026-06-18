"use client";

import { useState } from "react";

export default function CreateRoomForm() {
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


  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected = Array.from(e.target.files || []);

    setFiles((prev) => [...prev, ...selected]);

    const urls = selected.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews((prev) => [...prev, ...urls]);
  };


  const removeImage = (index: number) => {

    setFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setPreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };


  const uploadImages = async () => {

    const uploadedKeys: any[] = [];


    for (const file of files) {

      const formData = new FormData();

      formData.append("file", file);


      const res = await fetch("/api/uploadIMG", {
        method: "POST",
        body: formData,
      });


      const data = await res.json();
      const fulldata={
        url: `${process.env.NEXT_PUBLIC_R2_ENDPOINT}/${data.key}`,
        publicId: data.key
      }

      uploadedKeys.push(fulldata);
    }


    return uploadedKeys;
  };


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };



  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();


    const imageKeys = await uploadImages();


    const roomData = {

      ...form,

      pricePerNight:
        Number(form.pricePerNight),

      maxGuests:
        Number(form.maxGuests),

      amenities:
        form.amenities
        .split(",")
        .map((item)=>item.trim()),

      images: imageKeys,
    };



    const res = await fetch("/api/rooms", {

      method:"POST",

      headers:{
        "Content-Type":"application/json",
      },

      body:JSON.stringify(roomData),

    });


    const data = await res.json();

    console.log(data);
  };



  return (

<form
onSubmit={handleSubmit}
className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-5"
>


<h2 className="text-2xl font-bold">
Create New Room
</h2>



<div>

<label>
Room Images
</label>


<input

type="file"

multiple

accept="image/*"

onChange={handleImageChange}

className="w-full border p-2 rounded"

/>


</div>



{/* IMAGE PREVIEW */}

<div className="grid grid-cols-3 gap-3">

{previews.map((src,index)=>(

<div
key={src}
className="relative"
>


<img

src={src}

className="h-32 w-full object-cover rounded"

/>


<button

type="button"

onClick={()=>removeImage(index)}

className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6"

>

×

</button>


</div>

))}

</div>




<div>
<label>Room Number</label>

<input
name="roomNumber"
value={form.roomNumber}
onChange={handleChange}
className="w-full border p-2 rounded"
/>

</div>



<div>

<label>Room Type</label>

<select
name="type"
value={form.type}
onChange={handleChange}
className="w-full border p-2 rounded"
>

<option value="single">
Single
</option>

<option value="double">
Double
</option>

<option value="suite">
Suite
</option>

<option value="deluxe">
Deluxe
</option>


</select>

</div>



<div>

<label>
Price Per Night
</label>


<input

type="number"

name="pricePerNight"

value={form.pricePerNight}

onChange={handleChange}

className="w-full border p-2 rounded"

/>

</div>




<div>

<label>
Maximum Guests
</label>


<input

type="number"

name="maxGuests"

value={form.maxGuests}

onChange={handleChange}

className="w-full border p-2 rounded"

/>


</div>




<div>

<label>
Amenities
</label>

<input

name="amenities"

value={form.amenities}

onChange={handleChange}

placeholder="WiFi, TV, AC"

className="w-full border p-2 rounded"

/>

</div>




<div>

<label>
Description
</label>

<textarea

name="description"

value={form.description}

onChange={handleChange}

rows={4}

className="w-full border p-2 rounded"

/>

</div>




<button

className="w-full bg-black text-white p-3 rounded-lg"

>

Create Room

</button>



</form>

  );
}