import { NextResponse } from "next/server";
import { PropertyController } from "@/src/controllers/propertyController";
import fs from "fs";
import path from "path";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const contentType = request.headers.get("content-type") || "";
    let data: any = {};
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
      
      const files = formData.getAll("images");
      const imageUrls: string[] = [];
      
      for (const file of files) {
        if (file instanceof File && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const uploadDir = path.join(process.cwd(), "public/uploads/properties");
          
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, buffer);
          
          imageUrls.push(`/uploads/properties/${fileName}`);
        }
      }
      
      data.imageUrls = imageUrls;
      data.imagesToDelete = formData.getAll("imagesToDelete");
    } else {
      data = await request.json();
    }

    const updatedProperty = await PropertyController.update(id, data);
    return NextResponse.json({ success: true, data: updatedProperty });
  } catch (error: any) {
    console.error(`PUT /api/properties/${id} error:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    await PropertyController.delete(id);
    return NextResponse.json({ success: true, message: "Property deleted" });
  } catch (error: any) {
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
