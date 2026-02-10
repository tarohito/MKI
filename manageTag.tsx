import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, Search, Filter, Plus, Printer, Eye, Ban, 
  CheckCircle, X, AlertCircle, QrCode, FileText, ChevronLeft, 
  ChevronRight, Trash2, Save, Settings, ShieldCheck, Loader2,
  Server, RefreshCw, Database, Activity, CheckSquare, Package, 
  Tag, Menu, Layers, User, ArrowRight, Edit, Copy, Lock, Unlock, Calendar, LogOut
} from 'lucide-react';

/**
 * --- LAYER 1: DATA SERVICE (LOCAL STORAGE) ---
 */

const STORAGE_KEYS = {
  TAGS: 'TagManager_Tags_v2',
  PRODUCTS: 'TagManager_Products_v2',
  BRANDS: 'TagManager_Brands_v2',
  USER: 'TagManager_User_v2'
};

// Data Awal (Seeding)
const SEED_BRANDS = [
  { id: 'BR-001', name: 'KopiKu', description: 'Premium Coffee Brand' },
  { id: 'BR-002', name: 'TehNusantara', description: 'Traditional Tea' },
  { id: 'BR-003', name: 'SnackMantap', description: 'Local Snacks' }
];

const SEED_PRODUCTS = [
  { id: 'PR-001', name: 'Kopi Arabika Premium 250g', brandId: 'BR-001', sku: 'KP-AR-250' },
  { id: 'PR-002', name: 'Teh Hijau Melati', brandId: 'BR-002', sku: 'TH-GR-BOX' },
  { id: 'PR-003', name: 'Keripik Singkong Balado', brandId: 'BR-003', sku: 'SN-KS-BAL' }
];

// Helper LocalStorage
const getLS = (key) => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setLS = (key, data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Inisialisasi Data jika kosong
const initStorage = () => {
  if (getLS(STORAGE_KEYS.BRANDS).length === 0) setLS(STORAGE_KEYS.BRANDS, SEED_BRANDS);
  if (getLS(STORAGE_KEYS.PRODUCTS).length === 0) setLS(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
};
initStorage();

/**
 * --- SERVICES ---
 */
const TagService = {
  // Hapus data > 24 jam
  cleanupExpired: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allTags = getLS(STORAGE_KEYS.TAGS);
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        const validTags = allTags.filter(tag => {
          const created = new Date(tag.createdAt).getTime();
          return (now - created) <= oneDayMs;
        });

        const deletedCount = allTags.length - validTags.length;
        if (deletedCount > 0) setLS(STORAGE_KEYS.TAGS, validTags);
        resolve(deletedCount);
      }, 500);
    });
  },

  getTags: async (page = 1, limit = 10, filters = {}) => {
    // Auto cleanup sebelum fetch
    const deletedCount = await TagService.cleanupExpired();
    
    const allTags = getLS(STORAGE_KEYS.TAGS);
    let results = [...allTags];

    // Filtering
    if (filters.search) {
      const lower = filters.search.toLowerCase();
      results = results.filter(t => t.id.toLowerCase().includes(lower));
    }
    if (filters.status && filters.status !== 'all') {
      results = results.filter(t => t.status === filters.status);
    }
    if (filters.productId && filters.productId !== 'all') {
      results = results.filter(t => String(t.productId) === String(filters.productId));
    }

    // Sorting (Newest First)
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = results.length;
    const start = (page - 1) * limit;
    const data = results.slice(start, start + limit);

    return { data, total, deletedCount };
  },

  getAllIds: async (filters = {}) => {
    const allTags = getLS(STORAGE_KEYS.TAGS);
    let results = [...allTags];
    if (filters.search) results = results.filter(t => t.id.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.status && filters.status !== 'all') results = results.filter(t => t.status === filters.status);
    if (filters.productId && filters.productId !== 'all') results = results.filter(t => String(t.productId) === String(filters.productId));
    return results.map(t => t.id);
  },

  getTagsByIds: async (ids) => {
    const allTags = getLS(STORAGE_KEYS.TAGS);
    return allTags.filter(t => ids.includes(t.id));
  },

  generateTags: async (newTags) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = getLS(STORAGE_KEYS.TAGS);
        setLS(STORAGE_KEYS.TAGS, [...current, ...newTags]);
        resolve(true);
      }, 800);
    });
  },

  updateStatus: async (id, status) => {
    const current = getLS(STORAGE_KEYS.TAGS);
    const index = current.findIndex(t => t.id === id);
    if (index !== -1) {
      current[index].status = status;
      setLS(STORAGE_KEYS.TAGS, current);
    }
  },

  deleteTags: async (ids) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let current = getLS(STORAGE_KEYS.TAGS);
        current = current.filter(t => !ids.includes(t.id));
        setLS(STORAGE_KEYS.TAGS, current);
        resolve(true);
      }, 500);
    });
  }
};

