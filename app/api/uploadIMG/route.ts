import {PutObjectCommand} from "@aws-sdk/client-s3"
import {r2 } from "@/lib/r2";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;
    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }
    const fileName = `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await r2.send(command);

    return Response.json({ 
        success: true,
        key: fileName,
        status: 200 
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return  Response.json({ 
        success: false,
        status: 500 
    });
  }
}