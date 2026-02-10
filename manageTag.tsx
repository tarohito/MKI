import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, Search, Filter, Plus, Printer, Eye, Ban, 
  CheckCircle, X, AlertCircle, QrCode, FileText, ChevronLeft, 
  ChevronRight, Trash2, Save, Settings, ShieldCheck, Loader2,
  Server, RefreshCw, Database, Activity, CheckSquare, Package, 
  Tag, Menu, Layers, User, ArrowRight, Edit, Copy, Lock, Unlock, Calendar, LogOut, BarChart3, Image as ImageIcon, Upload
} from 'lucide-react';

/**
 * --- LAYER 1: DATA SERVICE (LOCAL STORAGE) ---
 */

const STORAGE_KEYS = {
  TAGS: 'TagManager_Tags_v7',
  PRODUCTS: 'TagManager_Products_v7',
  BRANDS: 'TagManager_Brands_v7',
  USER: 'TagManager_User_v7'
};

// Data Awal (Seeding)
const SEED_BRANDS = [
  { id: 'BR-001', name: 'KopiKu', description: 'Premium Coffee Brand', image: '' },
  { id: 'BR-002', name: 'TehNusantara', description: 'Traditional Tea', image: '' },
  { id: 'BR-003', name: 'SnackMantap', description: 'Local Snacks', image: '' }
];

const SEED_PRODUCTS = [
  { id: 'PR-001', name: 'Kopi Arabika Premium 250g', brandId: 'BR-001', sku: 'KP-AR-250' },
  { id: 'PR-002', name: 'Teh Hijau Melati', brandId: 'BR-002', sku: 'TH-GR-BOX' },
  { id: 'PR-003', name: 'Keripik Singkong Balado', brandId: 'BR-003', sku: 'SN-KS-BAL' }
];

