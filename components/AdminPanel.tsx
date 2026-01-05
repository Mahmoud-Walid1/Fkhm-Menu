import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Product, Category } from '../types';
import { motion } from 'framer-motion';
import { Plus, Trash, Edit, Save, X, Image as ImageIcon, Upload, Loader, Coffee, Box, Share2, LogOut, Palette, Link as LinkIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { products, categories, settings, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, updateSettings, reorderCategories, reorderProducts, refreshData } = useAppStore();
    const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings' | 'images'>('products');

    // Product Form State
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

    // Category Edit State
    const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);

    // Image Management State (Text Inputs)
    const [newHeroImage, setNewHeroImage] = useState('');
    const [newOfferImage, setNewOfferImage] = useState('');

    // Product Image Upload State
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);

    // Hero Image Upload State
    const [selectedHeroFile, setSelectedHeroFile] = useState<File | null>(null);
    const [uploadingHero, setUploadingHero] = useState(false);

    // Offer Image Upload State
    const [selectedOfferFile, setSelectedOfferFile] = useState<File | null>(null);
    const [offerPreview, setOfferPreview] = useState<string>('');
    const [uploadingOffer, setUploadingOffer] = useState(false);

    // Local Settings State (to avoid auto-save race conditions)
    const [tempSettings, setTempSettings] = useState(settings);

    const [settingsModified, setSettingsModified] = useState(false);

    // Reorder Mode State
    const [isReorderCategories, setIsReorderCategories] = useState(false);
    const [isReorderProducts, setIsReorderProducts] = useState(false);

    // Sync tempSettings when global settings load (only if not modified yet to allow external updates)
    React.useEffect(() => {
        if (!settingsModified) {
            setTempSettings(settings);
        }
    }, [settings, settingsModified]);

    const handleSaveSettings = () => {
        updateSettings(tempSettings);
        setSettingsModified(false);
        alert('تم حفظ الإعدادات بنجاح ✅');
    };

    // Handlers
    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!editingProduct?.name) {
            alert('يرجى كتابة اسم المنتج');
            return;
        }
        if (editingProduct?.price === undefined || isNaN(editingProduct.price)) {
            alert('يرجى تحديد السعر');
            return;
        }
        if ((!editingProduct?.categoryIds || editingProduct.categoryIds.length === 0) && !editingProduct?.category && !editingProduct?.categoryId) {
            alert('❌ خطأ: يرجى اختيار قسم واحد على الأقل للمنتج!');
            return;
        }

        let imageUrl = editingProduct.image || `https://picsum.photos/400/400?random=${Date.now()}`;

        // Upload image to Cloudinary if file is selected
        if (selectedImageFile && settings.cloudinaryCloudName && settings.cloudinaryUploadPreset) {
            setUploadingImage(true);
            const result = await uploadImageToCloudinary(
                selectedImageFile,
                settings.cloudinaryCloudName,
                settings.cloudinaryUploadPreset
            );

            setUploadingImage(false);

            if (result.success && result.url) {
                imageUrl = result.url;
            } else {
                alert(`فشل رفع الصورة: ${result.error}`);
                return; // Don't save product if image upload failed
            }
        }

        const prodData = {
            ...editingProduct,
            price: Number(editingProduct.price),
            promoPrice: editingProduct.promoPrice ? Number(editingProduct.promoPrice) : null,
            sizes: editingProduct.sizes || [],
            image: imageUrl
        } as Product;

        if (editingProduct.id) {
            updateProduct(prodData);
        } else {
            addProduct({ ...prodData, id: Date.now().toString() });
        }

        // Reset form
        setEditingProduct(null);
        setSelectedImageFile(null);
        setImagePreview('');
    };

    const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addHeroImage = async () => {
        if (selectedHeroFile && settings.cloudinaryCloudName && settings.cloudinaryUploadPreset) {
            setUploadingHero(true);
            const result = await uploadImageToCloudinary(
                selectedHeroFile,
                settings.cloudinaryCloudName,
                settings.cloudinaryUploadPreset
            );
            setUploadingHero(false);

            if (result.success && result.url) {
                updateSettings({ ...settings, heroImages: [...(settings.heroImages || []), result.url] });
                setSelectedHeroFile(null);
            } else {
                alert(`فشل رفع الصورة: ${result.error}`);
            }
        } else if (newHeroImage) {
            updateSettings({ ...settings, heroImages: [...(settings.heroImages || []), newHeroImage] });
            setNewHeroImage('');
        }
    };

    const removeHeroImage = (index: number) => {
        const updated = settings.heroImages.filter((_, i) => i !== index);
        updateSettings({ ...settings, heroImages: updated });
    };

    const addOfferImage = async () => {
        if (selectedOfferFile && settings.cloudinaryCloudName && settings.cloudinaryUploadPreset) {
            setUploadingOffer(true);
            const result = await uploadImageToCloudinary(
                selectedOfferFile,
                settings.cloudinaryCloudName,
                settings.cloudinaryUploadPreset
            );
            setUploadingOffer(false);

            if (result.success && result.url) {
                updateSettings({ ...settings, offerImages: [...(settings.offerImages || []), result.url] });
                setSelectedOfferFile(null);
                setOfferPreview('');
            } else {
                alert(`فشل رفع الصورة: ${result.error}`);
            }
        } else if (newOfferImage) {
            updateSettings({ ...settings, offerImages: [...(settings.offerImages || []), newOfferImage] });
            setNewOfferImage('');
        }
    };

    const handleOfferImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedOfferFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setOfferPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeOfferImage = (index: number) => {
        const updated = settings.offerImages.filter((_, i) => i !== index);
        updateSettings({ ...settings, offerImages: updated });
    };

    const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === categories.length - 1) return;

        const newOrder = [...categories];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
        reorderCategories(newOrder);
    };

    const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === products.length - 1) return;

        const newOrder = [...products];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
        reorderProducts(newOrder);
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-[200] overflow-y-auto">
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">إدارة {settings.shopName}</h1>
                        <p className="text-gray-500 text-sm mt-1">نسخة المتصفح (المحلية)</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={refreshData} className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2">
                            🔄 تحديث
                        </button>
                        <button onClick={onClose} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200">
                            إغلاق
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 md:gap-4 mb-8 bg-white p-2 rounded-lg shadow-sm overflow-x-auto">
                    {['products', 'categories', 'images', 'settings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 min-w-[100px] py-2 rounded-md font-bold transition-colors ${activeTab === tab ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {tab === 'products' ? 'المنتجات' : tab === 'categories' ? 'الأقسام' : tab === 'images' ? 'الصور' : 'الإعدادات'}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    {activeTab === 'products' && (
                        <div>
                            <div className="flex justify-between mb-4">
                                <h2 className="text-xl font-bold">قائمة المنتجات</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsReorderProducts(!isReorderProducts)}
                                        className={`px-4 py-2 rounded-md border flex items-center gap-2 ${isReorderProducts ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-gray-600'}`}
                                    >
                                        {isReorderProducts ? 'إنهاء الترتيب' : 'ترتيب المنتجات'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const defaultCatId = categories[0]?.id;
                                            setEditingProduct({
                                                categoryIds: defaultCatId ? [defaultCatId] : [],
                                                category: defaultCatId
                                            });
                                        }}
                                        className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-600"
                                    >
                                        <Plus size={18} /> منتج جديد
                                    </button>
                                </div>
                            </div>

                            {editingProduct && (
                                <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                                    <h3 className="font-bold mb-4">{editingProduct.id ? 'تعديل منتج' : 'إضافة منتج'}</h3>
                                    <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            placeholder="اسم المنتج"
                                            value={editingProduct.name || ''}
                                            onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                            className="p-2 border rounded-md" required
                                        />
                                        <input
                                            type="number" placeholder="السعر"
                                            value={editingProduct.price || ''}
                                            onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                            className="p-2 border rounded-md" required
                                        />
                                        <div className="p-3 border rounded-md bg-white max-h-40 overflow-y-auto">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الأقسام (يمكن اختيار أكثر من قسم)</label>
                                            <div className="space-y-2">
                                                {categories.map(c => {
                                                    const isSelected = editingProduct.categoryIds?.includes(c.id) || editingProduct.category === c.id;
                                                    return (
                                                        <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    const currentIds = editingProduct.categoryIds || (editingProduct.category ? [editingProduct.category] : []);
                                                                    let newIds;
                                                                    if (e.target.checked) {
                                                                        newIds = [...currentIds, c.id];
                                                                    } else {
                                                                        newIds = currentIds.filter(id => id !== c.id);
                                                                    }
                                                                    // Update both for backward compatibility, but prioritize categoryIds
                                                                    setEditingProduct({
                                                                        ...editingProduct,
                                                                        categoryIds: newIds,
                                                                        category: newIds[0] || '' // Fallback for old systems
                                                                    });
                                                                }}
                                                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                            />
                                                            <span className="text-sm">{c.name}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <input
                                            placeholder="وصف المنتج"
                                            value={editingProduct.description || ''}
                                            onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                            className="p-2 border rounded-md"
                                        />
                                        {/* Image Upload Section */}
                                        <div className="col-span-2 space-y-3 border-t pt-4">
                                            <h4 className="font-bold text-sm flex items-center gap-2">
                                                <ImageIcon size={16} /> صورة المنتج
                                            </h4>

                                            {settings.cloudinaryCloudName && settings.cloudinaryUploadPreset ? (
                                                <div>
                                                    <label className="block text-sm mb-2 font-medium">اختر صورة من جهازك</label>
                                                    <div className="flex gap-3 items-start">
                                                        <label className="flex-1 cursor-pointer">
                                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors text-center">
                                                                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                                                                <p className="text-sm text-gray-600">اختر صورة للرفع</p>
                                                                <p className="text-xs text-gray-400 mt-1">JPG, PNG - حد أقصى 5MB</p>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageFileSelect}
                                                                className="hidden"
                                                            />
                                                        </label>

                                                        {(imagePreview || editingProduct.image) && (
                                                            <div className="relative">
                                                                <img
                                                                    src={imagePreview || editingProduct.image}
                                                                    className="w-24 h-24 object-cover rounded-lg border"
                                                                    alt="Preview"
                                                                />
                                                                {selectedImageFile && (
                                                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                                                        <Upload size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {selectedImageFile && (
                                                        <p className="text-xs text-green-600 mt-2">✓ {selectedImageFile.name}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                                    <p className="text-sm text-yellow-800 mb-2">⚠️ لرفع الصور تلقائياً، يرجى إعداد Cloudinary في تبويب "الإعدادات"</p>
                                                </div>
                                            )}

                                            <div className="text-sm text-gray-500">أو</div>

                                            <div>
                                                <label className="block text-sm mb-1 font-medium">رابط خارجي (URL)</label>
                                                <input
                                                    placeholder="https://example.com/image.jpg"
                                                    value={editingProduct.image || ''}
                                                    onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                                    className="w-full p-2 border rounded-md text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" checked={editingProduct.isHot} onChange={e => setEditingProduct({ ...editingProduct, isHot: e.target.checked })} />
                                                حار
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" checked={editingProduct.isCold} onChange={e => setEditingProduct({ ...editingProduct, isCold: e.target.checked })} />
                                                بارد
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" checked={editingProduct.isPromo} onChange={e => setEditingProduct({ ...editingProduct, isPromo: e.target.checked })} />
                                                عرض خاص
                                            </label>
                                        </div>
                                        {editingProduct.isPromo && (
                                            <input
                                                type="number"
                                                placeholder="سعر العرض"
                                                value={editingProduct.promoPrice || ''}
                                                onChange={e => setEditingProduct({ ...editingProduct, promoPrice: Number(e.target.value) })}
                                                className="p-2 border rounded-md"
                                            />
                                        )}

                                        {/* Size Management Section */}
                                        <div className="col-span-2 border-t pt-4 mt-2">
                                            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">📏 أحجام المنتج (اختياري)</h4>
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <input
                                                        id="newSizeName"
                                                        placeholder="اسم الحجم (مثال: كبير)"
                                                        className="flex-1 border p-2 rounded-md text-sm"
                                                    />
                                                    <input
                                                        id="newSizePrice"
                                                        type="number"
                                                        placeholder="السعر (+/-)"
                                                        className="w-24 border p-2 rounded-md text-sm"
                                                    />

                                                    {/* Icon Selection */}
                                                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded border">
                                                        <label className="cursor-pointer p-1 rounded hover:bg-white text-gray-500 hover:text-orange-600 transition-colors has-[:checked]:bg-white has-[:checked]:text-orange-600 has-[:checked]:shadow-sm">
                                                            <input type="radio" name="sizeIcon" value="cup" className="hidden" defaultChecked />
                                                            <Coffee size={18} />
                                                        </label>
                                                        <label className="cursor-pointer p-1 rounded hover:bg-white text-gray-500 hover:text-blue-600 transition-colors has-[:checked]:bg-white has-[:checked]:text-blue-600 has-[:checked]:shadow-sm">
                                                            <input type="radio" name="sizeIcon" value="box" className="hidden" />
                                                            <Box size={18} />
                                                        </label>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const nameInput = document.getElementById('newSizeName') as HTMLInputElement;
                                                            const priceInput = document.getElementById('newSizePrice') as HTMLInputElement;
                                                            const iconInputs = document.getElementsByName('sizeIcon') as NodeListOf<HTMLInputElement>;
                                                            let selectedIcon: 'cup' | 'box' | undefined = 'cup'; // Default

                                                            iconInputs.forEach(input => {
                                                                if (input.checked) selectedIcon = input.value as 'cup' | 'box';
                                                            });

                                                            if (nameInput.value) {
                                                                const newSize: any = {
                                                                    name: nameInput.value,
                                                                    priceModifier: Number(priceInput.value) || 0,
                                                                    icon: selectedIcon
                                                                };
                                                                setEditingProduct({
                                                                    ...editingProduct,
                                                                    sizes: [...(editingProduct.sizes || []), newSize]
                                                                });
                                                                nameInput.value = '';
                                                                priceInput.value = '';
                                                            }
                                                        }}
                                                        className="bg-green-600 text-white px-3 rounded-md text-sm"
                                                    >
                                                        إضافة
                                                    </button>
                                                </div>

                                                {editingProduct.sizes && editingProduct.sizes.length > 0 && (
                                                    <div className="bg-gray-50 rounded-lg p-2 space-y-2">
                                                        {editingProduct.sizes.map((size, idx) => (
                                                            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                                                                <span className="flex items-center gap-2">
                                                                    {size.icon === 'box' ? <Box size={14} className="text-blue-600" /> : <Coffee size={14} className="text-orange-600" />}
                                                                    {size.name} ({size.priceModifier > 0 ? '+' : ''}{size.priceModifier} ريال)
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newSizes = editingProduct.sizes?.filter((_, i) => i !== idx);
                                                                        setEditingProduct({ ...editingProduct, sizes: newSizes });
                                                                    }}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <Trash size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-span-2 flex justify-end gap-2 mt-2">
                                            <button type="button" onClick={() => { setEditingProduct(null); setSelectedImageFile(null); setImagePreview(''); }} className="px-4 py-2 bg-gray-300 rounded-md">إلغاء</button>
                                            <button
                                                type="submit"
                                                disabled={uploadingImage}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {uploadingImage ? (
                                                    <>
                                                        <Loader className="animate-spin" size={16} />
                                                        جاري الرفع...
                                                    </>
                                                ) : (
                                                    'حفظ'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-600">
                                            {isReorderProducts && <th className="p-3 w-16">#</th>}
                                            <th className="p-3">الصورة</th>
                                            <th className="p-3">اسم المنتج</th>
                                            <th className="p-3">السعر</th>
                                            <th className="p-3">القسم</th>
                                            <th className="p-3">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((p, index) => (
                                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                                {isReorderProducts && (
                                                    <td className="p-3">
                                                        <div className="flex flex-col gap-1">
                                                            <button onClick={() => handleMoveProduct(index, 'up')} disabled={index === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowUp size={14} /></button>
                                                            <button onClick={() => handleMoveProduct(index, 'down')} disabled={index === products.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowDown size={14} /></button>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="p-3"><img src={p.image} className="w-12 h-12 rounded object-cover" /></td>
                                                <td className="p-3">{p.name} {p.isPromo && <span className="text-red-500 text-xs">(عرض)</span>}</td>
                                                <td className="p-3">{p.price}</td>
                                                <td className="p-3">{p.categoryIds?.map(id => categories.find(c => c.id === id)?.name).join(', ') || categories.find(c => c.id === p.categoryId)?.name}</td>
                                                <td className="p-3 flex gap-2">
                                                    <button onClick={() => setEditingProduct(p)} className="p-1 text-blue-600"><Edit size={18} /></button>
                                                    <button onClick={() => deleteProduct(p.id)} className="p-1 text-red-600"><Trash size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'categories' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">الأقسام</h2>
                            <div className="flex justify-between items-center mb-6">
                                <form onSubmit={(e: any) => {
                                    e.preventDefault();
                                    const name = e.target.catName.value;
                                    if (name) { addCategory(name); e.target.catName.value = ''; }
                                }} className="flex gap-2 flex-1 ml-4">
                                    <input name="catName" placeholder="اسم القسم الجديد" className="flex-1 border p-2 rounded-md" />
                                    <button className="bg-green-600 text-white px-4 rounded-md">إضافة</button>
                                </form>
                                <button
                                    onClick={() => setIsReorderCategories(!isReorderCategories)}
                                    className={`px-4 py-2 rounded-md border flex items-center gap-2 ${isReorderCategories ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-gray-600'}`}
                                >
                                    {isReorderCategories ? 'تم الترتيب' : 'إعادة الترتيب'}
                                </button>
                            </div>

                            <ul className="space-y-2">
                                {categories.map((c, index) => (
                                    <li key={c.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {isReorderCategories && (
                                                <div className="flex flex-col gap-1 mr-2">
                                                    <button
                                                        onClick={() => handleMoveCategory(index, 'up')}
                                                        disabled={index === 0}
                                                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                                                    >
                                                        <ArrowUp size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveCategory(index, 'down')}
                                                        disabled={index === categories.length - 1}
                                                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                                                    >
                                                        <ArrowDown size={14} />
                                                    </button>
                                                </div>
                                            )}
                                            <span>{c.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button

                                                onClick={() => {
                                                    const newName = prompt('اسم القسم الجديد:', c.name);
                                                    if (newName && newName !== c.name) updateCategory(c.id, newName);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                title="تعديل"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`هل أنت متأكد من حذف قسم "${c.name}"؟`)) deleteCategory(c.id);
                                                }}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title="حذف"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div >
                    )}

                    {
                        activeTab === 'images' && (
                            <div className="space-y-8">
                                {/* Disclaimer */}
                                {(!settings.cloudinaryCloudName || !settings.cloudinaryUploadPreset) && (
                                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm mb-6">
                                        <strong>تنبيه:</strong> لرفع الصور مباشرة من جهازك، يرجى إعداد Cloudinary في تبويب "الإعدادات".
                                        <br />
                                        حالياً يمكنك فقط استخدام روابط مباشرة للصور.
                                    </div>
                                )}

                                {/* Hero Images Section */}
                                <div>
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ImageIcon size={20} /> صور الواجهة الرئيسية (Hero)</h2>
                                    <div className="mb-4 space-y-3">
                                        {settings.cloudinaryCloudName && settings.cloudinaryUploadPreset ? (
                                            <div className="flex gap-2 items-start">
                                                <div className="flex-1">
                                                    <label className="flex items-center gap-2 cursor-pointer bg-white border border-dashed border-gray-300 rounded-lg p-3 hover:border-purple-500 transition-colors">
                                                        <Upload className="text-gray-400" size={20} />
                                                        <span className="text-sm text-gray-600">
                                                            {selectedHeroFile ? selectedHeroFile.name : "اضغط لاختيار صورة من جهازك"}
                                                        </span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) setSelectedHeroFile(file);
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                                <button
                                                    onClick={addHeroImage}
                                                    disabled={!selectedHeroFile && !newHeroImage}
                                                    className="bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-[50px]"
                                                >
                                                    {uploadingHero ? <Loader className="animate-spin" size={16} /> : <Plus size={16} />}
                                                    إضافة
                                                </button>
                                            </div>
                                        ) : null}

                                        <div className="flex gap-2 items-center">
                                            <div className="flex-1 relative">
                                                <LinkIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    value={newHeroImage}
                                                    onChange={(e) => setNewHeroImage(e.target.value)}
                                                    placeholder="أو ضع رابط مباشر للصورة هنا..."
                                                    className="w-full border p-2 pr-9 rounded-md text-sm"
                                                />
                                            </div>
                                            {/* Button only shown here if Cloudinary is NOT active, otherwise the main add button handles both logic */}
                                            {(!settings.cloudinaryCloudName || !settings.cloudinaryUploadPreset) && (
                                                <button onClick={addHeroImage} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"><Plus size={16} /> إضافة</button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {(settings.heroImages || []).map((img, idx) => (
                                            <div key={idx} className="relative group rounded-lg overflow-hidden shadow border h-32 bg-gray-100">
                                                <img src={img} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeHeroImage(idx)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                >
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t pt-8">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ImageIcon size={20} /> صور قسم العروض</h2>
                                    <p className="text-sm text-gray-500 mb-4">يفضل استخدام صور عرضية عالية الجودة.</p>

                                    <div className="mb-4 space-y-3">
                                        {settings.cloudinaryCloudName && settings.cloudinaryUploadPreset ? (
                                            <div className="flex gap-2 items-start">
                                                <div className="flex-1">
                                                    <label className="flex items-center gap-2 cursor-pointer bg-white border border-dashed border-gray-300 rounded-lg p-3 hover:border-purple-500 transition-colors">
                                                        <Upload className="text-gray-400" size={20} />
                                                        <span className="text-sm text-gray-600">
                                                            {selectedOfferFile ? selectedOfferFile.name : "اضغط لاختيار صورة من جهازك"}
                                                        </span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleOfferImageFileSelect}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                                <button
                                                    onClick={addOfferImage}
                                                    disabled={!selectedOfferFile && !newOfferImage}
                                                    className="bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-[50px]"
                                                >
                                                    {uploadingOffer ? <Loader className="animate-spin" size={16} /> : <Plus size={16} />}
                                                    إضافة
                                                </button>
                                            </div>
                                        ) : null}

                                        <div className="flex gap-2 items-center">
                                            <div className="flex-1 relative">
                                                <LinkIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    value={newOfferImage}
                                                    onChange={(e) => setNewOfferImage(e.target.value)}
                                                    placeholder="أو ضع رابط مباشر للصورة هنا..."
                                                    className="w-full border p-2 pr-9 rounded-md text-sm"
                                                />
                                            </div>
                                            {(!settings.cloudinaryCloudName || !settings.cloudinaryUploadPreset) && (
                                                <button onClick={addOfferImage} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"><Plus size={16} /> إضافة</button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {(settings.offerImages || []).map((img, idx) => (
                                            <div key={idx} className="relative group rounded-lg overflow-hidden shadow border h-32 bg-gray-100">
                                                <img src={img} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeOfferImage(idx)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                >
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {
                        activeTab === 'settings' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Palette /> بيانات المتجر</h2>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">اسم المتجر</label>
                                        <input
                                            value={tempSettings.shopName}
                                            onChange={(e) => { setTempSettings({ ...tempSettings, shopName: e.target.value }); setSettingsModified(true); }}
                                            className="w-full border p-2 rounded-md"
                                        />
                                    </div>
                                    {/* ... existing fields ... */}
                                    <div>
                                        <label className="block text-sm font-bold mb-1">جملة الترحيب</label>
                                        <input
                                            value={tempSettings.heroHeadline}
                                            onChange={(e) => { setTempSettings({ ...tempSettings, heroHeadline: e.target.value }); setSettingsModified(true); }}
                                            className="w-full border p-2 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">شريط الأخبار (المتحرك)</label>
                                        <input
                                            value={tempSettings.scrollingBannerText || ''}
                                            onChange={(e) => { setTempSettings({ ...tempSettings, scrollingBannerText: e.target.value }); setSettingsModified(true); }}
                                            placeholder="اكتب النص الذي سيظهر في الشريط المتحرك..."
                                            className="w-full border p-2 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">رقم الواتساب (للتواصل والطلبات)</label>
                                        <input
                                            value={tempSettings.whatsappNumber}
                                            onChange={(e) => { setTempSettings({ ...tempSettings, whatsappNumber: e.target.value }); setSettingsModified(true); }}
                                            className="w-full border p-2 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">اللون الرئيسي</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="color"
                                                value={tempSettings.primaryColor}
                                                onChange={(e) => { setTempSettings({ ...tempSettings, primaryColor: e.target.value }); setSettingsModified(true); }}
                                                className="h-10 w-20 rounded cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-500">{tempSettings.primaryColor}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Share2 /> التواصل الاجتماعي</h2>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">رابط انستقرام</label>
                                        <input
                                            value={tempSettings.instagramUrl || ''}
                                            onChange={(e) => { setTempSettings({ ...tempSettings, instagramUrl: e.target.value }); setSettingsModified(true); }}
                                            placeholder="https://instagram.com/..."
                                            className="w-full border p-2 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">رابط سناب شات</label>
                                        <input
                                            value={tempSettings.snapchatUrl || ''}
                                            onChange={(e) => { setTempSettings({ ...tempSettings, snapchatUrl: e.target.value }); setSettingsModified(true); }}
                                            placeholder="https://snapchat.com/..."
                                            className="w-full border p-2 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">رابط تيك توك</label>
                                        <input
                                            value={tempSettings.tiktokUrl || ''}
                                            onChange={(e) => { setTempSettings({ ...tempSettings, tiktokUrl: e.target.value }); setSettingsModified(true); }}
                                            placeholder="https://tiktok.com/..."
                                            className="w-full border p-2 rounded-md"
                                        />
                                    </div>

                                    <div className="col-span-2 border-t pt-6 mt-4">
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Upload /> إعدادات رفع الصور (Cloudinary)</h2>
                                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 text-sm">
                                            <p className="font-bold mb-1">ℹ️ كيفية الإعداد:</p>
                                            <ol className="list-decimal mr-5 space-y-1 text-blue-800">
                                                <li>انشئ حساب مجاني على <a href="https://cloudinary.com" target="_blank" className="underline font-bold">Cloudinary</a></li>
                                                <li>من لوحة التحكم انسخ <strong>Cloud Name</strong></li>
                                                <li>اذهب إلى Settings → Upload → Upload presets</li>
                                                <li>أضف Preset جديد واجعله <strong>Unsigned</strong>، ثم انسخ اسمه</li>
                                            </ol>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-1">Cloud Name</label>
                                                <input
                                                    value={tempSettings.cloudinaryCloudName || ''}
                                                    onChange={(e) => { setTempSettings({ ...tempSettings, cloudinaryCloudName: e.target.value }); setSettingsModified(true); }}
                                                    placeholder="مثال: dx8..."
                                                    className="w-full border p-2 rounded-md font-mono text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-1">Upload Preset (Unsigned)</label>
                                                <input
                                                    value={tempSettings.cloudinaryUploadPreset || ''}
                                                    onChange={(e) => { setTempSettings({ ...tempSettings, cloudinaryUploadPreset: e.target.value }); setSettingsModified(true); }}
                                                    placeholder="مثال: ml_default"
                                                    className="w-full border p-2 rounded-md font-mono text-sm"
                                                />
                                            </div>
                                        </div>
                                        {settings.cloudinaryCloudName && settings.cloudinaryUploadPreset && (
                                            <div className="mt-3 bg-green-50 border border-green-200 p-2 rounded text-sm text-green-800">
                                                ✓ تم تفعيل Cloudinary. يمكنك الآن رفع الصور مباشرة.
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-2 mt-6 pt-4 border-t flex justify-end">
                                        <button
                                            onClick={handleSaveSettings}
                                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all"
                                        >
                                            <Save size={20} /> حفظ الإعدادات
                                        </button>
                                    </div>
                                </div>

                                <div className="col-span-2 border-t pt-6 mt-4">
                                    <h2 className="text-xl font-bold mb-4">🤖 إعدادات الذكاء الاصطناعي (ChatBot)</h2>

                                    {/* Groq Section */}
                                    <div className="mb-6">
                                        <h3 className="font-bold text-lg text-purple-700 mb-2 flex items-center gap-2">
                                            🚀 Groq API (Llama 3) - {settings.groqApiKey ? <span className="text-green-600 text-sm">مفعل</span> : <span className="text-gray-400 text-sm">غير مفعل</span>}
                                        </h3>
                                        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg mb-4 text-sm">
                                            <p className="font-bold mb-1">ℹ️ ينصح به (أسرع وأدق):</p>
                                            <ol className="list-decimal mr-5 space-y-1 text-purple-800">
                                                <li>انتقل إلى <a href="https://console.groq.com/keys" target="_blank" rel="noopener" className="underline font-bold">Groq Console</a></li>
                                                <li>انشئ حساب ثم اضغط "Create API Key"</li>
                                                <li>انسخ المفتاح والصقه هنا</li>
                                            </ol>
                                        </div>
                                        <label className="block text-sm font-bold mb-1">مفتاح Groq API Token</label>
                                        <input
                                            type="password"
                                            value={settings.groqApiKey || ''}
                                            onChange={(e) => updateSettings({ ...settings, groqApiKey: e.target.value })}
                                            placeholder="gsk_..."
                                            className="w-full border p-2 rounded-md font-mono text-sm"
                                        />
                                    </div>

                                    <div className="border-t my-4"></div>

                                    {/* Gemini Section (Backup) */}
                                    <div className="opacity-75">
                                        <h3 className="font-bold text-gray-700 mb-2">Google Gemini API (بديل)</h3>
                                        <label className="block text-sm font-bold mb-1">مفتاح Gemini API</label>
                                        <input
                                            type="password"
                                            value={settings.geminiApiKey || ''}
                                            onChange={(e) => updateSettings({ ...settings, geminiApiKey: e.target.value })}
                                            placeholder="AIzaSy..."
                                            className="w-full border p-2 rounded-md font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 border-t pt-6 mt-4">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🎉 إعدادات البوب أب (Promo Popup)</h2>
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg border">
                                            <input
                                                type="checkbox"
                                                checked={settings.isPopupEnabled}
                                                onChange={(e) => updateSettings({ ...settings, isPopupEnabled: e.target.checked })}
                                                className="w-5 h-5 text-green-600 rounded"
                                            />
                                            <span className="font-bold">تفعيل البوب أب الترويجي</span>
                                        </label>

                                        {settings.isPopupEnabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50 relative">
                                                {!settings.isPopupEnabled && <div className="absolute inset-0 bg-gray-100/50 z-10" />}
                                                <div>
                                                    <label className="block text-sm font-bold mb-1">عنوان البوب أب</label>
                                                    <input
                                                        value={settings.popupTitle || ''}
                                                        onChange={(e) => updateSettings({ ...settings, popupTitle: e.target.value })}
                                                        placeholder="مثال: عرض خاص!"
                                                        className="w-full border p-2 rounded-md"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold mb-1 flex items-center gap-2">
                                                        صورة البوب أب (URL)
                                                        {settings.cloudinaryCloudName && (
                                                            <label className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1">
                                                                <Upload size={12} /> رفع
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file && settings.cloudinaryCloudName && settings.cloudinaryUploadPreset) {
                                                                            const result = await uploadImageToCloudinary(file, settings.cloudinaryCloudName, settings.cloudinaryUploadPreset);
                                                                            if (result.success && result.url) {
                                                                                updateSettings({ ...settings, popupImage: result.url });
                                                                                alert('تم رفع صورة البوب أب بنجاح ✅');
                                                                            } else {
                                                                                alert('فشل رفع الصورة: ' + result.error);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        )}
                                                    </label>
                                                    <input
                                                        value={settings.popupImage || ''}
                                                        onChange={(e) => updateSettings({ ...settings, popupImage: e.target.value })}
                                                        placeholder="رابط الصورة..."
                                                        className="w-full border p-2 rounded-md"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-bold mb-1">نص الرسالة</label>
                                                    <textarea
                                                        value={settings.popupMessage || ''}
                                                        onChange={(e) => updateSettings({ ...settings, popupMessage: e.target.value })}
                                                        placeholder="تفاصيل العرض..."
                                                        className="w-full border p-2 rounded-md h-20"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        )
                    }
                </div >
            </div >
        </div >
    );
};

export default AdminPanel;