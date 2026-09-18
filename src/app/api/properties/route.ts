import { NextResponse } from "next/server";
import { PropertyController } from "@/src/controllers/propertyController";
import { uploadImage } from "@/src/lib/s3";
import { getSession } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine");
    let brokerId: string | undefined = undefined;

    const session = await getSession();
    let viewerBrokerId = session?.brokerId as string | undefined;
    let viewerUserId = session?.userId as string | undefined;

    if (mine) {
      if (!session || !session.userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      if (session.brokerId) {
        brokerId = session.brokerId as string;
      }
    }

    const properties = await PropertyController.getAll(brokerId, viewerBrokerId, viewerUserId);
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
          
          try {
            const secureUrl = await uploadImage(buffer, "sg-brokerspace/properties");
            imageUrls.push(secureUrl);
          } catch (error: any) {
            console.error("Cloudinary upload failed:", error);
            throw new Error(`Image upload failed: ${error.message}`);
          }
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

    // Global Property Posting Killswitch check (SuperAdmins are exempt)
    if (session.role !== 'SuperAdmin') {
      const { getSystemSettings } = await import('@/src/lib/systemSettings');
      const settings = await getSystemSettings();

      if (!settings.global_property_posting_enabled || settings.maintenance_mode) {
        return NextResponse.json({
          success: false,
          error: 'Property posting is temporarily paused for system maintenance.',
        }, { status: 403 });
      }
    }

    // Enforce SuperAdmin permissions & access limits
    const broker = await prisma.broker.findUnique({
      where: { id: session.brokerId as string },
      include: {
        _count: {
          select: {
            properties: { where: { deletedAt: null } }
          }
        }
      }
    });

    if (!broker) {
      return NextResponse.json({ success: false, error: 'Broker account not found' }, { status: 404 });
    }

    if (!broker.canPostListings) {
      return NextResponse.json({ 
        success: false, 
        error: 'Your property posting permission has been disabled by the administrator.' 
      }, { status: 403 });
    }

    if (broker.maxListings !== -1 && (broker._count?.properties || 0) >= broker.maxListings) {
      return NextResponse.json({ 
        success: false, 
        error: `Property listing limit reached (${broker.maxListings} properties max). Please contact the administrator to upgrade your limit.` 
      }, { status: 403 });
    }

    const newProperty = await PropertyController.create(data, session.brokerId as string);
    return NextResponse.json({ success: true, data: newProperty }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/properties error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
