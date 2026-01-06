'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/contexts/ToastContext';
import { serviceCategoryService, ServiceCategory, Service } from '@/services/serviceCategory.service';

// Category Modal komponenti
function CategoryModal({ 
  category, 
  onClose, 
  onSuccess 
}: { 
  category: ServiceCategory | null; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [icon, setIcon] = useState(category?.icon || '📁');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const icons = ['📁', '💻', '🌐', '📱', '🎨', '🛒', '📊', '🔧', '🎯', '🚀', '💡', '🔒'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Soha nomini kiriting'); return; }

    setIsSubmitting(true);
    try {
      if (category) {
        await serviceCategoryService.update(category._id, { name: name.trim(), description: description.trim() || undefined, icon, isActive });
        toast.success('Soha yangilandi');
      } else {
        await serviceCategoryService.create({ name: name.trim(), description: description.trim() || undefined, icon });
        toast.success('Soha qo\'shildi');
      }
      onSuccess();
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-dark-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-lg font-semibold text-white">{category ? 'Sohani tahrirlash' : 'Yangi soha'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Icon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 text-xl rounded-lg ${icon === i ? 'bg-primary-500' : 'bg-dark-700 hover:bg-dark-600'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Soha nomi *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Web dasturlash"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Tavsif</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qo'shimcha ma'lumot..."
              rows={2}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          {category && (
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <span className="text-white">Faol</span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-primary-500' : 'bg-dark-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-dark-700 text-white rounded-xl font-medium">
              Bekor qilish
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium disabled:opacity-50">
              {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Service Modal komponenti
function ServiceModal({ 
  categoryId, 
  service, 
  onClose, 
  onSuccess 
}: { 
  categoryId: string; 
  service: Service | null; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [name, setName] = useState(service?.name || '');
  const [description, setDescription] = useState(service?.description || '');
  const [price, setPrice] = useState(service?.price?.toString() || '');
  const [isActive, setIsActive] = useState(service?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Xizmat nomini kiriting'); return; }
    if (!price || parseFloat(price) < 0) { toast.error('Narxni kiriting'); return; }

    setIsSubmitting(true);
    try {
      if (service) {
        await serviceCategoryService.updateService(categoryId, service._id, { 
          name: name.trim(), 
          description: description.trim() || undefined, 
          price: parseFloat(price),
          isActive 
        });
        toast.success('Xizmat yangilandi');
      } else {
        await serviceCategoryService.addService(categoryId, { 
          name: name.trim(), 
          description: description.trim() || undefined, 
          price: parseFloat(price) 
        });
        toast.success('Xizmat qo\'shildi');
      }
      onSuccess();
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-dark-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-lg font-semibold text-white">{service ? 'Xizmatni tahrirlash' : 'Yangi xizmat'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Xizmat nomi *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Landing page"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Tavsif</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qo'shimcha ma'lumot..."
              rows={2}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Narxi (so'm) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          {service && (
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <span className="text-white">Faol</span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-primary-500' : 'bg-dark-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-dark-700 text-white rounded-xl font-medium">
              Bekor qilish
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium disabled:opacity-50">
              {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [editingService, setEditingService] = useState<{ categoryId: string; service: Service | null } | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await serviceCategoryService.getAll(true);
      setCategories(res.data || []);
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Sohani o\'chirmoqchimisiz? Barcha xizmatlar ham o\'chiriladi.')) return;
    try {
      await serviceCategoryService.delete(id);
      toast.success('Soha o\'chirildi');
      loadCategories();
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDeleteService = async (categoryId: string, serviceId: string) => {
    if (!confirm('Xizmatni o\'chirmoqchimisiz?')) return;
    try {
      await serviceCategoryService.deleteService(categoryId, serviceId);
      toast.success('Xizmat o\'chirildi');
      loadCategories();
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';

  const totalServices = categories.reduce((sum, cat) => sum + cat.services.length, 0);
  const activeServices = categories.reduce((sum, cat) => sum + cat.services.filter(s => s.isActive).length, 0);

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-[#0e1621] pb-20">
        {/* Custom Header */}
        <header className="bg-[#17212b] sticky top-0 z-40 safe-top border-b border-[#242f3d]">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => router.push('/admin')} className="p-2 -ml-2 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white">Service Market</h1>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-dark-800 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-primary-400">{categories.length}</div>
              <div className="text-xs text-gray-500">Sohalar</div>
            </div>
            <div className="bg-dark-800 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-green-400">{totalServices}</div>
              <div className="text-xs text-gray-500">Xizmatlar</div>
            </div>
            <div className="bg-dark-800 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{activeServices}</div>
              <div className="text-xs text-gray-500">Faol</div>
            </div>
          </div>

          {/* Add Category Button */}
          <button
            onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yangi soha qo'shish
          </button>

          {/* Categories List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-dark-700 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-dark-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-dark-800 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">🏪</div>
              <p className="text-gray-400">Hali soha qo'shilmagan</p>
              <p className="text-sm text-gray-500 mt-1">Yuqoridagi tugmani bosib soha qo'shing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map(category => (
                <div key={category._id} className={`bg-dark-800 rounded-xl overflow-hidden ${!category.isActive ? 'opacity-60' : ''}`}>
                  {/* Category Header */}
                  <div 
                    className="p-4 flex items-center gap-3 cursor-pointer"
                    onClick={() => setExpandedCategory(expandedCategory === category._id ? null : category._id)}
                  >
                    <div className="text-2xl">{category.icon || '📁'}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">{category.name}</h3>
                        {!category.isActive && (
                          <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Nofaol</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{category.services.length} ta xizmat</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingCategory(category); setShowCategoryModal(true); }}
                        className="p-2 text-gray-400 hover:text-primary-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category._id); }}
                        className="p-2 text-gray-400 hover:text-red-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategory === category._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Services List */}
                  {expandedCategory === category._id && (
                    <div className="border-t border-dark-700 p-4 space-y-2">
                      <button
                        onClick={() => { setEditingService({ categoryId: category._id, service: null }); setShowServiceModal(true); }}
                        className="w-full py-2 border border-dashed border-dark-600 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 text-sm"
                      >
                        + Xizmat qo'shish
                      </button>
                      
                      {category.services.map(service => (
                        <div key={service._id} className={`flex items-center gap-3 p-3 bg-dark-700 rounded-lg ${!service.isActive ? 'opacity-60' : ''}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-white">{service.name}</p>
                              {!service.isActive && (
                                <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">Nofaol</span>
                              )}
                            </div>
                            {service.description && <p className="text-xs text-gray-500">{service.description}</p>}
                          </div>
                          <p className="text-primary-400 font-medium">{formatPrice(service.price)}</p>
                          <button
                            onClick={() => { setEditingService({ categoryId: category._id, service }); setShowServiceModal(true); }}
                            className="p-1.5 text-gray-400 hover:text-primary-400"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteService(category._id, service._id)}
                            className="p-1.5 text-gray-400 hover:text-red-400"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      {category.services.length === 0 && (
                        <p className="text-center text-gray-500 text-sm py-2">Xizmatlar yo'q</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <BottomNav />

        {/* Category Modal */}
        {showCategoryModal && (
          <CategoryModal
            category={editingCategory}
            onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
            onSuccess={() => { setShowCategoryModal(false); setEditingCategory(null); loadCategories(); }}
          />
        )}

        {/* Service Modal */}
        {showServiceModal && editingService && (
          <ServiceModal
            categoryId={editingService.categoryId}
            service={editingService.service}
            onClose={() => { setShowServiceModal(false); setEditingService(null); }}
            onSuccess={() => { setShowServiceModal(false); setEditingService(null); loadCategories(); }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
