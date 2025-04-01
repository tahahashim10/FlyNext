import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(request: Request) {
  try {
    // Parse form data to extract the file
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer, // binary file data
      fileName: file.name, // original file name
      folder: "/uploads", // optional: specify a folder in ImageKit
      useUniqueFileName: true, // let ImageKit generate a unique name
    });

    return NextResponse.json({ url: uploadResponse.url }, { status: 200 });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
