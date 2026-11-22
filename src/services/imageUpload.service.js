import "dotenv/config";

// Upload image to ImgBB
export const uploadImageToImgBB = async (imageBuffer, extension) => {
  const formData = new FormData();

  const imageBlob = new Blob([imageBuffer]);

  if (!process.env.IMGBB_API_KEY) {
    throw new Error("ImgBB API key is not configured.");
  }

  formData.append("image", imageBlob, `image.${extension}`);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(15000),
    },
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Invalid response received from ImgBB.");
  }

  if (!response.ok || !result.success || !result.data?.url) {
    throw new Error(result.error?.message || "Image upload failed.");
  }

  return result.data.url;
};
