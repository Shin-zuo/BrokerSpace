import { prisma } from "@/src/lib/prisma";
import { deleteImage } from "@/src/lib/s3";

export class PropertyController {
  static async getAll(brokerId?: string, viewerBrokerId?: string, viewerUserId?: string) {
    let visibilityFilter: any = { visibility: "PUBLIC" };

    if (viewerUserId && viewerBrokerId) {
      const connections = await prisma.connection.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ requesterId: viewerUserId }, { receiverId: viewerUserId }]
        }
      });
      
      const friendIds = connections.map((c: any) => 
        c.requesterId === viewerUserId ? c.receiverId : c.requesterId
      );

      visibilityFilter = {
        OR: [
          { visibility: "PUBLIC" },
          { brokerId: viewerBrokerId },
          { 
            visibility: "FRIENDS", 
            broker: { user: { id: { in: friendIds } } } 
          }
        ]
      };
    }

    let whereClause: any = {
      ...visibilityFilter,
      deletedAt: null
    };
    if (brokerId) {
      whereClause = {
        AND: [
          { brokerId },
          visibilityFilter,
          { deletedAt: null }
        ]
      };
    }

    return await prisma.property.findMany({
      where: whereClause,
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(data: any, brokerId: string) {
    return await prisma.property.create({
      data: {
        brokerId: brokerId,
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        status: data.status || "Available",
        propertyType: data.propertyType || "House",
        visibility: data.visibility || "PUBLIC",
        locationVisibility: data.locationVisibility || "PUBLIC",
        sizeSqm: data.sizeSqm ? parseFloat(data.sizeSqm) : null,
        region: data.region || "",
        addressLine1: data.addressLine1 || "",
        city: data.city || "",
        stateProvince: data.stateProvince || "",
        postalCode: data.postalCode || "",
        country: data.country || "Philippines",
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        ...(data.imageUrls && data.imageUrls.length > 0 ? {
          images: {
            create: data.imageUrls.map((url: string, index: number) => ({
              url,
              isPrimary: index === 0
            }))
          }
        } : {})
      },
      include: { images: true }
    });
  }

  static async update(id: string, data: any) {
    if (data.imagesToDelete && data.imagesToDelete.length > 0) {
      const fs = require('fs');
      const path = require('path');
      
      const images = await prisma.propertyImage.findMany({ 
        where: { id: { in: data.imagesToDelete } } 
      });
      
      await prisma.propertyImage.deleteMany({
        where: { id: { in: data.imagesToDelete } }
      });
      
      for (const img of images) {
        if (img.url.startsWith('/uploads/properties/')) {
          // Remove leading slash to ensure safe path.join on all OS
          const safeUrl = img.url.replace(/^\//, '');
          const filePath = path.join(process.cwd(), "public", safeUrl);
          console.log("Attempting to delete image file:", filePath);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log("Successfully deleted:", filePath);
            } catch (e) {
              console.error("Failed to delete file:", e);
            }
          }
        } else {
          await deleteImage(img.url);
        }
      }
    }

    return await prisma.property.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        status: data.status,
        propertyType: data.propertyType,
        visibility: data.visibility || "PUBLIC",
        locationVisibility: data.locationVisibility || "PUBLIC",
        sizeSqm: data.sizeSqm ? parseFloat(data.sizeSqm) : null,
        region: data.region || "",
        addressLine1: data.addressLine1 || "",
        city: data.city || "",
        stateProvince: data.stateProvince || "",
        postalCode: data.postalCode || "",
        country: data.country,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        ...(data.imageUrls && data.imageUrls.length > 0 ? {
          images: {
            create: data.imageUrls.map((url: string) => ({ url, isPrimary: false }))
          }
        } : {})
      },
      include: { images: true }
    });
  }

  static async delete(id: string) {
    // Perform soft delete
    return await prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
