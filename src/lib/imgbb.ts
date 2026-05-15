export async function uploadImageToImgBB(file: File | Blob, fileName?: string) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("Missing IMGBB_API_KEY");
  }

  const endpoint = process.env.IMGBB_API_URL ?? "https://api.imgbb.com/1/upload";
  const formData = new FormData();
  formData.append("image", file);

  if (fileName) {
    formData.append("name", fileName);
  }

  const response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ImgBB upload failed: ${error}`);
  }

  const payload = (await response.json()) as {
    data?: {
      url?: string;
      display_url?: string;
      delete_url?: string;
    };
  };

  return {
    url: payload.data?.url ?? "",
    displayUrl: payload.data?.display_url ?? "",
    deleteUrl: payload.data?.delete_url ?? ""
  };
}