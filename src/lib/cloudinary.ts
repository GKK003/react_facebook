export const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "facebook_clone_uploads");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dkl8gsmsv/auto/upload",
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return data.secure_url as string;
};
