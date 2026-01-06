import { IService } from '../models/serviceCategory.model';
export declare class ServiceCategoryService {
    getAll(includeInactive?: boolean): Promise<(import("mongoose").Document<unknown, {}, import("../models/serviceCategory.model").IServiceCategory, {}, {}> & import("../models/serviceCategory.model").IServiceCategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getById(id: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/serviceCategory.model").IServiceCategory, {}, {}> & import("../models/serviceCategory.model").IServiceCategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: {
        name: string;
        description?: string;
        icon?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/serviceCategory.model").IServiceCategory, {}, {}> & import("../models/serviceCategory.model").IServiceCategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, data: {
        name?: string;
        description?: string;
        icon?: string;
        isActive?: boolean;
    }): Promise<(import("mongoose").Document<unknown, {}, import("../models/serviceCategory.model").IServiceCategory, {}, {}> & import("../models/serviceCategory.model").IServiceCategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    delete(id: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/serviceCategory.model").IServiceCategory, {}, {}> & import("../models/serviceCategory.model").IServiceCategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    addService(categoryId: string, serviceData: {
        name: string;
        description?: string;
        price: number;
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/serviceCategory.model").IServiceCategory, {}, {}> & import("../models/serviceCategory.model").IServiceCategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateService(categoryId: string, serviceId: string, data: {
        name?: string;
        description?: string;
        price?: number;
        isActive?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/serviceCategory.model").IServiceCategory, {}, {}> & import("../models/serviceCategory.model").IServiceCategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteService(categoryId: string, serviceId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/serviceCategory.model").IServiceCategory, {}, {}> & import("../models/serviceCategory.model").IServiceCategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getAllActiveServices(): Promise<{
        _id: import("mongoose").Types.ObjectId;
        name: string;
        description: string | undefined;
        icon: string | undefined;
        services: IService[];
    }[]>;
    calculateTotalPrice(serviceIds: string[]): Promise<{
        total: number;
        services: {
            categoryName: string;
            serviceName: string;
            price: number;
        }[];
    }>;
}
export declare const serviceCategoryService: ServiceCategoryService;
//# sourceMappingURL=serviceCategory.service.d.ts.map