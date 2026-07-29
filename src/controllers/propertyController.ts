import { prisma } from "@/src/lib/prisma";

export class PropertyController {
  static async getAll(brokerId?: string) {
    return await prisma.property.findMany({
      where: brokerId ? { brokerId } : undefined,
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
          } else {
            console.log("File does not exist at path:", filePath);
          }
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
    const fs = require('fs');
    const path = require('path');

    // Fetch images to delete files from file system
    const images = await prisma.propertyImage.findMany({
      where: { propertyId: id }
    });

    for (const img of images) {
      if (img.url.startsWith('/uploads/properties/')) {
        const safeUrl = img.url.replace(/^\//, '');
        const filePath = path.join(process.cwd(), "public", safeUrl);
        console.log("Attempting to delete image file on property delete:", filePath);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log("Successfully deleted:", filePath);
          } catch (e) {
            console.error("Failed to delete file on property delete:", e);
          }
        } else {
          console.log("File does not exist at path:", filePath);
        }
      }
    }

    // Delete related records first to satisfy foreign key constraints
    await prisma.propertyImage.deleteMany({
      where: { propertyId: id }
    });

    await prisma.like.deleteMany({ where: { propertyId: id } });
    await prisma.savedProperty.deleteMany({ where: { propertyId: id } });
    await prisma.conversation.updateMany({ 
      where: { propertyId: id }, 
      data: { propertyId: null } 
    });

    return await prisma.property.delete({
      where: { id }
    });
  }
}