// Helper LocalStorage
const getLS = (key: string) => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const setLS = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Generate Dummy Data
const generateDummyData = () => {
  return Array.from({ length: 15 }).map((_, i) => {
    const product = SEED_PRODUCTS[i % SEED_PRODUCTS.length];
    const brand = SEED_BRANDS.find(b => b.id === product.brandId);
    const now = Date.now();
    const timeOffset = Math.floor(Math.random() * 20 * 60 * 60 * 1000);
    
    return {
      id: `QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      productId: product.id,
      productName: product.name,
      brand: brand ? brand.name : 'Unknown',
      status: i % 4 === 0 ? 'used' : 'unused',
      scanCount: i % 4 === 0 ? Math.floor(Math.random() * 10) + 1 : 0,
      pin: i % 2 === 0 ? Math.floor(1000 + Math.random() * 9000).toString() : null,
      ecc: 'M',
      createdAt: new Date(now - timeOffset).toISOString()
    };
  });
};

// Inisialisasi Data
const initStorage = () => {
  if (typeof window !== 'undefined') {
    if (getLS(STORAGE_KEYS.BRANDS).length === 0) setLS(STORAGE_KEYS.BRANDS, SEED_BRANDS);
    if (getLS(STORAGE_KEYS.PRODUCTS).length === 0) setLS(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    if (getLS(STORAGE_KEYS.TAGS).length === 0) setLS(STORAGE_KEYS.TAGS, generateDummyData());
  }
};
initStorage();

/**
 * --- SERVICES ---
 */
const TagService = {
  cleanupExpired: async () => {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        try {
          const allTags = getLS(STORAGE_KEYS.TAGS);
          if (!Array.isArray(allTags)) {
             resolve(0);
             return;
          }
          const now = Date.now();
          const oneDayMs = 24 * 60 * 60 * 1000;
          
          const validTags = allTags.filter((tag: any) => {
            const created = new Date(tag.createdAt).getTime();
            return (now - created) <= oneDayMs;
          });

          const deletedCount = allTags.length - validTags.length;
          if (deletedCount > 0) setLS(STORAGE_KEYS.TAGS, validTags);
          resolve(deletedCount);
        } catch (e) {
          resolve(0);
        }
      }, 500);
    });
  },

  getTags: async (page = 1, limit = 10, filters: any = {}) => {
    const deletedCount = await TagService.cleanupExpired();
    const rawTags = getLS(STORAGE_KEYS.TAGS);
    const allTags = Array.isArray(rawTags) ? rawTags : [];
    let results = [...allTags];

    if (filters.search) {
      const lower = filters.search.toLowerCase();
      results = results.filter((t: any) => t.id.toLowerCase().includes(lower));
    }
    if (filters.status && filters.status !== 'all') {
      results = results.filter((t: any) => t.status === filters.status);
    }
    if (filters.productId && filters.productId !== 'all') {
      results = results.filter((t: any) => String(t.productId) === String(filters.productId));
    }

    results.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const total = results.length;
    const start = (page - 1) * limit;
    const data = results.slice(start, start + limit);
    return { data, total, deletedCount };
  },

  getAllIds: async (filters: any = {}) => {
    const rawTags = getLS(STORAGE_KEYS.TAGS);
    const allTags = Array.isArray(rawTags) ? rawTags : [];
    let results = [...allTags];
    if (filters.search) results = results.filter((t: any) => t.id.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.status && filters.status !== 'all') results = results.filter((t: any) => t.status === filters.status);
    if (filters.productId && filters.productId !== 'all') results = results.filter((t: any) => String(t.productId) === String(filters.productId));
    return results.map((t: any) => t.id);
  },

  getTagsByIds: async (ids: string[]) => {
    const rawTags = getLS(STORAGE_KEYS.TAGS);
    const allTags = Array.isArray(rawTags) ? rawTags : [];
    return allTags.filter((t: any) => ids.includes(t.id));
  },

  getTagCounts: async () => {
    const rawTags = getLS(STORAGE_KEYS.TAGS);
    const allTags = Array.isArray(rawTags) ? rawTags : [];
    const counts: Record<string, number> = {};
    allTags.forEach((tag: any) => {
      counts[tag.productId] = (counts[tag.productId] || 0) + 1;
    });
    return counts;
  },

  generateTags: async (newTags: any[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = getLS(STORAGE_KEYS.TAGS);
        const safeCurrent = Array.isArray(current) ? current : [];
        setLS(STORAGE_KEYS.TAGS, [...safeCurrent, ...newTags]);
        resolve(true);
      }, 800);
    });
  },

  deleteTags: async (ids: string[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let current = getLS(STORAGE_KEYS.TAGS);
        if (!Array.isArray(current)) current = [];
        const safeCurrent = current.filter((t: any) => !ids.includes(t.id));
        setLS(STORAGE_KEYS.TAGS, safeCurrent);
        resolve(true);
      }, 500);
    });
  }
};

const ProductService = {
  getAll: () => {
    const data = getLS(STORAGE_KEYS.PRODUCTS);
    return Array.isArray(data) ? data : [];
  },
  getProductCounts: async () => {
    const products = getLS(STORAGE_KEYS.PRODUCTS);
    const safeProducts = Array.isArray(products) ? products : [];
    const counts: Record<string, number> = {};
    safeProducts.forEach((p: any) => {
      counts[p.brandId] = (counts[p.brandId] || 0) + 1;
    });
    return counts;
  },
  save: (product: any) => {
    let list = getLS(STORAGE_KEYS.PRODUCTS);
    if (!Array.isArray(list)) list = [];
    const idx = list.findIndex((p: any) => p.id === product.id);
    if (idx !== -1) list[idx] = product; else list.push(product);
    setLS(STORAGE_KEYS.PRODUCTS, list);
  },
  delete: (id: string) => {
    let list = getLS(STORAGE_KEYS.PRODUCTS);
    if (!Array.isArray(list)) list = [];
    setLS(STORAGE_KEYS.PRODUCTS, list.filter((p: any) => p.id !== id));
  }
};

const BrandService = {
  getAll: () => {
    const data = getLS(STORAGE_KEYS.BRANDS);
    return Array.isArray(data) ? data : [];
  },
  save: (brand: any) => {
    let list = getLS(STORAGE_KEYS.BRANDS);
    if (!Array.isArray(list)) list = [];
    const idx = list.findIndex((b: any) => b.id === brand.id);
    if (idx !== -1) list[idx] = brand; else list.push(brand);
    setLS(STORAGE_KEYS.BRANDS, list);
  },
  delete: (id: string) => {
    let list = getLS(STORAGE_KEYS.BRANDS);
    if (!Array.isArray(list)) list = [];
    setLS(STORAGE_KEYS.BRANDS, list.filter((b: any) => b.id !== id));
  }
};

/**
 * --- UI COMPONENTS (Defined before use) ---
 */

const Sidebar = ({ activeView, setActiveView, isMobileOpen, setIsMobileOpen, isMinimized }: any) => {
  const menus = [
    { id: 'tags', label: 'Manajemen Tag', icon: QrCode },
    { id: 'products', label: 'Produk', icon: Package },
    { id: 'brands', label: 'Brand', icon: Tag },
  ];
  return (
    <>
      {isMobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transform transition-all duration-300 md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isMinimized ? 'w-20' : 'w-64'}`}>
        <div className={`h-16 flex items-center border-b border-gray-100 ${isMinimized ? 'justify-center' : 'px-6 gap-3'}`}>
          <div className="bg-[#C1986E] p-2 rounded-lg text-white shrink-0"><QrCode size={24} /></div>
          {!isMinimized && <h1 className="text-xl font-bold text-gray-800 truncate">TagManager</h1>}
        </div>
        <nav className="p-3 space-y-1">
          {menus.map(menu => (
            <button key={menu.id} onClick={() => { setActiveView(menu.id); setIsMobileOpen(false); }} className={`w-full flex items-center rounded-lg font-medium transition-colors relative group ${isMinimized ? 'justify-center p-3' : 'gap-3 px-4 py-3 text-sm'} ${activeView === menu.id ? 'bg-[#C1986E]/10 text-[#C1986E]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`} title={isMinimized ? menu.label : ''}>
              <menu.icon size={20} className="shrink-0" />{!isMinimized && <span>{menu.label}</span>}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

const Header = ({ isSidebarMinimized, setIsSidebarMinimized, setIsMobileOpen, user, onLogout }: any) => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between shadow-sm shrink-0">
    <div className="flex items-center gap-4">
      <button onClick={() => setIsSidebarMinimized(!isSidebarMinimized)} className="hidden md:flex p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Menu size={20} /></button>
      <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Menu size={20} /></button>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-gray-700 leading-none">{user?.name || 'Admin'}</p>
        <p className="text-xs text-[#C1986E] font-medium mt-1">Super Admin</p>
      </div>
      <div className="w-9 h-9 rounded-full bg-[#C1986E] text-white flex items-center justify-center font-bold shadow-sm"><User size={18} /></div>
      <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg ml-2"><LogOut size={20} /></button>
    </div>
  </header>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = { 
    unused: 'text-gray-600 bg-gray-100', 
    used: 'text-emerald-600 bg-emerald-50', 
    blocked: 'text-rose-600 bg-rose-50' 
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${styles[status] || styles.unused}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'unused' ? 'bg-gray-400' : status === 'used' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
      {status === 'unused' ? 'Ready' : status === 'used' ? 'Scanned' : 'Blocked'}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: any) => {
  if (!isOpen) return null;
  const sizes: any = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-7xl' };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[95vh] flex flex-col`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const Toast = ({ message, type, onClose }: any) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const styles = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';
  return <div className={`fixed bottom-6 right-6 ${styles} text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-[70] animate-in slide-in-from-bottom-5 duration-300`}><CheckCircle size={20} /><span className="font-medium text-sm">{message}</span></div>;
};

const QRCodePlaceholder = ({ data, size = 100, ecc = 'M' }: any) => {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}&color=000000&bgcolor=ffffff&ecc=${ecc}`;
  return <div className="bg-white p-1 rounded border border-gray-200 inline-block"><img src={src} alt="QR" width={size} height={size} loading="lazy" className="block" /></div>;
};

// Login Page Component
const LoginPage = ({ onLogin }: any) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
       <div className="bg-white p-8 rounded-xl shadow-xl w-96 text-center">
          <div className="w-12 h-12 bg-[#C1986E] rounded-full flex items-center justify-center text-white mx-auto mb-4"><QrCode size={24}/></div>
          <h1 className="text-xl font-bold mb-2">Tag Management System</h1>
          <p className="text-sm text-gray-500 mb-6">Masuk untuk mengelola produksi.</p>
          <button onClick={() => onLogin({ name: 'Admin', role: 'Super Admin' })} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Masuk Dashboard</button>
          <p className="text-xs text-gray-400 mt-4">Demo Version 2.5</p>
       </div>
    </div>
  );
};

/**
 * --- PAGES / SUB-VIEWS ---
 */

const BrandManager = ({ showToast }: any) => {
  const [brands, setBrands] = useState<any[]>([]);
  const [productCounts, setProductCounts] = useState<any>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', description: '', image: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isSelectAllGlobal, setIsSelectAllGlobal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { 
    const fetchData = async () => {
      const allBrands = await BrandService.getAll();
      setBrands(allBrands || []); 
      const counts = await ProductService.getProductCounts();
      setProductCounts(counts || {});
    }
    fetchData();
  }, [modalOpen, deleteModalOpen]);

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalRecords = filteredBrands.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBrands = filteredBrands.slice(startIndex, startIndex + itemsPerPage);
  
  const isAllCurrentPageSelected = paginatedBrands.length > 0 && paginatedBrands.every(b => selectedBrands.includes(b.id));

  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      const pageIds = paginatedBrands.map(b => b.id);
      setSelectedBrands([...new Set([...selectedBrands, ...pageIds])]);
    } else {
      const pageIds = paginatedBrands.map(b => b.id);
      setSelectedBrands(selectedBrands.filter(id => !pageIds.includes(id)));
      setIsSelectAllGlobal(false);
    }
  };

  const handleSelectOne = (id: string) => {
    selectedBrands.includes(id) ? setSelectedBrands(selectedBrands.filter(bid => bid !== id)) : setSelectedBrands([...selectedBrands, id]);
  };

  const handleSelectAllGlobal = () => {
    setSelectedBrands(filteredBrands.map(b => b.id));
    setIsSelectAllGlobal(true);
  };

  const handleSave = () => {
    if (!formData.name) return showToast('Nama wajib diisi', 'error');
    const payload = formData.id ? formData : { ...formData, id: `BR-${Date.now()}` };
    BrandService.save(payload);
    showToast('Brand disimpan', 'success');
    setModalOpen(false);
  };

  const initiateDelete = (ids: string[]) => {
    const brandsWithProducts = ids.filter(id => (productCounts[id] || 0) > 0);
    if (brandsWithProducts.length > 0) return showToast(`Gagal: ${brandsWithProducts.length} brand masih memiliki produk aktif.`, 'error');
    setItemsToDelete(ids);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    itemsToDelete.forEach(id => BrandService.delete(id));
    showToast(`${itemsToDelete.length} brand dihapus`, 'success');
    setItemsToDelete([]);
    setSelectedBrands([]);
    setDeleteModalOpen(false);
  };

  // Image Handler
  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) return showToast('Ukuran gambar maks 500KB', 'error');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div><h2 className="text-2xl font-bold">Manajemen Brand</h2><p className="text-sm text-gray-500">Daftar merek produk yang tersedia.</p></div>
        <div className="flex gap-2">
          {selectedBrands.length > 0 && (
             <button onClick={() => initiateDelete(selectedBrands)} className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-50"><Trash2 size={16}/> Hapus ({selectedBrands.length})</button>
          )}
          <button onClick={() => { setFormData({id:'',name:'',description:'', image: ''}); setModalOpen(true); }} className="px-4 py-2 bg-[#C1986E] text-white rounded-lg flex gap-2 font-medium"><Plus size={18}/> Tambah</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 shrink-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-10"><label className="text-xs font-bold text-gray-500 block mb-1">Cari Brand</label><div className="relative"><Search className="absolute left-3 top-2 text-gray-400" size={16}/><input type="text" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="Nama Brand..." value={searchTerm} onChange={e=>{setSearchTerm(e.target.value); setCurrentPage(1);}}/></div></div>
        <div className="md:col-span-2 text-right text-sm text-gray-500 pb-2">Total: <b>{totalRecords}</b></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        {selectedBrands.length > 0 && !isSelectAllGlobal && totalRecords > selectedBrands.length && (
           <div className="bg-blue-50 p-2 text-center text-sm text-blue-800 border-b cursor-pointer hover:underline" onClick={handleSelectAllGlobal}>Pilih semua {totalRecords} data di database?</div>
        )}
        
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-white border-b sticky top-0 z-10">
              <tr>
                <th className="p-5 w-10 text-center"><input type="checkbox" checked={isAllCurrentPageSelected} onChange={handleSelectAll} className="rounded text-[#C1986E] focus:ring-[#C1986E]"/></th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase">Brand</th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase">Deskripsi</th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase">Produk</th>
                <th className="p-5 text-right text-xs font-bold text-gray-400 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedBrands.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-gray-400">Belum ada data</td></tr> :
              paginatedBrands.map(b => (
                <tr key={b.id} className={`hover:bg-[#C1986E]/5 transition-colors ${selectedBrands.includes(b.id) ? 'bg-[#C1986E]/5' : ''}`}>
                  <td className="p-5 text-center"><input type="checkbox" checked={selectedBrands.includes(b.id)} onChange={() => handleSelectOne(b.id)} className="rounded text-[#C1986E] focus:ring-[#C1986E]"/></td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                          {b.image ? <img src={b.image} alt={b.name} className="w-full h-full object-cover"/> : <ImageIcon size={20} className="text-gray-400"/>}
                       </div>
                       <div>
                          <div className="font-bold text-gray-800">{b.name}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">{b.id}</div>
                       </div>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-gray-600">{b.description}</td>
                  <td className="p-5"><div className="flex items-center gap-2"><Package size={16} className="text-gray-400"/><span className="text-sm font-medium text-gray-700">{productCounts[b.id] || 0}</span></div></td>
                  <td className="p-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => { setFormData(b); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button><button onClick={() => initiateDelete([b.id])} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 border-t bg-gray-50 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500">Hal {currentPage} ({totalRecords} data)</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="p-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16}/></button>
            <button onClick={() => setCurrentPage(p => p+1)} disabled={paginatedBrands.length < itemsPerPage} className="p-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Form Brand" size="sm">
        <div className="space-y-4">
          <div><label className="text-sm font-bold text-gray-700">Nama Brand</label><input type="text" className="w-full p-2.5 border rounded-lg mt-1" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          
          <div>
            <label className="text-sm font-bold text-gray-700">Logo Brand</label>
            <div className="flex items-center gap-4 mt-1">
               <div className="w-16 h-16 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                   {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-gray-300"/>}
               </div>
               <label className="flex-1 cursor-pointer">
                  <div className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-center hover:bg-gray-50">Upload Gambar</div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload}/>
                  <p className="text-[10px] text-gray-400 mt-1">Max 500KB</p>
               </label>
            </div>
          </div>
          
          <div><label className="text-sm font-bold text-gray-700">Deskripsi</label><textarea className="w-full p-2.5 border rounded-lg mt-1" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <button onClick={handleSave} className="w-full py-2.5 bg-[#C1986E] text-white rounded-lg font-medium">Simpan</button>
        </div>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Hapus Brand" size="sm">
         <div className="text-center p-4">
            <div className="bg-red-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3"><Trash2 size={32} className="text-red-500"/></div>
            <p>Hapus <b>{itemsToDelete.length} brand</b>? Data tidak bisa dikembalikan.</p>
            <div className="flex gap-2 mt-6"><button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2.5 border rounded-lg text-sm font-medium">Batal</button><button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium">Hapus</button></div>
         </div>
      </Modal>
    </div>
  );
};

const ProductManager = ({ showToast }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [tagCounts, setTagCounts] = useState<any>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', brandId: '', sku: '' });
  
  // State: Pagination & Selection
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isSelectAllGlobal, setIsSelectAllGlobal] = useState(false);
  const [filterBrand, setFilterBrand] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { 
    const fetchData = async () => {
      setProducts(await ProductService.getAll() || []); 
      setBrands(await BrandService.getAll() || []);
      const counts = await TagService.getTagCounts();
      setTagCounts(counts || {});
    };
    fetchData();
  }, [modalOpen, deleteModalOpen]);

  const handleSave = () => {
    if (!formData.name || !formData.brandId) return showToast('Lengkapi data', 'error');
    const payload = formData.id ? formData : { ...formData, id: `PR-${Date.now()}` };
    ProductService.save(payload);
    showToast('Produk disimpan', 'success');
    setModalOpen(false);
  };

  const initiateDelete = (ids: string[]) => {
    const productsWithTags = ids.filter(id => (tagCounts[id] || 0) > 0);
    if (productsWithTags.length > 0) {
      if (ids.length === 1) return showToast(`Gagal: Produk ini memiliki ${tagCounts[ids[0]]} tag aktif.`, 'error');
      else return showToast(`Gagal: ${productsWithTags.length} produk memiliki tag aktif. Hapus tag terlebih dahulu.`, 'error');
    }
    setItemsToDelete(ids);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    itemsToDelete.forEach(id => ProductService.delete(id));
    showToast(`${itemsToDelete.length} produk dihapus`, 'success');
    setItemsToDelete([]);
    setSelectedProducts([]);
    setDeleteModalOpen(false);
    setProducts(ProductService.getAll());
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBrand = filterBrand === 'all' || p.brandId === filterBrand;
    return matchSearch && matchBrand;
  });

  const totalRecords = filteredProducts.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  const isAllCurrentPageSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProducts.includes(p.id));

  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      const pageIds = paginatedProducts.map(p => p.id);
      setSelectedProducts([...new Set([...selectedProducts, ...pageIds])]);
    } else {
      const pageIds = paginatedProducts.map(p => p.id);
      setSelectedProducts(selectedProducts.filter(id => !pageIds.includes(id)));
      setIsSelectAllGlobal(false);
    }
  };

  const handleSelectOne = (id: string) => {
    selectedProducts.includes(id) ? setSelectedProducts(selectedProducts.filter(pid => pid !== id)) : setSelectedProducts([...selectedProducts, id]);
  };

  const handleSelectAllGlobal = () => {
    setSelectedProducts(filteredProducts.map(p => p.id));
    setIsSelectAllGlobal(true);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div><h2 className="text-2xl font-bold">Manajemen Produk</h2><p className="text-sm text-gray-500">Katalog produk untuk generate tag.</p></div>
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
             <button onClick={() => initiateDelete(selectedProducts)} className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-50"><Trash2 size={16}/> Hapus ({selectedProducts.length})</button>
          )}
          <button onClick={() => { setFormData({id:'',name:'',brandId:'',sku:''}); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#C1986E] text-white rounded-lg text-sm font-medium hover:bg-[#A67C52]"><Plus size={16}/> Tambah Produk</button>
        </div>
      </div>
      
      {/* FILTERS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 shrink-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-5"><label className="text-xs font-bold text-gray-500 block mb-1">Cari Produk</label><div className="relative"><Search className="absolute left-3 top-2 text-gray-400" size={16}/><input type="text" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="Nama / SKU..." value={searchTerm} onChange={e=>{setSearchTerm(e.target.value); setCurrentPage(1);}}/></div></div>
        <div className="md:col-span-5"><label className="text-xs font-bold text-gray-500 block mb-1">Filter Brand</label><select className="w-full p-2 border rounded-lg text-sm" value={filterBrand} onChange={e=>{setFilterBrand(e.target.value); setCurrentPage(1);}}><option value="all">Semua Brand</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        <div className="md:col-span-2 text-right text-sm text-gray-500 pb-2">Total: <b>{totalRecords}</b></div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        {selectedProducts.length > 0 && !isSelectAllGlobal && totalRecords > selectedProducts.length && (
           <div className="bg-blue-50 p-2 text-center text-sm text-blue-800 border-b cursor-pointer hover:underline" onClick={handleSelectAllGlobal}>Pilih semua {totalRecords} data di database?</div>
        )}
        
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-white sticky top-0 z-10 border-b">
              <tr>
                <th className="p-5 w-10 text-center"><input type="checkbox" checked={isAllCurrentPageSelected} onChange={handleSelectAll} className="rounded text-[#C1986E] focus:ring-[#C1986E]"/></th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase">Produk Info</th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase">Brand</th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase">Statistik</th>
                <th className="p-5 text-right text-xs font-bold text-gray-400 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Package size={32} className="text-gray-300" /></div>
                      <h3 className="text-lg font-bold text-gray-800">Tidak Ada Produk</h3>
                      <p className="text-sm text-gray-500 mt-1">Belum ada produk yang sesuai kriteria.</p>
                      <button onClick={() => { setFormData({id:'',name:'',brandId:'',sku:''}); setModalOpen(true); }} className="mt-4 text-[#C1986E] font-bold text-sm hover:underline">+ Tambah Produk Baru</button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map(p => (
                  <tr key={p.id} className={`hover:bg-[#C1986E]/5 transition-colors ${selectedProducts.includes(p.id) ? 'bg-[#C1986E]/5' : ''}`}>
                    <td className="p-5 text-center"><input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => handleSelectOne(p.id)} className="rounded text-[#C1986E] focus:ring-[#C1986E]"/></td>
                    <td className="p-5">
                      <div className="font-bold text-gray-800">{p.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">SKU: {p.sku || '-'}</div>
                    </td>
                    <td className="p-5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {brands.find(b=>b.id===p.brandId)?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-5">
                       <div className="flex items-center gap-2">
                          <BarChart3 size={16} className="text-gray-400"/><span className="text-sm font-medium text-gray-700">{tagCounts[p.id] || 0} Tags</span>
                       </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setFormData(p); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16}/></button>
                        <button onClick={() => initiateDelete([p.id])} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 border-t bg-gray-50 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500">Hal {currentPage} ({totalRecords} data)</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="p-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16}/></button>
            <button onClick={() => setCurrentPage(p => p+1)} disabled={paginatedProducts.length < itemsPerPage} className="p-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={formData.id ? "Edit Produk" : "Tambah Produk"} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Produk</label><input type="text" className="w-full p-2.5 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU</label><input type="text" className="w-full p-2.5 border rounded-lg" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
          </div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand</label><select className="w-full p-2.5 border rounded-lg bg-white" value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})}><option value="">Pilih Brand</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
          <button onClick={handleSave} className="w-full py-2.5 bg-[#C1986E] text-white rounded-lg font-bold hover:bg-[#A67C52] transition-colors">Simpan Produk</button>
        </div>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Hapus Produk" size="sm">
         <div className="text-center p-4">
            <div className="bg-red-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3"><Trash2 size={32} className="text-red-500"/></div>
            <h3 className="text-lg font-bold text-gray-800">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-500 mt-2">Anda yakin ingin menghapus <b>{itemsToDelete.length} produk</b>? <br/>Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-2 mt-6"><button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button><button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm">Ya, Hapus</button></div>
         </div>
      </Modal>
    </div>
  );
};

const TagDashboard = ({ showToast }: any) => {
  const [tags, setTags] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [opLoading, setOpLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSelectAllGlobal, setIsSelectAllGlobal] = useState(false);

  const [modal, setModal] = useState({ generate: false, print: false, delete: false, detail: false });
  const [detailData, setDetailData] = useState(null);
  const [printData, setPrintData] = useState([]);
  
  const [genForm, setGenForm] = useState({ productId: '', quantity: 100, usePin: true, idLength: 8, pinLength: 4, ecc: 'M' });
  const [printSettings, setPrintSettings] = useState({ paperWidth: 310, paperHeight: 450, stickerSizeMm: 40, gapMm: 4, marginMm: 10 });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [tagRes, prodRes, brandRes] = await Promise.all([
      TagService.getTags(currentPage, 10, { search: searchTerm, status: filterStatus, productId: filterProduct }),
      ProductService.getAll(),
      BrandService.getAll()
    ]);
    setTags(tagRes.data || []);
    setTotalRecords(tagRes.total);
    setProducts(prodRes);
    setBrands(brandRes);
    setLoading(false);
    if (tagRes.deletedCount > 0) showToast(`Otomatis menghapus ${tagRes.deletedCount} tag usang (>24 jam)`, 'success');
    if (!isSelectAllGlobal) setSelectedTags([]);
  }, [currentPage, searchTerm, filterStatus, filterProduct]);

  useEffect(() => { loadData(); }, [loadData]);

  const getProduct = (id) => products.find(p => String(p.id) === String(id));
  const getSKU = (id) => getProduct(id)?.sku || '-';
  const getBrand = (id) => brands.find(b => b.id === getProduct(id)?.brandId)?.name || '-';

  const handleGenerate = async () => {
    if (!genForm.productId) return showToast('Pilih produk', 'error');
    setOpLoading(true);
    const prod = getProduct(genForm.productId);
    const newTags = [];
    const genPin = (len: number) => Array.from({length: len}, () => Math.floor(Math.random()*10)).join('');

    for(let i=0; i<genForm.quantity; i++) {
      newTags.push({
        id: `QR-${Math.random().toString(36).substring(2, 2 + genForm.idLength).toUpperCase()}`,
        productId: genForm.productId,
        productName: prod?.name,
        brand: getBrand(genForm.productId),
        status: 'unused',
        scanCount: 0,
        pin: genForm.usePin ? genPin(genForm.pinLength) : null,
        ecc: genForm.ecc,
        createdAt: new Date().toISOString()
      });
    }
    await TagService.generateTags(newTags);
    showToast('Generate berhasil', 'success');
    setModal({...modal, generate: false});
    setOpLoading(false);
    loadData();
  };

  const handleDelete = async () => {
    setOpLoading(true);
    await TagService.deleteTags(selectedTags);
    showToast('Data dihapus', 'success');
    setModal({...modal, delete: false});
    setIsSelectAllGlobal(false);
    setSelectedTags([]);
    setOpLoading(false);
    loadData();
  };

  const handlePrintPreview = async () => {
    setOpLoading(true);
    const data = await TagService.getTagsByIds(selectedTags);
    setPrintData(data);
    setModal({...modal, print: true});
    setOpLoading(false);
  };

  const handleSelectAllGlobal = async () => {
    setOpLoading(true);
    const allIds = await TagService.getAllIds({ search: searchTerm, status: filterStatus, productId: filterProduct });
    setSelectedTags(allIds);
    setIsSelectAllGlobal(true);
    showToast(`Berhasil memilih ${allIds.length} data`, 'success');
  };

  const calculatedPages = useMemo(() => {
    const defaultResult = { pages: [], cols: 0, rows: 0, itemsPerPage: 0 };
    if (!printData.length) return defaultResult;

    const { paperWidth, paperHeight, stickerSizeMm, gapMm, marginMm } = printSettings;
    const contentW = paperWidth - (marginMm * 2);
    const contentH = paperHeight - (marginMm * 2);
    const cols = Math.floor((contentW + gapMm) / (stickerSizeMm + gapMm));
    const rows = Math.floor((contentH + gapMm) / (stickerSizeMm + gapMm));
    const itemsPerPage = cols * rows;

    if (itemsPerPage <= 0) return defaultResult;

    const pages = [];
    for (let i = 0; i < printData.length; i += itemsPerPage) {
      pages.push(printData.slice(i, i + itemsPerPage));
    }

    return { pages, cols, rows, itemsPerPage };
  }, [printData, printSettings]);

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast('Copied', 'success');
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 shrink-0">
        <div><h2 className="text-2xl font-bold">Manajemen Tag</h2><p className="text-sm text-gray-500">Pantau dan kelola QR Code produksi.</p></div>
        <div className="flex gap-2">
           {selectedTags.length > 0 && <button onClick={() => setModal({...modal, delete: true})} className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg"><Trash2 size={16}/> Hapus ({selectedTags.length})</button>}
           <button onClick={handlePrintPreview} disabled={selectedTags.length===0} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${selectedTags.length > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-100 text-gray-400'}`}><Printer size={16}/> Cetak</button>
           <button onClick={() => setModal({...modal, generate: true})} className="flex items-center gap-2 px-4 py-2 bg-[#C1986E] text-white rounded-lg"><Plus size={16}/> Generate</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1">Cari ID</label><div className="relative"><Search className="absolute left-3 top-2 text-gray-400" size={16}/><input type="text" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div></div>
        <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1">Produk</label><select className="w-full p-2 border rounded-lg text-sm" value={filterProduct} onChange={e => setFilterProduct(e.target.value)}><option value="all">Semua</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1">Status</label><select className="w-full p-2 border rounded-lg text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option value="all">Semua</option><option value="unused">Ready</option><option value="used">Scanned</option><option value="blocked">Blocked</option></select></div>
        <div className="text-right text-sm text-gray-500 pb-2">Total: <b>{totalRecords}</b></div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        {selectedTags.length > 0 && !isSelectAllGlobal && totalRecords > selectedTags.length && (
           <div className="bg-blue-50 p-2 text-center text-sm text-blue-800 border-b cursor-pointer hover:underline" onClick={handleSelectAllGlobal}>Pilih semua {totalRecords} data di database?</div>
        )}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-white sticky top-0 z-10 border-b">
              <tr>
                <th className="p-4 w-10 text-center"><input type="checkbox" checked={tags.length > 0 && tags.every(t => selectedTags.includes(t.id))} onChange={e => setSelectedTags(e.target.checked ? [...new Set([...selectedTags, ...tags.map(t=>t.id)])] : [])} className="rounded text-[#C1986E] focus:ring-[#C1986E]"/></th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tag ID</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Info Produk</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="p-4 text-center text-xs font-bold text-gray-400 uppercase">Scans</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Dibuat</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="p-10 text-center text-gray-400">Loading...</td></tr> : tags.length === 0 ? <tr><td colSpan={7} className="p-10 text-center text-gray-400">Tidak ada data.</td></tr> : tags.map(tag => (
                <tr key={tag.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 text-center"><input type="checkbox" checked={selectedTags.includes(tag.id)} onChange={() => setSelectedTags(prev => prev.includes(tag.id) ? prev.filter(i=>i!==tag.id) : [...prev, tag.id])} className="rounded text-[#C1986E] focus:ring-[#C1986E]"/></td>
                  <td className="p-4"><div className="flex items-center gap-3"><QrCode size={18} className="text-gray-400"/><span className="font-mono font-bold text-sm text-gray-700">{tag.id}</span><button onClick={() => copyToClipboard(tag.id)} className="text-gray-300 hover:text-[#C1986E]"><Copy size={12}/></button></div></td>
                  <td className="p-4"><div className="font-bold text-gray-800 text-sm">{tag.productName}</div><div className="text-xs text-gray-500">{tag.brand} • SKU: {getSKU(tag.productId)}</div></td>
                  <td className="p-4"><StatusBadge status={tag.status === 'blocked' ? 'blocked' : (tag.scanCount > 0 ? 'used' : 'unused')} /></td>
                  <td className="p-4 text-center font-bold text-gray-600">{tag.scanCount}</td>
                  <td className="p-4 text-xs text-gray-500">{new Date(tag.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-right"><button onClick={() => { setDetailData(tag); setModal({...modal, detail: true}); }} className="text-gray-400 hover:text-[#C1986E]"><Eye size={18}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t bg-gray-50 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500">Hal {currentPage}</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="p-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16}/></button>
            <button onClick={() => setCurrentPage(p => p+1)} disabled={tags.length < 10} className="p-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <Modal isOpen={modal.generate} onClose={() => setModal({...modal, generate: false})} title="Generate Tag Baru" size="md">
         <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#C1986E]/10 to-white p-4 rounded-lg border-l-4 border-[#C1986E]">
               <div className="flex gap-3"><Database size={18} className="text-[#C1986E]"/><div className="text-sm"><h4 className="font-bold text-[#8C6B42]">Sinkronisasi Database</h4><p className="text-xs text-gray-500">Tag akan langsung tersimpan di database.</p></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-xs font-bold text-gray-500 block mb-1">Produk</label><div className="relative"><Package size={16} className="absolute left-3 top-3 text-gray-400"/><select className="w-full pl-9 p-2.5 border rounded-lg bg-white" value={genForm.productId} onChange={e=>setGenForm({...genForm, productId: e.target.value})}><option value="">Pilih Produk</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">Jumlah</label><input type="number" className="w-full p-2.5 border rounded-lg" value={genForm.quantity} onChange={e=>setGenForm({...genForm, quantity: parseInt(e.target.value)})} /></div>
              
              {/* ID Length Slider */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Panjang ID</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg flex flex-col justify-center h-[42px]">
                   <div className="flex justify-between items-center">
                      <input 
                        type="range" min="6" max="16" 
                        className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#C1986E]" 
                        value={genForm.idLength} 
                        onChange={e => setGenForm({...genForm, idLength: parseInt(e.target.value)})} 
                      />
                      <span className="text-xs font-bold text-[#C1986E] ml-2 w-6 text-right">{genForm.idLength}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* SECURITY SECTION */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
               <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                     <div className={`p-2 rounded-lg ${genForm.usePin ? 'bg-[#C1986E]/10 text-[#C1986E]' : 'bg-gray-200 text-gray-400'}`}><ShieldCheck size={18} /></div>
                     <div><p className="text-sm font-bold text-gray-700">Proteksi PIN</p><p className="text-[10px] text-gray-500">Generate 4-8 digit PIN acak</p></div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" className="sr-only peer" checked={genForm.usePin} onChange={() => setGenForm({...genForm, usePin: !genForm.usePin})} />
                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C1986E]"></div>
                  </label>
               </div>
               
               {genForm.usePin && (
                 <div className="pl-[52px] animate-in slide-in-from-top-1 fade-in duration-200">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-xs font-bold text-gray-500">Panjang PIN</span>
                    </div>
                    <div className="flex items-center">
                       <input 
                         type="range" min="4" max="8" step="2" 
                         className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#C1986E]" 
                         value={genForm.pinLength} 
                         onChange={(e) => setGenForm({...genForm, pinLength: parseInt(e.target.value)})} 
                       />
                       <span className="text-xs font-bold text-[#C1986E] ml-3 w-8 text-right">{genForm.pinLength}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-400 px-0.5 mt-1 pr-11"><span>4</span><span>6</span><span>8</span></div>
                 </div>
               )}

               <div className="h-px bg-gray-200 my-2"></div>
               
               <div>
                  <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-gray-500 uppercase">Error Correction</span></div>
                  <div className="grid grid-cols-4 gap-2">
                     {['L', 'M', 'Q', 'H'].map((lvl) => (
                        <button key={lvl} onClick={() => setGenForm({...genForm, ecc: lvl})} className={`py-2 text-xs rounded-lg font-bold transition-all border ${genForm.ecc === lvl ? 'bg-white border-[#C1986E] text-[#C1986E] shadow-sm ring-1 ring-[#C1986E]/20' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                          {lvl} <span className="opacity-60 font-normal">{lvl === 'L' ? '7%' : lvl === 'M' ? '15%' : lvl === 'Q' ? '25%' : '30%'}</span>
                        </button>
                     ))}
                  </div>
               </div>
            </div>
            
            <button onClick={handleGenerate} disabled={opLoading} className="w-full py-3 bg-[#C1986E] text-white font-bold rounded-lg hover:bg-[#A67C52] flex justify-center gap-2">{opLoading ? <Loader2 className="animate-spin"/> : 'Generate Batch'}</button>
         </div>
      </Modal>

      <Modal isOpen={modal.print} onClose={() => setModal({...modal, print: false})} title="Smart Print Layout (A3+)" size="xl">
         <div className="flex h-[70vh] gap-4">
            <div className="w-64 space-y-4 overflow-y-auto pr-2">
               <div className="bg-blue-50 p-3 rounded border border-blue-100 text-xs text-blue-800"><p>Total Data: <b>{printData.length}</b></p><p>Halaman: <b>{calculatedPages.pages.length}</b></p></div>
               <div><label className="text-xs font-bold block mb-1">Ukuran Stiker (mm)</label><input type="range" min="20" max="80" className="w-full accent-[#C1986E]" value={printSettings.stickerSizeMm} onChange={e=>setPrintSettings({...printSettings, stickerSizeMm: parseInt(e.target.value)})}/></div>
               <div><label className="text-xs font-bold block mb-1">Gap (mm)</label><input type="range" min="0" max="10" className="w-full accent-[#C1986E]" value={printSettings.gapMm} onChange={e=>setPrintSettings({...printSettings, gapMm: parseInt(e.target.value)})}/></div>
               <button onClick={() => window.print()} className="w-full py-2 bg-[#C1986E] text-white rounded font-bold mt-4 flex items-center justify-center gap-2"><Printer size={16}/> Print</button>
            </div>
            <div className="flex-1 bg-gray-100 rounded p-6 overflow-auto flex justify-center">
               <div className="bg-white shadow-xl p-8 grid content-start" style={{ width: '310mm', minHeight: '450mm', gridTemplateColumns: `repeat(${calculatedPages.cols}, ${printSettings.stickerSizeMm}mm)`, gap: `${printSettings.gapMm}mm`, transform: 'scale(0.4)', transformOrigin: 'top center' }}>
                  {calculatedPages.pages[0]?.map(tag => (
                     <div key={tag.id} className="border border-gray-300 p-1 flex flex-col items-center justify-center text-center aspect-square overflow-hidden">
                        <QRCodePlaceholder data={tag.id} size={printSettings.stickerSizeMm * 2} ecc={tag.ecc}/>
                        <div className="mt-1 font-bold leading-none" style={{fontSize: '9px'}}>{tag.id}</div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </Modal>

      <Modal isOpen={modal.detail} onClose={() => setModal({...modal, detail: false})} title="Detail Informasi Tag" size="md">
        {detailData && (
          <div className="space-y-6">
             <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl text-white flex gap-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#C1986E] opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
               <div className="relative shrink-0 bg-white p-2 rounded-xl shadow-lg">
                  <QRCodePlaceholder data={detailData.id} size={100} ecc={detailData.ecc} />
               </div>
               <div className="relative flex-1 flex flex-col justify-center">
                  <h3 className="text-2xl font-mono font-bold tracking-wide">{detailData.id}</h3>
                  <div className="mt-2 flex items-center gap-2">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${detailData.status === 'unused' ? 'bg-[#C1986E] text-white' : 'bg-gray-700 text-gray-300'}`}>
                       {detailData.status}
                     </span>
                     <span className="text-xs text-gray-400 font-medium">SKU: {getSKU(detailData.productId)}</span>
                  </div>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Produk</div>
                   <div className="font-bold text-gray-900 text-sm leading-snug">{detailData.productName}</div>
                   <div className="text-xs text-gray-500 mt-1">{detailData.brand}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Aktivitas</div>
                   <div className="flex items-center gap-2">
                      <Activity size={18} className="text-[#C1986E]" />
                      <span className="font-bold text-xl text-gray-900">{detailData.scanCount}</span>
                      <span className="text-xs text-gray-500">kali dipindai</span>
                   </div>
                </div>
             </div>
             <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                   <Settings size={16} className="text-gray-400" /> Spesifikasi Teknis
                </h4>
                <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                   <div>
                      <div className="text-[10px] text-gray-400 uppercase">PIN Security</div>
                      <div className="font-mono text-sm font-medium text-gray-700 mt-0.5">{detailData.pin || 'Non-aktif'}</div>
                   </div>
                   <div>
                      <div className="text-[10px] text-gray-400 uppercase">ECC Level</div>
                      <div className="font-mono text-sm font-medium text-gray-700 mt-0.5">{detailData.ecc}</div>
                   </div>
                   <div>
                      <div className="text-[10px] text-gray-400 uppercase">Dibuat Pada</div>
                      <div className="text-sm font-medium text-gray-700 mt-0.5">{new Date(detailData.createdAt).toLocaleDateString()}</div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={modal.delete} onClose={() => setModal({...modal, delete: false})} title="Hapus Data" size="sm">
         <div className="text-center p-4">
            <p>Yakin ingin menghapus <b>{selectedTags.length}</b> data?</p>
            <div className="flex gap-2 mt-4"><button onClick={() => setModal({...modal, delete: false})} className="flex-1 border py-2 rounded">Batal</button><button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-2 rounded">Hapus</button></div>
         </div>
      </Modal>
    </div>
  );
};

// ... (Layout & Export Default remain same)
export default function TagManagementProduction() {
  const [activeView, setActiveView] = useState('tags');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div className="h-screen bg-[#FDFBF7] font-sans text-gray-800 flex overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} isMinimized={isMinimized} />
      <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${isMinimized ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header isSidebarMinimized={isMinimized} setIsSidebarMinimized={setIsMinimized} setIsMobileOpen={setIsMobileOpen} user={user} onLogout={() => setUser(null)} />
        <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col gap-4">
          {activeView === 'tags' && <TagDashboard showToast={showToast} />}
          {activeView === 'products' && <ProductManager showToast={showToast} />}
          {activeView === 'brands' && <BrandManager showToast={showToast} />}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
