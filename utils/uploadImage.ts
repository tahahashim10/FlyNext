export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
  
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error("Failed to upload image");
    }
  
    const data = await response.json();
    if (!data.url) {
      throw new Error("Image upload failed");
    }
  
    return data.url;
  }
  