import { ServiceCategory, IService } from '../models/serviceCategory.model';

export class ServiceCategoryService {
  // Barcha sohalarni olish
  async getAll(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    return ServiceCategory.find(filter).sort({ name: 1 });
  }

  // Bitta sohani olish
  async getById(id: string) {
    return ServiceCategory.findById(id);
  }

  // Yangi soha yaratish
  async create(data: { name: string; description?: string; icon?: string }) {
    const category = new ServiceCategory({
      name: data.name,
      description: data.description,
      icon: data.icon,
      services: [],
      isActive: true,
    });
    return category.save();
  }

  // Sohani yangilash
  async update(id: string, data: { name?: string; description?: string; icon?: string; isActive?: boolean }) {
    return ServiceCategory.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  // Sohani o'chirish
  async delete(id: string) {
    return ServiceCategory.findByIdAndDelete(id);
  }

  // Sohaga xizmat qo'shish
  async addService(categoryId: string, serviceData: { name: string; description?: string; price: number }) {
    const category = await ServiceCategory.findById(categoryId);
    if (!category) throw new Error('Soha topilmadi');

    category.services.push({
      name: serviceData.name,
      description: serviceData.description,
      price: serviceData.price,
      isActive: true,
    } as IService);

    return category.save();
  }

  // Xizmatni yangilash
  async updateService(categoryId: string, serviceId: string, data: { name?: string; description?: string; price?: number; isActive?: boolean }) {
    const category = await ServiceCategory.findById(categoryId);
    if (!category) throw new Error('Soha topilmadi');

    const service = category.services.find(s => s._id?.toString() === serviceId);
    if (!service) throw new Error('Xizmat topilmadi');

    if (data.name !== undefined) service.name = data.name;
    if (data.description !== undefined) service.description = data.description;
    if (data.price !== undefined) service.price = data.price;
    if (data.isActive !== undefined) service.isActive = data.isActive;

    return category.save();
  }

  // Xizmatni o'chirish
  async deleteService(categoryId: string, serviceId: string) {
    const category = await ServiceCategory.findById(categoryId);
    if (!category) throw new Error('Soha topilmadi');

    category.services = category.services.filter(s => s._id?.toString() !== serviceId);
    return category.save();
  }

  // Barcha faol xizmatlarni olish (seller uchun)
  async getAllActiveServices() {
    const categories = await ServiceCategory.find({ isActive: true });
    
    return categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      services: cat.services.filter(s => s.isActive),
    })).filter(cat => cat.services.length > 0);
  }

  // Tanlangan xizmatlar bo'yicha umumiy narxni hisoblash
  async calculateTotalPrice(serviceIds: string[]) {
    const categories = await ServiceCategory.find({ isActive: true });
    let total = 0;
    const selectedServices: { categoryName: string; serviceName: string; price: number }[] = [];

    for (const cat of categories) {
      for (const service of cat.services) {
        if (serviceIds.includes(service._id?.toString() || '')) {
          total += service.price;
          selectedServices.push({
            categoryName: cat.name,
            serviceName: service.name,
            price: service.price,
          });
        }
      }
    }

    return { total, services: selectedServices };
  }
}

export const serviceCategoryService = new ServiceCategoryService();
