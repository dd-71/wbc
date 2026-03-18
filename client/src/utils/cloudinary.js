export const cloudinary = async (file) => {
  if (!file) throw new Error("File is required");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.REACT_APP_UPLOAD_PRESET);
  formData.append("cloud_name", process.env.REACT_APP_CLOUDINARY_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Upload failed.");
    }
    return {
      url: data.secure_url,
      publicId: data.public_id,
      resourceType: data.resource_type, // important for delete
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};
