import { uploadImageToImgBB } from "@/lib/imgbb";

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");
  const name = formData.get("name");

  if (!(image instanceof Blob)) {
    return Response.json({ error: "Missing image file in field 'image'" }, { status: 400 });
  }

  try {
    const uploaded = await uploadImageToImgBB(image, typeof name === "string" ? name : undefined);
    return Response.json({ ok: true, data: uploaded });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}