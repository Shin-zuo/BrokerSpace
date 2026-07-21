import { prisma } from "@/src/lib/prisma";

export class PropertyController {
  // Mock authentication helper
  private static async getOrCreateDummyBroker() {
    let broker = await prisma.user.findFirst({
      where: { role: "Broker" }
    });
    
    if (!broker) {
      broker = await prisma.user.create({
        data: {
          name: "Test Broker",
          email: "test@broker.com",
          password: "password123", // In a real app, hash this
          whatsappNumber: "+639123456789",
          role: "Broker"
        }
      });
    }
    return broker;
  }

  static async getAll() {
    return await prisma.property.findMany({
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(data: any) {
    const broker = await this.getOrCreateDummyBroker();

    return await prisma.property.create({
      data: {
        brokerId: broker.id,
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        status: data.status || "Available",
        propertyType: data.propertyType || "House",
        region: data.region,
        addressLine1: data.addressLine1,
        city: data.city,
        stateProvince: data.stateProvince,
        postalCode: data.postalCode,
        country: data.country || "Philippines",
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
          const filePath = path.join(process.cwd(), "public", img.url);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (e) {
              console.error("Failed to delete file:", e);
            }
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
        region: data.region,
        addressLine1: data.addressLine1,
        city: data.city,
        stateProvince: data.stateProvince,
        postalCode: data.postalCode,
        country: data.country,
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
        const filePath = path.join(process.cwd(), "public", img.url);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error("Failed to delete file on property delete:", e);
          }
        }
      }
    }

    // Delete related records first to satisfy foreign key constraints
    await prisma.propertyImage.deleteMany({
      where: { propertyId: id }
    });

    await prisma.inquiry.deleteMany({
      where: { propertyId: id }
    });

    return await prisma.property.delete({
      where: { id }
    });
  }
}
