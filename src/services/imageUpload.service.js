import "dotenv/config";

// Upload image to ImgBB
export const uploadImageToImgBB = async (imageBuffer) => {
  const formData = new FormData();

  const imageBlob = new Blob([imageBuffer]);

  formData.append("image", imageBlob, "image.jpg");

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    },
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || "Image upload failed.");
  }

  return result.data.url;
};
