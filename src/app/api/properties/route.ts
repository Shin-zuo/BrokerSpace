import { NextResponse } from "next/server";
import { PropertyController } from "@/src/controllers/propertyController";
import fs from "fs";
import path from "path";
import { getSession } from "@/src/lib/auth";

export async function GET() {
  try {
    const properties = await PropertyController.getAll();
    return NextResponse.json({ success: true, data: properties });
  } catch (error: any) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let data: any = {};
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
      
      // Handle files
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
    } else {
      data = await request.json();
    }

    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.brokerId) {
      return NextResponse.json({ success: false, error: 'Only brokers can create properties' }, { status: 403 });
    }

    const newProperty = await PropertyController.create(data, session.brokerId as string);
    return NextResponse.json({ success: true, data: newProperty }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/properties error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