const ProductService = {
  getAll: () => getLS(STORAGE_KEYS.PRODUCTS),
  save: (product) => {
    let list = getLS(STORAGE_KEYS.PRODUCTS);
    const idx = list.findIndex(p => p.id === product.id);
    if (idx !== -1) list[idx] = product; else list.push(product);
    setLS(STORAGE_KEYS.PRODUCTS, list);
  },
  delete: (id) => {
    let list = getLS(STORAGE_KEYS.PRODUCTS);
    setLS(STORAGE_KEYS.PRODUCTS, list.filter(p => p.id !== id));
  }
};

const BrandService = {
  getAll: () => getLS(STORAGE_KEYS.BRANDS),
  save: (brand) => {
    let list = getLS(STORAGE_KEYS.BRANDS);
    const idx = list.findIndex(b => b.id === brand.id);
    if (idx !== -1) list[idx] = brand; else list.push(brand);
    setLS(STORAGE_KEYS.BRANDS, list);
  },
  delete: (id) => {
    let list = getLS(STORAGE_KEYS.BRANDS);
    setLS(STORAGE_KEYS.BRANDS, list.filter(b => b.id !== id));
  }
};

/**
 * --- UI COMPONENTS ---
 */

const Sidebar = ({ activeView, setActiveView, isMobileOpen, setIsMobileOpen, isMinimized }) => {
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

const Header = ({ isSidebarMinimized, setIsSidebarMinimized, setIsMobileOpen, user, onLogout }) => (
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

const StatusBadge = ({ status }) => {
  const styles = { unused: 'text-gray-600 bg-gray-100', used: 'text-emerald-600 bg-emerald-50', blocked: 'text-rose-600 bg-rose-50' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'unused' ? 'bg-gray-400' : status === 'used' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
      {status === 'unused' ? 'Ready' : status === 'used' ? 'Scanned' : 'Blocked'}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-7xl' };
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

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const styles = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';
  return <div className={`fixed bottom-6 right-6 ${styles} text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-[70] animate-in slide-in-from-bottom-5 duration-300`}><CheckCircle size={20} /><span className="font-medium text-sm">{message}</span></div>;
};

const QRCodePlaceholder = ({ data, size = 100, ecc = 'M' }) => {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}&color=000000&bgcolor=ffffff&ecc=${ecc}`;
  return <div className="bg-white p-1 rounded border border-gray-200 inline-block"><img src={src} alt="QR" width={size} height={size} loading="lazy" className="block" /></div>;
};

/**
 * --- PAGES / SUB-VIEWS ---
 */

const BrandManager = ({ showToast }) => {
  const [brands, setBrands] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', description: '' });

  useEffect(() => { setBrands(BrandService.getAll()); }, [modalOpen]);

  const handleSave = () => {
    if (!formData.name) return showToast('Nama wajib diisi', 'error');
    const payload = formData.id ? formData : { ...formData, id: `BR-${Date.now()}` };
    BrandService.save(payload);
    showToast('Brand disimpan', 'success');
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Hapus brand?')) { BrandService.delete(id); showToast('Terhapus', 'success'); setBrands(BrandService.getAll()); }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div><h2 className="text-2xl font-bold">Manajemen Brand</h2><p className="text-sm text-gray-500">Daftar merek produk yang tersedia.</p></div>
        <button onClick={() => { setFormData({id:'',name:'',description:''}); setModalOpen(true); }} className="px-4 py-2 bg-[#C1986E] text-white rounded-lg flex gap-2 font-medium"><Plus size={18}/> Tambah</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b sticky top-0"><tr><th className="p-4 text-xs font-bold text-gray-500 uppercase">Nama</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Deskripsi</th><th className="p-4 text-right">Aksi</th></tr></thead>
          <tbody>
            {brands.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-gray-400">Belum ada data</td></tr> :
            brands.map(b => (<tr key={b.id} className="hover:bg-gray-50"><td className="p-4 font-bold">{b.name}<br/><span className="text-xs text-gray-400 font-normal">{b.id}</span></td><td className="p-4 text-sm">{b.description}</td><td className="p-4 text-right"><button onClick={() => handleDelete(b.id)} className="text-red-500 p-2"><Trash2 size={16}/></button></td></tr>))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Form Brand" size="sm">
        <div className="space-y-4">
          <div><label className="text-sm font-bold text-gray-700">Nama Brand</label><input type="text" className="w-full p-2 border rounded mt-1" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="text-sm font-bold text-gray-700">Deskripsi</label><textarea className="w-full p-2 border rounded mt-1" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <button onClick={handleSave} className="w-full py-2 bg-[#C1986E] text-white rounded font-medium">Simpan</button>
        </div>
      </Modal>
    </div>
  );
};

const ProductManager = ({ showToast }) => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', brandId: '', sku: '' });

  useEffect(() => { setProducts(ProductService.getAll()); setBrands(BrandService.getAll()); }, [modalOpen]);

  const handleSave = () => {
    if (!formData.name || !formData.brandId) return showToast('Lengkapi data', 'error');
    const payload = formData.id ? formData : { ...formData, id: `PR-${Date.now()}` };
    ProductService.save(payload);
    showToast('Produk disimpan', 'success');
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Hapus produk?')) { ProductService.delete(id); showToast('Terhapus', 'success'); setProducts(ProductService.getAll()); }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Manajemen Produk</h2><button onClick={() => { setFormData({id:'',name:'',brandId:'',sku:''}); setModalOpen(true); }} className="px-4 py-2 bg-[#C1986E] text-white rounded-lg flex gap-2 font-medium"><Plus size={18}/> Tambah</button></div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b"><tr><th className="p-4 text-xs font-bold text-gray-500 uppercase">Produk</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Brand</th><th className="p-4 text-right">Aksi</th></tr></thead>
          <tbody>
            {products.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-gray-400">Belum ada data</td></tr> :
            products.map(p => (<tr key={p.id} className="hover:bg-gray-50"><td className="p-4 font-bold">{p.name}<br/><span className="text-xs text-gray-400 font-normal">SKU: {p.sku}</span></td><td className="p-4 text-sm">{brands.find(b=>b.id===p.brandId)?.name}</td><td className="p-4 text-right"><button onClick={() => handleDelete(p.id)} className="text-red-500 p-2"><Trash2 size={16}/></button></td></tr>))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Form Produk" size="md">
        <div className="space-y-4">
          <input type="text" placeholder="Nama Produk" className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="SKU (Opsional)" className="w-full p-2 border rounded" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
          <select className="w-full p-2 border rounded bg-white" value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})}><option value="">Pilih Brand</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
          <button onClick={handleSave} className="w-full py-2 bg-[#C1986E] text-white rounded">Simpan</button>
        </div>
      </Modal>
    </div>
  );
};

const TagDashboard = ({ showToast }) => {
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
    setTags(tagRes.data);
    setTotalRecords(tagRes.total);
    setProducts(prodRes);
    setBrands(brandRes);
    setLoading(false);
    if (tagRes.deletedCount > 0) showToast(`Otomatis membersihkan ${tagRes.deletedCount} tag lama`, 'success');
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
    
    const genPin = (len) => Array.from({length: len}, () => Math.floor(Math.random()*10)).join('');

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
    showToast('Tag berhasil dibuat', 'success');
    setModal({...modal, generate: false});
    setOpLoading(false);
    loadData();
  };

  const handlePrint = async () => {
    setOpLoading(true);
    // NEW LOGIC: Jika ada seleksi manual, cetak itu. Jika tidak, cetak SEMUA hasil filter.
    let dataToPrint = [];
    
    if (selectedTags.length > 0) {
      // Prioritas 1: Seleksi Manual (bisa lebih dari 10 jika pakai select all global)
      dataToPrint = await TagService.getTagsByIds(selectedTags);
    } else {
      // Prioritas 2: Cetak Semua hasil filter (Batch Print)
      // Ambil semua ID yang sesuai dengan filter pencarian/status/produk saat ini
      const allIds = await TagService.getAllIds({ search: searchTerm, status: filterStatus, productId: filterProduct });
      
      if (allIds.length === 0) {
        showToast('Tidak ada data yang bisa dicetak', 'error');
        setOpLoading(false);
        return;
      }
      
      // Safety check agar browser tidak crash jika terlalu banyak
      if (allIds.length > 2000) {
         if(!confirm(`Anda akan mencetak ${allIds.length} tag. Ini mungkin memakan waktu. Lanjutkan?`)) {
            setOpLoading(false);
            return;
         }
      }

      dataToPrint = await TagService.getTagsByIds(allIds);
      showToast(`Memuat ${dataToPrint.length} tag untuk dicetak...`, 'success');
    }

    setPrintData(dataToPrint);
    setModal({...modal, print: true});
    setOpLoading(false);
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

  const handleSelectAllGlobal = async () => {
    const ids = await TagService.getAllIds({ search: searchTerm, status: filterStatus, productId: filterProduct });
    setSelectedTags(ids);
    setIsSelectAllGlobal(true);
    showToast(`Terpilih ${ids.length} data`, 'success');
  };

  const calculatedPages = useMemo(() => {
    if (!printData.length) return { pages: [], cols: 0, rows: 0, itemsPerPage: 0 };
    const { paperWidth, paperHeight, stickerSizeMm, gapMm, marginMm } = printSettings;
    const contentW = paperWidth - (marginMm * 2);
    const contentH = paperHeight - (marginMm * 2);
    const cols = Math.floor((contentW + gapMm) / (stickerSizeMm + gapMm));
    const rows = Math.floor((contentH + gapMm) / (stickerSizeMm + gapMm));
    const itemsPerPage = cols * rows;
    if (itemsPerPage <= 0) return { pages: [], cols: 0, rows: 0, itemsPerPage: 0 };
    
    const pages = [];
    for (let i = 0; i < printData.length; i += itemsPerPage) pages.push(printData.slice(i, i + itemsPerPage));
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

  // Logic untuk disable tombol cetak
  // Tombol aktif jika: Ada data di tabel (totalRecords > 0)
  // Text tombol berubah tergantung ada seleksi atau tidak
  const isPrintDisabled = totalRecords === 0;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 shrink-0">
        <div><h2 className="text-2xl font-bold">Manajemen Tag</h2><p className="text-sm text-gray-500">Pantau dan kelola QR Code produksi.</p></div>
        <div className="flex gap-2">
           {selectedTags.length > 0 && <button onClick={() => setModal({...modal, delete: true})} className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg"><Trash2 size={16}/> Hapus ({selectedTags.length})</button>}
           
           <button 
             onClick={handlePrint} 
             disabled={isPrintDisabled} 
             className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors ${!isPrintDisabled ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
           >
             <Printer size={16}/> 
             {selectedTags.length > 0 ? `Cetak (${selectedTags.length})` : 'Cetak Semua'}
           </button>
           
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

      <Modal isOpen={modal.detail} onClose={() => setModal({...modal, detail: false})} title="Detail Tag" size="md">
        {detailData && (
          <div className="space-y-6">
             <div className="flex gap-4">
                <div className="p-3 bg-white border rounded-lg shadow-sm"><QRCodePlaceholder data={detailData.id} size={120} ecc={detailData.ecc}/></div>
                <div className="flex-1 space-y-2">
                   <div><label className="text-xs font-bold text-gray-400 uppercase">Tag ID</label><div className="font-mono text-xl font-bold">{detailData.id}</div></div>
                   <div><label className="text-xs font-bold text-gray-400 uppercase">Produk</label><div className="font-medium">{detailData.productName}</div></div>
                   <div className="flex gap-4">
                      <div><label className="text-xs font-bold text-gray-400 uppercase">Status</label><div className="mt-1"><StatusBadge status={detailData.status === 'blocked' ? 'blocked' : (detailData.scanCount > 0 ? 'used' : 'unused')} /></div></div>
                      <div><label className="text-xs font-bold text-gray-400 uppercase">Scans</label><div className="mt-1 font-bold text-xl flex items-center gap-1"><Activity size={16} className="text-[#C1986E]"/> {detailData.scanCount}</div></div>
                   </div>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                <div><label className="text-xs text-gray-400 uppercase">PIN</label><div className="font-mono font-bold">{detailData.pin || '-'}</div></div>
                <div><label className="text-xs text-gray-400 uppercase">ECC</label><div className="font-mono font-bold">{detailData.ecc}</div></div>
                <div><label className="text-xs text-gray-400 uppercase">Dibuat</label><div className="text-sm">{new Date(detailData.createdAt).toLocaleString()}</div></div>
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

// Login Page
const LoginPage = ({ onLogin }) => {
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

// Main App
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
