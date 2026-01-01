import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Product, Category } from '../types';
import { motion } from 'framer-motion';
import { Settings, Plus, Edit, Trash, X, Save, Palette, Image as ImageIcon, Link as LinkIcon, Share2, Upload, Loader } from 'lucide-react';
import { uploadImageToGitHub } from '../utils/githubUpload';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { products, categories, settings, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, updateSettings } = useAppStore();
    const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings' | 'images'>('products');

    // Product Form State
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

    // Image Management State
    const [newHeroImage, setNewHeroImage] = useState('');
    const [newOfferImage, setNewOfferImage] = useState('');

    // Category Edit State
    const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);

    // GitHub Upload State
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);

    // Offer Image Upload State
    const [selectedOfferFile, setSelectedOfferFile] = useState<File | null>(null);
    const [offerPreview, setOfferPreview] = useState<string>('');
    const [uploadingOffer, setUploadingOffer] = useState(false);

    // Handlers
    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct?.name || !editingProduct?.price || !editingProduct?.categoryId) return;

        let imageUrl = editingProduct.image || `https://picsum.photos/400/400?random=${Date.now()}`;

        // Upload image to GitHub if file is selected
        if (selectedImageFile && settings.githubToken) {
            setUploadingImage(true);
            const result = await uploadImageToGitHub(
                selectedImageFile,
                {
                    token: settings.githubToken,
                    owner: settings.githubOwner || 'Mahmoud-Walid1',
                    repo: settings.githubRepo || 'Fkhm-Menu',
                    branch: settings.githubBranch || 'main'
                },
                'images/products'
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
            promoPrice: editingProduct.promoPrice ? Number(editingProduct.promoPrice) : undefined,
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

    const addHeroImage = () => {
        if (newHeroImage) {
            updateSettings({ ...settings, heroImages: [...(settings.heroImages || []), newHeroImage] });
            setNewHeroImage('');
        }
    };

    const removeHeroImage = (index: number) => {
        const updated = settings.heroImages.filter((_, i) => i !== index);
        updateSettings({ ...settings, heroImages: updated });
    };

    const addOfferImage = async () => {
        if (selectedOfferFile && settings.githubToken) {
            setUploadingOffer(true);
            const result = await uploadImageToGitHub(
                selectedOfferFile,
                {
                    token: settings.githubToken,
                    owner: settings.githubOwner || 'Mahmoud-Walid1',
                    repo: settings.githubRepo || 'Fkhm-Menu',
                    branch: settings.githubBranch || 'main'
                },
                'images/offers'
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

    return (
        <div className="fixed inset-0 bg-gray-100 z-[200] overflow-y-auto">
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">إدارة {settings.shopName}</h1>
                        <p className="text-gray-500 text-sm mt-1">نسخة المتصفح (المحلية)</p>
                    </div>
                    <button onClick={onClose} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200">
                        إغلاق
                    </button>
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
                                <button
                                    onClick={() => setEditingProduct({ categoryId: categories[0]?.id })}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-600"
                                >
                                    <Plus size={18} /> منتج جديد
                                </button>
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
                                        <select
                                            value={editingProduct.categoryId || ''}
                                            onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                                            className="p-2 border rounded-md"
                                        >
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
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

                                            {settings.githubToken ? (
                                                <div>
                                                    <label className="block text-sm mb-2 font-medium">اختر صورة من جهازك</label>
                                                    <div className="flex gap-3 items-start">
                                                        <label className="flex-1 cursor-pointer">
                                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors text-center">
                                                                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                                                                <p className="text-sm text-gray-600">اختر صورة للرفع</p>
                                                                <p className="text-xs text-gray-400 mt-1">JPG, PNG - حد أقصى 1MB</p>
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
                                                    <p className="text-sm text-yellow-800 mb-2">⚠️ لرفع الصور تلقائياً على GitHub، يرجى إضافة رمز GitHub في تبويب "الإعدادات"</p>
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
                                                type="number" placeholder="سعر العرض"
                                                value={editingProduct.promoPrice || ''}
                                                onChange={e => setEditingProduct({ ...editingProduct, promoPrice: Number(e.target.value) })}
                                                className="p-2 border rounded-md"
                                            />
                                        )}

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
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="p-3">صورة</th>
                                            <th className="p-3">الاسم</th>
                                            <th className="p-3">السعر</th>
                                            <th className="p-3">القسم</th>
                                            <th className="p-3">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(p => (
                                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3"><img src={p.image} className="w-12 h-12 rounded object-cover" /></td>
                                                <td className="p-3">{p.name} {p.isPromo && <span className="text-red-500 text-xs">(عرض)</span>}</td>
                                                <td className="p-3">{p.price}</td>
                                                <td className="p-3">{categories.find(c => c.id === p.categoryId)?.name}</td>
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
                            <form onSubmit={(e: any) => {
                                e.preventDefault();
                                const name = e.target.catName.value;
                                if (name) { addCategory(name); e.target.catName.value = ''; }
                            }} className="flex gap-2 mb-6">
                                <input name="catName" placeholder="اسم القسم الجديد" className="flex-1 border p-2 rounded-md" />
                                <button className="bg-green-600 text-white px-4 rounded-md">إضافة</button>
                            </form>
                            <ul className="space-y-2">
                                {categories.map(c => (
                                    <li key={c.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between">
                                        <span>{c.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {activeTab === 'images' && (
                        <div className="space-y-8">
                            {/* Disclaimer */}
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm">
                                <strong>تنبيه بخصوص الصور:</strong> الموقع لا يحتوي على سيرفر تخزين خاص (لأنه مجاني).
                                يرجى رفع الصور على مواقع مثل <a href="https://postimages.org/" target="_blank" className="underline font-bold">PostImages</a> أو <a href="https://imgur.com/upload" target="_blank" className="underline font-bold">Imgur</a>، ثم نسخ "الرابط المباشر" (Direct Link) ولصقه هنا.
                            </div>

                            {/* Hero Images Section */}
                            <div>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ImageIcon size={20} /> صور الواجهة الرئيسية (Hero)</h2>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        value={newHeroImage}
                                        onChange={(e) => setNewHeroImage(e.target.value)}
                                        placeholder="رابط الصورة المباشر (URL)"
                                        className="flex-1 border p-2 rounded-md"
                                    />
                                    <button onClick={addHeroImage} className="bg-blue-600 text-white px-4 rounded-md flex items-center gap-2"><Plus size={16} /> إضافة</button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(settings.heroImages || []).map((img, idx) => (
                                        <div key={idx} className="relative group rounded-lg overflow-hidden shadow border h-32">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeHeroImage(idx)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-8">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ImageIcon size={20} /> صور قسم العروض</h2>
                                <p className="text-sm text-gray-500 mb-2">يدعم الصور الطولية والعرضية</p>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        value={newOfferImage}
                                        onChange={(e) => setNewOfferImage(e.target.value)}
                                        placeholder="رابط صورة العرض (URL)"
                                        className="flex-1 border p-2 rounded-md"
                                    />
                                    <button onClick={addOfferImage} className="bg-blue-600 text-white px-4 rounded-md flex items-center gap-2"><Plus size={16} /> إضافة</button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(settings.offerImages || []).map((img, idx) => (
                                        <div key={idx} className="relative group rounded-lg overflow-hidden shadow border h-32">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeOfferImage(idx)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Palette /> بيانات المتجر</h2>
                                <div>
                                    <label className="block text-sm font-bold mb-1">اسم المتجر</label>
                                    <input
                                        value={settings.shopName}
                                        onChange={(e) => updateSettings({ ...settings, shopName: e.target.value })}
                                        className="w-full border p-2 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">جملة الترحيب</label>
                                    <input
                                        value={settings.heroHeadline}
                                        onChange={(e) => updateSettings({ ...settings, heroHeadline: e.target.value })}
                                        className="w-full border p-2 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">رقم الواتساب (للتواصل والطلبات)</label>
                                    <input
                                        value={settings.whatsappNumber}
                                        onChange={(e) => updateSettings({ ...settings, whatsappNumber: e.target.value })}
                                        className="w-full border p-2 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">اللون الرئيسي</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            value={settings.primaryColor}
                                            onChange={(e) => updateSettings({ ...settings, primaryColor: e.target.value })}
                                            className="h-10 w-20 rounded cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-500">{settings.primaryColor}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Share2 /> التواصل الاجتماعي</h2>
                                <div>
                                    <label className="block text-sm font-bold mb-1">رابط انستقرام</label>
                                    <input
                                        value={settings.instagramUrl || ''}
                                        onChange={(e) => updateSettings({ ...settings, instagramUrl: e.target.value })}
                                        placeholder="https://instagram.com/..."
                                        className="w-full border p-2 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">رابط سناب شات</label>
                                    <input
                                        value={settings.snapchatUrl || ''}
                                        onChange={(e) => updateSettings({ ...settings, snapchatUrl: e.target.value })}
                                        placeholder="https://snapchat.com/..."
                                        className="w-full border p-2 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">رابط تيك توك</label>
                                    <input
                                        value={settings.tiktokUrl || ''}
                                        onChange={(e) => updateSettings({ ...settings, tiktokUrl: e.target.value })}
                                        placeholder="https://tiktok.com/..."
                                        className="w-full border p-2 rounded-md"
                                    />
                                </div>

                                <div className="col-span-2 border-t pt-6 mt-4">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Upload /> إعدادات GitHub (رفع الصور)</h2>
                                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 text-sm">
                                        <p className="font-bold mb-1">ℹ️ كيفية الحصول على رمز GitHub:</p>
                                        <ol className="list-decimal mr-5 space-y-1 text-blue-800">
                                            <li>انتقل إلى GitHub → Settings → Developer settings</li>
                                            <li>اختر Personal access tokens → Tokens (classic)</li>
                                            <li>اضغط "Generate new token" واختر صلاحية <code className="bg-blue-100 px-1 rounded">repo</code></li>
                                            <li>انسخ الرمز والصقه أدناه</li>
                                        </ol>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">رمز GitHub (Token)</label>
                                            <input
                                                type="password"
                                                value={settings.githubToken || ''}
                                                onChange={(e) => updateSettings({ ...settings, githubToken: e.target.value })}
                                                placeholder="ghp_xxxxxxxxxxxxx"
                                                className="w-full border p-2 rounded-md font-mono text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-sm font-bold mb-1">Owner</label>
                                                <input
                                                    value={settings.githubOwner || 'Mahmoud-Walid1'}
                                                    onChange={(e) => updateSettings({ ...settings, githubOwner: e.target.value })}
                                                    className="w-full border p-2 rounded-md text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-1">Repository</label>
                                                <input
                                                    value={settings.githubRepo || 'Fkhm-Menu'}
                                                    onChange={(e) => updateSettings({ ...settings, githubRepo: e.target.value })}
                                                    className="w-full border p-2 rounded-md text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-1">Branch</label>
                                                <input
                                                    value={settings.githubBranch || 'main'}
                                                    onChange={(e) => updateSettings({ ...settings, githubBranch: e.target.value })}
                                                    className="w-full border p-2 rounded-md text-sm"
                                                />
                                            </div>
                                        </div>
                                        {settings.githubToken && (
                                            <div className="bg-green-50 border border-green-200 p-2 rounded text-sm text-green-800">
                                                ✓ تم حفظ رمز GitHub. يمكنك الآن رفع الصور مباشرة عند إضافة المنتجات.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};