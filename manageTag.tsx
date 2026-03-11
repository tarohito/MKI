import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  Tag, 
  ScanLine, 
  Users, 
  Settings, 
  Plus, 
  Search,
  Menu,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Database,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  FileText,
  Layers,
  FlaskConical,
  Edit,
  X,
  ListTree,
  UploadCloud,
  QrCode,
  Printer,
  RefreshCw,
  FileArchive,
  Download,
  Calendar,
  Hash,
  ShieldCheck,
  Lock,
  Filter,
  ArrowRight,
  MoreHorizontal,
  Info,
  Map,
  MapPin,
  Activity,
  TrendingUp,
  Clock,
  Key,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LogOut
} from 'lucide-react';
import { createPortal } from 'react-dom';
// Import QRCode untuk generate QR berbasis Vektor (SVG)
import { QRCodeSVG } from 'qrcode.react';

// --- DATA INITIAL KATEGORI (Default) ---
const INITIAL_CATEGORY_DATA = [
  {
    id: 1,
    name: "SKINCARE",
    subCategories: [
      {
        id: 11,
        name: "Pembersih Wajah (Cleanser)",
        subSubCategories: [
          { id: 111, name: "Face Wash Gel" },
          { id: 112, name: "Cleansing Oil" },
          { id: 113, name: "Cleansing Gel" },
          { id: 114, name: "Micellar Water" }
        ]
      },
      {
        id: 12,
        name: "Toner & Face Mist",
        subSubCategories: [
          { id: 121, name: "Toner" },
          { id: 122, name: "Face Mist Spray" },
          { id: 123, name: "Beauty Water" }
        ]
      },
      {
        id: 13,
        name: "Pelembab & Krim",
        subSubCategories: [
          { id: 131, name: "Day Cream" },
          { id: 132, name: "Night Cream" },
          { id: 133, name: "Sunscreen" }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "BODYCARE",
    subCategories: [
      {
        id: 21,
        name: "Sabun Mandi (Body Wash)",
        subSubCategories: [
          { id: 211, name: "Shower Gel" },
          { id: 212, name: "Decorated Shower Gel" },
          { id: 213, name: "Scrub Shower Gel" }
        ]
      },
      {
        id: 22,
        name: "Perawatan Kulit Tubuh",
        subSubCategories: [
          { id: 221, name: "Body Lotion" },
          { id: 222, name: "Tone Up Body Lotion" },
          { id: 223, name: "Body Butter" }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "PARFUM",
    subCategories: [
      {
        id: 31,
        name: "Wewangian Semprot (Spray)",
        subSubCategories: [
          { id: 311, name: "Eau De Perfume (EDP)" },
          { id: 312, name: "Eau De Toilette (EDT)" },
          { id: 313, name: "Body Mist" },
          { id: 314, name: "Hair Perfume" }
        ]
      },
      {
        id: 32,
        name: "Wewangian Oles/Solid",
        subSubCategories: [
          { id: 321, name: "Roll On Perfume" },
          { id: 322, name: "Perfume Stick" }
        ]
      }
    ]
  }
];

// Komponen Card Sederhana untuk Dashboard
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

// Komponen Reusable untuk Alert Halaman
const PageAlert = ({ text }) => (
  <div className="flex gap-3 text-sm text-blue-700 bg-blue-50/80 p-4 rounded-xl border border-blue-200/60 items-start mb-2 shadow-sm">
    <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
    <p>{text}</p>
  </div>
);

// Komponen Reusable untuk Tooltip Custom (Dinamis & Anti Potong)
const Tooltip = ({ children, text, position = 'top', wrapperClass = "inline-flex items-center justify-center", style }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: -9999, left: -9999 });
  const [actualPos, setActualPos] = React.useState(position);
  const [arrowStyles, setArrowStyles] = React.useState({});
  
  const wrapperRef = React.useRef(null);
  const tooltipRef = React.useRef(null);

  React.useLayoutEffect(() => {
    if (isVisible && wrapperRef.current && tooltipRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top, left;
      let calcPos = position;

      const spaceTop = rect.top;
      const spaceBottom = window.innerHeight - rect.bottom;
      const spaceLeft = rect.left;
      const spaceRight = window.innerWidth - rect.right;

      if (position === 'top' && spaceTop < tooltipRect.height + 15 && spaceBottom > tooltipRect.height + 15) calcPos = 'bottom';
      if (position === 'bottom' && spaceBottom < tooltipRect.height + 15 && spaceTop > tooltipRect.height + 15) calcPos = 'top';
      if (position === 'left' && spaceLeft < tooltipRect.width + 15 && spaceRight > tooltipRect.width + 15) calcPos = 'right';
      if (position === 'right' && spaceRight < tooltipRect.width + 15 && spaceLeft > tooltipRect.width + 15) calcPos = 'left';

      setActualPos(calcPos);

      const GAP = 8; 

      switch (calcPos) {
        case 'top':
          top = rect.top - tooltipRect.height - GAP;
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = rect.bottom + GAP;
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
          left = rect.left - tooltipRect.width - GAP;
          break;
        case 'right':
          top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
          left = rect.right + GAP;
          break;
      }

      if (calcPos === 'top' || calcPos === 'bottom') {
         if (left < 10) left = 10;
         if (left + tooltipRect.width > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10;
         let arrowLeft = rect.left + (rect.width / 2) - left;
         arrowLeft = Math.max(10, Math.min(tooltipRect.width - 10, arrowLeft));
         setArrowStyles({ left: `${arrowLeft}px`, transform: 'translateX(-50%)' });
      } else {
         if (top < 10) top = 10;
         if (top + tooltipRect.height > window.innerHeight - 10) top = window.innerHeight - tooltipRect.height - 10;
         let arrowTop = rect.top + (rect.height / 2) - top;
         arrowTop = Math.max(10, Math.min(tooltipRect.height - 10, arrowTop));
         setArrowStyles({ top: `${arrowTop}px`, transform: 'translateY(-50%)' });
      }

      setCoords({ top, left });
    }
  }, [isVisible, position, text]);

  return (
    <div 
      ref={wrapperRef}
      className={`relative group ${wrapperClass}`} 
      style={style}
      onMouseEnter={() => text && setIsVisible(true)}
      onMouseLeave={() => {
        setIsVisible(false);
        setCoords({ top: -9999, left: -9999 }); 
      }}
    >
      {children}
      {isVisible && text && createPortal(
        <div 
          ref={tooltipRef}
          className="fixed whitespace-nowrap bg-slate-800 text-white text-[10px] px-2.5 py-1.5 rounded z-[99999] shadow-xl pointer-events-none transition-opacity duration-200 animate-in fade-in zoom-in-95"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
        >
          {text}
          <div 
            className={`absolute w-0 h-0 ${
              actualPos === 'top' ? 'top-full border-t-slate-800 border-x-transparent border-b-transparent border-[5px]' :
              actualPos === 'bottom' ? 'bottom-full border-b-slate-800 border-x-transparent border-t-transparent border-[5px]' :
              actualPos === 'left' ? 'left-full border-l-slate-800 border-y-transparent border-r-transparent border-[5px]' :
              'right-full border-r-slate-800 border-y-transparent border-l-transparent border-[5px]'
            }`}
            style={arrowStyles}
          ></div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Komponen Leaflet Map Kustom (Dimuat secara dinamis via CDN)
const LeafletMap = () => {
  const mapRef = React.useRef(null);
  const tileLayerRef = React.useRef(null);
  const [loaded, setLoaded] = React.useState(false);
  const [mapTheme, setMapTheme] = React.useState('voyager'); 

  React.useEffect(() => {
    if (window.L) {
      setLoaded(true);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  React.useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const map = window.L.map(mapRef.current, {
       center: [-2.5, 118],
       zoom: 5,
       scrollWheelZoom: false,
       zoomControl: true
    });

    tileLayerRef.current = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap & CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    const locationData = [
      { city: "Medan", coords: [3.5952, 98.6722], scans: 45, bg: "bg-blue-600" },
      { city: "Pekanbaru", coords: [0.5071, 101.4478], scans: 22, bg: "bg-red-600" },
      { city: "Palembang", coords: [-2.9909, 104.7566], scans: 38, bg: "bg-green-600" },
      { city: "Jakarta", coords: [-6.2088, 106.8456], scans: 120, bg: "bg-red-600", active: true },
      { city: "Semarang", coords: [-6.9667, 110.4167], scans: 56, bg: "bg-green-600" },
      { city: "Surabaya", coords: [-7.2504, 112.7688], scans: 85, bg: "bg-blue-600" },
      { city: "Denpasar", coords: [-8.6500, 115.2167], scans: 62, bg: "bg-blue-600" },
      { city: "Pontianak", coords: [-0.0227, 109.3333], scans: 30, bg: "bg-red-600" },
      { city: "Balikpapan", coords: [-1.2379, 116.8529], scans: 34, bg: "bg-green-600" },
      { city: "Makassar", coords: [-5.1476, 119.4327], scans: 55, bg: "bg-blue-600", active: true },
      { city: "Manado", coords: [1.4931, 124.8413], scans: 25, bg: "bg-blue-600" },
      { city: "Ambon", coords: [-3.6954, 128.1814], scans: 18, bg: "bg-red-600" },
      { city: "Jayapura", coords: [-2.5337, 140.7186], scans: 12, bg: "bg-green-600" },
    ];

    locationData.forEach(loc => {
       const customIcon = window.L.divIcon({
         className: 'custom-leaflet-marker',
         html: `
           <div class="relative w-4 h-4 flex items-center justify-center">
             ${loc.active ? `<span class="absolute inset-0 ${loc.bg} rounded-full animate-ping opacity-50 w-full h-full scale-150"></span>` : ''}
             <div class="w-4 h-4 ${loc.bg} rounded-full border-[2.5px] border-white shadow-md relative z-10"></div>
           </div>
         `,
         iconSize: [16, 16],
         iconAnchor: [8, 8]
       });

       const marker = window.L.marker(loc.coords, { icon: customIcon }).addTo(map);

       marker.bindTooltip(
         `<div class="font-sans text-xs">
            <span class="font-bold text-slate-800">${loc.city}</span><br/>
            <span class="text-slate-500">${loc.scans} Scans</span>
          </div>`, 
         { direction: 'top', offset: [0, -10], className: 'custom-leaflet-tooltip' }
       );
    });

    return () => { map.remove(); };
  }, [loaded]);

  React.useEffect(() => {
    if (tileLayerRef.current) {
      let newUrl = '';
      switch(mapTheme) {
        case 'positron': newUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'; break;
        case 'dark': newUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'; break;
        case 'osm': newUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; break;
        case 'voyager':
        default: newUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'; break;
      }
      tileLayerRef.current.setUrl(newUrl);
    }
  }, [mapTheme]);

  return (
    <div className="w-full h-full relative z-0">
      {!loaded && (
         <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
           <RefreshCw className="animate-spin mr-2" size={16} /> Memuat Peta Interaktif...
         </div>
      )}
      {loaded && (
        <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 p-1 flex items-center hover:bg-white transition-colors">
          <Map size={14} className="text-[#C1986E] ml-2" />
          <select value={mapTheme} onChange={(e) => setMapTheme(e.target.value)} className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none py-1.5 pl-2 pr-6">
            <option value="voyager">Laut Biru Cerah (Voyager)</option>
            <option value="osm">Laut Biru Klasik (OSM)</option>
            <option value="positron">Laut Abu-abu (Positron)</option>
            <option value="dark">Laut Hitam (Mode Gelap)</option>
          </select>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  // --- STATE ALERT & MODAL KONFIRMASI (GLOBAL) ---
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [confirmObj, setConfirmObj] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, isOpen: false })), 3000);
  };

  // --- STATE MODAL UTAMA ---
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null); 
  const [selectedBatchDetail, setSelectedBatchDetail] = useState(null); 

  // --- STATE PENCARIAN & SORTING ---
  const [globalSearch, setGlobalSearch] = useState('');
  const [brandSort, setBrandSort] = useState({ key: 'id', direction: 'desc' });
  const [productSort, setProductSort] = useState({ key: 'id', direction: 'desc' });
  const [userSort, setUserSort] = useState({ key: 'id', direction: 'desc' });

  // Helper untuk icon sorting di table header
  const SortIcon = ({ columnKey, sortConfig }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-[#C1986E]" /> : <ArrowDown size={14} className="text-[#C1986E]" />;
  };

  // Helper handler untuk klik header tabel
  const handleSortChange = (key, sortConfig, setSortConfig) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleLogout = () => {
    setConfirmObj({
      isOpen: true,
      title: "Keluar Sistem?",
      message: "Sesi Anda akan diakhiri dan harus login kembali untuk mengakses halaman ini. Lanjutkan?",
      onConfirm: () => {
        showToast("Berhasil logout dari sistem!");
        // Logika untuk redirect ke halaman login / hapus token ditempatkan di sini
      }
    });
  };

  // --- HELPER UNTUK JUDUL HALAMAN (HEADER) ---
  const getPageTitle = (tab) => {
    switch(tab) {
      case 'dashboard': return 'Dashboard';
      case 'scan_history': return 'Aktivitas Scan';
      case 'brand': return 'Brand';
      case 'categories': return 'Kategori Produk';
      case 'product': return 'SKU Produk';
      case 'tags': return 'Generate Tag/QR';
      case 'users': return 'Users & Roles';
      case 'settings': return 'Pengaturan';
      default: return 'Dashboard';
    }
  };

  // --- STATE DATA ---
  const [systemUsers, setSystemUsers] = useState([
    { id: 1, name: "Admin Utama", email: "admin@mki.co.id", role: "Super Admin", status: "Aktif" },
    { id: 2, name: "Bapak Owner", email: "owner@mki.co.id", role: "Brand Owner", status: "Aktif" },
    { id: 3, name: "Ibu Clara", email: "clara@glowco.id", role: "Brand Owner", status: "Aktif" },
    { id: 4, name: "Bapak Andi", email: "andi@mensgroom.id", role: "Brand Owner", status: "Aktif" }
  ]);

  const [brands, setBrands] = useState([
    { id: 1, code: "CL-1001", name: "Glow & Co", description: "Brand skincare remaja dengan konsep natural.", status: "Aktif", ownerId: 3 },
    { id: 2, code: "CL-1002", name: "DermaBeauty", description: "Klinik kecantikan fokus pada anti-aging.", status: "Aktif", ownerId: 2 },
    { id: 3, code: "CL-1003", name: "Luxe Scents", description: "Parfum premium untuk pasar ekspor.", status: "Aktif", ownerId: 2 },
    { id: 4, code: "CL-1004", name: "NutriLife", description: "Suplemen kesehatan dan vitamin harian.", status: "Aktif", ownerId: 3 },
    { id: 5, code: "CL-1005", name: "PureNaturals", description: "Produk perawatan tubuh berbahan dasar organik.", status: "Non-aktif", ownerId: 2 },
    { id: 6, code: "CL-1006", name: "Men's Groom", description: "Perawatan khusus pria moderen.", status: "Aktif", ownerId: 4 }
  ]);
  
  const [categories, setCategories] = useState(INITIAL_CATEGORY_DATA);

  const [products, setProducts] = useState([
    { 
      id: 101, name: "Luxury Rose EDP 30ml", brandId: 3, brandName: "Luxe Scents", 
      description: "Parfum wangi mawar mewah dengan botol kaca. Mengandung ekstrak mawar asli dengan ketahanan hingga 12 jam. Cocok untuk acara formal maupun daily use.", categoryPath: "PARFUM > Wewangian Semprot (Spray) > Eau De Perfume (EDP)",
      catL1: 3, catL2: 31, catL3: 311,
      skuCode: "LS-EDP-ROS-30"
    },
    { 
      id: 102, name: "Acne Fighter Night Cream", brandId: 2, brandName: "DermaBeauty", 
      description: "Krim malam untuk kulit berjerawat. Membantu meredakan kemerahan dan mengempeskan jerawat meradang dalam waktu singkat.", categoryPath: "SKINCARE > Pelembab & Krim > Night Cream",
      catL1: 1, catL2: 13, catL3: 132,
      skuCode: "DB-NC-ACN-15"
    },
    { 
      id: 103, name: "Gentle Facial Wash 100ml", brandId: 1, brandName: "Glow & Co", 
      description: "Pembersih wajah lembut tanpa busa untuk kulit sensitif.", categoryPath: "SKINCARE > Pembersih Wajah (Cleanser) > Face Wash Gel",
      catL1: 1, catL2: 11, catL3: 111,
      skuCode: "GC-FW-GNT-100"
    },
    { 
      id: 104, name: "Hydrating Toner Mist", brandId: 1, brandName: "Glow & Co", 
      description: "Toner spray penyegar wajah dengan aloe vera.", categoryPath: "SKINCARE > Toner & Face Mist > Face Mist Spray",
      catL1: 1, catL2: 12, catL3: 122,
      skuCode: "GC-TM-HYD-60"
    },
    { 
      id: 105, name: "Coffee Body Scrub", brandId: 5, brandName: "PureNaturals", 
      description: "Scrub mandi eksfoliasi aroma kopi.", categoryPath: "BODYCARE > Sabun Mandi (Body Wash) > Scrub Shower Gel",
      catL1: 2, catL2: 21, catL3: 213,
      skuCode: "PN-BS-COF-250"
    },
    { 
      id: 106, name: "Hair & Body Perfume Sport", brandId: 6, brandName: "Men's Groom", 
      description: "Parfum rambut dan badan untuk pria aktif.", categoryPath: "PARFUM > Wewangian Semprot (Spray) > Body Mist",
      catL1: 3, catL2: 31, catL3: 313,
      skuCode: "MG-BM-SPT-100"
    }
  ]);
  
  const [tags, setTags] = useState([
    { code: "MKI-101-ABCD1234", productId: 101, id: 1682000000001, productName: "Luxury Rose EDP 30ml", status: "Aktif", batchId: "BATCH-820001", pin: "123456", ecc: "M" },
    { code: "MKI-101-EFGH5678", productId: 101, id: 1682000000002, productName: "Luxury Rose EDP 30ml", status: "Aktif", batchId: "BATCH-820001", pin: "654321", ecc: "M" },
    { code: "MKI-101-WXYZ9012", productId: 101, id: 1682000000003, productName: "Luxury Rose EDP 30ml", status: "Sudah Scan", batchId: "BATCH-820001", pin: "112233", ecc: "M" },
    { code: "MKI-102-IJKL9012", productId: 102, id: 1682100000001, productName: "Acne Fighter Night Cream", status: "Aktif", batchId: "BATCH-821001", pin: null, ecc: "L" },
    { code: "MKI-102-MNOP3456", productId: 102, id: 1682100000002, productName: "Acne Fighter Night Cream", status: "Aktif", batchId: "BATCH-821001", pin: null, ecc: "L" },
    { code: "MKI-102-QRST7890", productId: 102, id: 1682100000003, productName: "Acne Fighter Night Cream", status: "Invalid", batchId: "BATCH-821001", pin: null, ecc: "L" }
  ]); 
  
  const [batches, setBatches] = useState([
    {
      id: "BATCH-821001", date: "05 Okt 2023, 14:30", productName: "Acne Fighter Night Cream", brandName: "DermaBeauty", qty: 500,
      firstCode: "MKI-102-IJKL9012", lastCode: "MKI-102-XYZW9999", status: "Generated", settings: { ecc: "L", idLength: "8 Karakter", pin: "Tidak" }
    },
    {
      id: "BATCH-820001", date: "01 Okt 2023, 09:15", productName: "Luxury Rose EDP 30ml", brandName: "Luxe Scents", qty: 1000,
      firstCode: "MKI-101-ABCD1234", lastCode: "MKI-101-ZZZZ8888", status: "Generated", settings: { ecc: "M", idLength: "8 Karakter", pin: "Ya (6 Digit)" }
    }
  ]); 
  
  // --- STATE FORM ---
  const [brandInput, setBrandInput] = useState({ name: '', description: '', ownerId: '' });
  const [editingBrandId, setEditingBrandId] = useState(null); 
  
  const [userInput, setUserInput] = useState({ name: '', email: '', role: 'Brand Owner', password: '' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ userId: null, userName: '', newPassword: '', confirmPassword: '' });

  const [tagConfig, setTagConfig] = useState({
    productId: '', quantity: 100, idLength: 8, usePin: true, pinLength: 6, errorCorrection: 'M'
  });
  const [isTagModalOpen, setIsTagModalOpen] = useState(false); 
  const [generatedQR, setGeneratedQR] = useState(null); 

  const [productInput, setProductInput] = useState({ 
    name: '', brandId: '', description: '', catL1: '', catL2: '', catL3: '', skuCode: ''
  });
  const [editingProductId, setEditingProductId] = useState(null); 

  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [hoveredL1, setHoveredL1] = useState(null);
  const [hoveredL2, setHoveredL2] = useState(null);

  const [selectedCatL1, setSelectedCatL1] = useState(null);
  const [selectedCatL2, setSelectedCatL2] = useState(null);
  const [newCatL1Name, setNewCatL1Name] = useState(''); 
  const [newCatL2Name, setNewCatL2Name] = useState(''); 
  const [newCatL3Name, setNewCatL3Name] = useState(''); 

  // --- LOGIC HANDLERS BRAND ---
  const handleToggleBrandStatus = (id) => {
    setBrands(brands.map(brand => {
      if (brand.id === id) {
        const newStatus = brand.status === "Aktif" ? "Non-aktif" : "Aktif";
        showToast(`Status brand diubah menjadi ${newStatus}`);
        return { ...brand, status: newStatus };
      }
      return brand;
    }));
  };

  const handleSaveBrand = (e) => {
    e.preventDefault();
    if (!brandInput.name) return;
    
    if (editingBrandId) {
      setBrands(brands.map(b => b.id === editingBrandId ? { 
        ...b, 
        name: brandInput.name, 
        description: brandInput.description || "-",
        ownerId: brandInput.ownerId ? Number(brandInput.ownerId) : null
      } : b));
      showToast("Data brand berhasil diperbarui!");
    } else {
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const newBrand = { 
        id: Date.now(), 
        code: `CL-${randomCode}`, 
        name: brandInput.name, 
        description: brandInput.description || "-", 
        status: "Aktif",
        ownerId: brandInput.ownerId ? Number(brandInput.ownerId) : null
      };
      setBrands([...brands, newBrand]);
      showToast("Brand baru berhasil ditambahkan!");
    }
    setBrandInput({ name: '', description: '', ownerId: '' });
    setEditingBrandId(null);
    setIsBrandModalOpen(false);
  };

  const handleEditBrand = (brand) => {
    setBrandInput({ 
      name: brand.name, 
      description: brand.description === "-" ? "" : brand.description,
      ownerId: brand.ownerId || ''
    });
    setEditingBrandId(brand.id);
    setIsBrandModalOpen(true);
  };

  const handleDeleteBrand = (id) => {
    setConfirmObj({
      isOpen: true,
      title: "Hapus Brand?",
      message: "Data brand ini akan dihapus permanen. Produk yang terkait mungkin akan kehilangan referensi. Lanjutkan?",
      onConfirm: () => {
        setBrands(brands.filter(b => b.id !== id));
        showToast("Brand berhasil dihapus!");
      }
    });
  };

  const handleCancelEditBrand = () => {
    setBrandInput({ name: '', description: '', ownerId: '' });
    setEditingBrandId(null);
    setIsBrandModalOpen(false);
  };

  // --- LOGIC HANDLERS PRODUCT ---
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productInput.name || !productInput.brandId || !productInput.catL3 || !productInput.skuCode) {
      showToast("Mohon lengkapi data wajib produk (Nama, Brand, Kategori, Kode SKU).", "error");
      return;
    }

    // --- CEK SKU KEMBAR (DUPLIKAT) ---
    const isDuplicateSKU = products.some(
      (p) => 
        p.skuCode.toUpperCase() === productInput.skuCode.toUpperCase() && 
        p.id !== editingProductId // Jangan cek produk itu sendiri jika sedang diedit
    );

    if (isDuplicateSKU) {
      showToast(`Kode SKU "${productInput.skuCode.toUpperCase()}" sudah digunakan oleh produk lain! Harap gunakan kode unik.`, "error");
      return; // Hentikan proses simpan
    }
    // ---------------------------------

    const brandName = brands.find(b => b.id == productInput.brandId)?.name;
    const cat1 = categories.find(c => c.id == productInput.catL1);
    const cat2 = cat1?.subCategories.find(c => c.id == productInput.catL2);
    const cat3 = cat2?.subSubCategories.find(c => c.id == productInput.catL3);
    const categoryPath = `${cat1?.name} > ${cat2?.name} > ${cat3?.name}`;

    if (editingProductId) {
      setProducts(products.map(p => p.id === editingProductId ? {
        ...p, 
        name: productInput.name, 
        brandId: Number(productInput.brandId), 
        brandName,
        description: productInput.description || '-', 
        categoryPath, 
        catL1: productInput.catL1, 
        catL2: productInput.catL2, 
        catL3: productInput.catL3,
        skuCode: productInput.skuCode.toUpperCase()
      } : p));
      showToast("SKU Produk berhasil diperbarui!");
    } else {
      const newProduct = { 
        ...productInput, 
        id: Date.now(), 
        brandId: Number(productInput.brandId), 
        brandName, 
        description: productInput.description || '-', 
        categoryPath: categoryPath,
        skuCode: productInput.skuCode.toUpperCase()
      };
      setProducts([...products, newProduct]);
      showToast("SKU Produk baru berhasil ditambahkan!");
    }
    setProductInput({ name: '', brandId: '', description: '', catL1: '', catL2: '', catL3: '', skuCode: '' });
    setEditingProductId(null);
    setIsProductModalOpen(false);
  };

  const handleEditProduct = (product) => {
    setProductInput({
      name: product.name, 
      brandId: product.brandId, 
      description: product.description === "-" ? "" : product.description,
      catL1: product.catL1, 
      catL2: product.catL2, 
      catL3: product.catL3,
      skuCode: product.skuCode || ''
    });
    setEditingProductId(product.id);
    setIsProductModalOpen(true);
  };

  const handleCancelEditProduct = () => {
    setProductInput({ name: '', brandId: '', description: '', catL1: '', catL2: '', catL3: '', skuCode: '' });
    setEditingProductId(null);
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id) => {
    setConfirmObj({
      isOpen: true,
      title: "Hapus SKU Produk?",
      message: "Data produk ini akan dihapus dari sistem secara permanen. Lanjutkan?",
      onConfirm: () => {
        setProducts(products.filter(p => p.id !== id));
        showToast("SKU Produk berhasil dihapus!");
      }
    });
  };

  // --- LOGIC HANDLERS USER ---
  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!userInput.name || !userInput.email) return;

    if (editingUserId) {
      setSystemUsers(systemUsers.map(u => u.id === editingUserId ? { ...u, name: userInput.name, email: userInput.email, role: userInput.role } : u));
      showToast("Data pengguna berhasil diperbarui!");
    } else {
      if (!userInput.password) {
        showToast("Sandi wajib diisi untuk pengguna baru!", "error");
        return;
      }
      const newUser = { id: Date.now(), name: userInput.name, email: userInput.email, role: userInput.role, status: "Aktif" };
      setSystemUsers([...systemUsers, newUser]);
      showToast("Akun pengguna baru berhasil dibuat!");
    }
    setUserInput({ name: '', email: '', role: 'Brand Owner', password: '' });
    setEditingUserId(null);
    setIsUserModalOpen(false);
  };

  const handleEditUser = (user) => {
    setUserInput({ name: user.name, email: user.email, role: user.role, password: '' });
    setEditingUserId(user.id);
    setIsUserModalOpen(true);
  };

  const handleCancelEditUser = () => {
    setUserInput({ name: '', email: '', role: 'Brand Owner', password: '' });
    setEditingUserId(null);
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (id) => {
    setConfirmObj({
      isOpen: true,
      title: "Hapus Akun Pengguna?",
      message: "Pengguna ini tidak akan bisa lagi login ke dalam sistem. Lanjutkan?",
      onConfirm: () => {
        setSystemUsers(systemUsers.filter(u => u.id !== id));
        showToast("Akun pengguna berhasil dihapus!");
      }
    });
  };

  const handleToggleUserStatus = (id) => {
    setSystemUsers(systemUsers.map(u => {
      if (u.id === id) {
        const newStatus = u.status === "Aktif" ? "Non-aktif" : "Aktif";
        showToast(`Akses pengguna berhasil di-${newStatus.toLowerCase()}`);
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleOpenPasswordModal = (user) => {
    setPasswordData({ userId: user.id, userName: user.name, newPassword: '', confirmPassword: '' });
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("Sandi tidak cocok! Silakan periksa kembali.", "error");
      return;
    }
    showToast(`Sandi untuk pengguna ${passwordData.userName} berhasil diperbarui!`);
    setIsPasswordModalOpen(false);
  };

  // --- LOGIC CATEGORY & TAGS ---
  const handleGenerateTags = (e) => {
    e.preventDefault();
    if (!tagConfig.productId) { showToast("Pilih produk terlebih dahulu!", "error"); return; }

    const qty = Number(tagConfig.quantity) || 1;
    const product = products.find(p => p.id == tagConfig.productId);
    const newBatchTags = [];
    const baseId = Date.now();
    const batchId = `BATCH-${baseId.toString().slice(-6)}`; 

    for (let i = 0; i < qty; i++) {
        const randomStr = Math.random().toString(36).substring(2, 2 + tagConfig.idLength).toUpperCase();
        const finalRandom = randomStr.padEnd(tagConfig.idLength, 'X');
        const finalCode = `MKI-${product.id}-${finalRandom}`;

        let pin = null;
        if (tagConfig.usePin) {
            pin = Math.floor(Math.random() * Math.pow(10, tagConfig.pinLength)).toString().padStart(tagConfig.pinLength, '0');
        }

        newBatchTags.push({
            code: finalCode, productId: tagConfig.productId, id: baseId + i,
            productName: product.name, status: 'Aktif', batchId: batchId, pin: pin, ecc: tagConfig.errorCorrection
        });
    }
    
    setTags([...newBatchTags, ...tags]); 

    const newBatchRecord = {
        id: batchId,
        date: new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':'), 
        productName: product.name, brandName: product.brandName, qty: qty,
        firstCode: newBatchTags[0].code, lastCode: newBatchTags[newBatchTags.length - 1].code, status: 'Generated',
        settings: { ecc: tagConfig.errorCorrection, idLength: `${tagConfig.idLength} Karakter`, pin: tagConfig.usePin ? `Ya (${tagConfig.pinLength} Digit)` : 'Tidak' }
    };

    setBatches([newBatchRecord, ...batches]);

    setGeneratedQR({ 
        code: newBatchTags[0].code, productName: product.name, count: qty, batchId: batchId,
        ecc: tagConfig.errorCorrection, idLength: tagConfig.idLength, usePin: tagConfig.usePin, pinLength: tagConfig.pinLength
    }); 

    setIsTagModalOpen(true);
  };

  const addCategory = (level) => {
    const newId = Date.now();
    if (level === 1) {
      if (!newCatL1Name) return;
      setCategories([...categories, { id: newId, name: newCatL1Name, subCategories: [] }]);
      setNewCatL1Name('');
    } else if (level === 2 && selectedCatL1) {
      if (!newCatL2Name) return;
      const updatedCats = categories.map(c1 => {
        if (c1.id === selectedCatL1) return { ...c1, subCategories: [...c1.subCategories, { id: newId, name: newCatL2Name, subSubCategories: [] }] };
        return c1;
      });
      setCategories(updatedCats);
      setNewCatL2Name('');
    } else if (level === 3 && selectedCatL1 && selectedCatL2) {
      if (!newCatL3Name) return;
      const updatedCats = categories.map(c1 => {
        if (c1.id === selectedCatL1) {
          const updatedSub = c1.subCategories.map(c2 => {
            if (c2.id === selectedCatL2) return { ...c2, subSubCategories: [...c2.subSubCategories, { id: newId, name: newCatL3Name }] };
            return c2;
          });
          return { ...c1, subCategories: updatedSub };
        }
        return c1;
      });
      setCategories(updatedCats);
      setNewCatL3Name('');
    }
    showToast("Kategori baru berhasil ditambahkan!");
  };

  const deleteCategory = (level, id) => {
    let title = "";
    let msg = "";
    if (level === 1) { title = "Hapus Kategori Utama?"; msg = "Semua sub-kategori di dalamnya akan ikut terhapus permanen."; }
    if (level === 2) { title = "Hapus Sub Kategori?"; msg = "Semua varian di dalamnya akan ikut terhapus permanen."; }
    if (level === 3) { title = "Hapus Varian?"; msg = "Varian kategori ini akan dihapus secara permanen."; }

    setConfirmObj({
      isOpen: true,
      title: title,
      message: msg,
      onConfirm: () => {
        if (level === 1) {
          setCategories(categories.filter(c => c.id !== id));
          if (selectedCatL1 === id) { setSelectedCatL1(null); setSelectedCatL2(null); }
        } else if (level === 2) {
          const updatedCats = categories.map(c1 => {
            if (c1.id === selectedCatL1) return { ...c1, subCategories: c1.subCategories.filter(c2 => c2.id !== id) };
            return c1;
          });
          setCategories(updatedCats);
          if (selectedCatL2 === id) setSelectedCatL2(null);
        } else if (level === 3) {
          const updatedCats = categories.map(c1 => {
            if (c1.id === selectedCatL1) {
              const updatedSub = c1.subCategories.map(c2 => {
                if (c2.id === selectedCatL2) return { ...c2, subSubCategories: c2.subSubCategories.filter(c3 => c3.id !== id) };
                return c2;
              });
              return { ...c1, subCategories: updatedSub };
            }
            return c1;
          });
          setCategories(updatedCats);
        }
        showToast("Kategori berhasil dihapus!");
      }
    });
  };

  const getSelectedCategoryPath = () => {
    if (!productInput.catL1) return "";
    const cat1 = categories.find(c => c.id == productInput.catL1);
    const cat2 = cat1?.subCategories.find(c => c.id == productInput.catL2);
    const cat3 = cat2?.subSubCategories.find(c => c.id == productInput.catL3);
    
    let path = cat1?.name || "";
    if (cat2) path += ` > ${cat2.name}`;
    if (cat3) path += ` > ${cat3.name}`;
    return path;
  };

  // --- UI COMPONENTS ---

  const DashboardView = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageAlert text="Selamat datang di Dashboard Admin. Pantau ringkasan operasional, total master data, dan statistik aktivitas scan tag di sini." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Brand" value={brands.length} icon={Building2} color="bg-[#C1986E]" />
          <StatCard title="Total SKU Produk" value={products.length} icon={Package} color="bg-emerald-500" />
          <StatCard title="Tag QR Aktif" value={tags.length} icon={Tag} color="bg-purple-500" />
          <StatCard title="Scan Validasi" value="1.248" icon={ScanLine} color="bg-blue-500" />
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Activity size={18} className="text-[#C1986E]" /> Grafik Aktivitas Scan
                </h3>
                <p className="text-xs text-slate-500 mt-1">7 Hari Terakhir</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium border border-emerald-100">
                <TrendingUp size={16} /> +12.5%
              </div>
            </div>
            
            <div className="flex-1 flex flex-col mt-6">
              <div className="relative h-48 w-full flex">
                <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 font-medium pointer-events-none z-0">
                  <div className="flex items-center gap-3 w-full"><span className="w-8 text-right">1.200</span><div className="flex-1 border-t border-slate-100 border-dashed"></div></div>
                  <div className="flex items-center gap-3 w-full"><span className="w-8 text-right">900</span><div className="flex-1 border-t border-slate-100 border-dashed"></div></div>
                  <div className="flex items-center gap-3 w-full"><span className="w-8 text-right">600</span><div className="flex-1 border-t border-slate-100 border-dashed"></div></div>
                  <div className="flex items-center gap-3 w-full"><span className="w-8 text-right">300</span><div className="flex-1 border-t border-slate-100 border-dashed"></div></div>
                  <div className="flex items-center gap-3 w-full"><span className="w-8 text-right">0</span><div className="flex-1 border-t border-slate-200"></div></div>
                </div>
                
                <div className="flex-1 flex items-end gap-3 sm:gap-6 pl-12 z-10 pb-[1px]">
                  {[
                    { day: 'Sen', val: 40, label: '480' },
                    { day: 'Sel', val: 65, label: '780' },
                    { day: 'Rab', val: 45, label: '540' },
                    { day: 'Kam', val: 80, label: '960' },
                    { day: 'Jum', val: 55, label: '660' },
                    { day: 'Sab', val: 95, label: '1.140' },
                    { day: 'Min', val: 30, label: '360' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 h-full flex flex-col justify-end group cursor-pointer relative">
                      <Tooltip text={`${item.label} Scans`} position="top" wrapperClass="w-full h-full flex items-end justify-center">
                        <div className="absolute inset-0 w-full h-full bg-slate-50/30 rounded-t-sm transition-colors group-hover:bg-slate-100/50 pointer-events-none"></div>
                        <div 
                          className="w-full bg-gradient-to-t from-[#C1986E] to-[#e6bd95] rounded-t-sm transition-opacity duration-300 group-hover:opacity-80 animate-bar"
                          style={{ height: `${item.val}%`, animationDelay: `${idx * 100}ms` }}
                        ></div>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-6 pl-12 mt-3">
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => (
                  <div key={idx} className="flex-1 text-center text-[10px] sm:text-xs font-medium text-slate-500">{day}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col mt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <MapPin size={18} className="text-[#C1986E]" /> Sistem Pelacakan Distribusi
              </h3>
              <Tooltip text="Live Data" position="left">
                 <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse cursor-help"></div>
              </Tooltip>
            </div>
            <div className="w-full h-[350px] md:h-[500px] rounded-xl overflow-hidden border border-slate-200 z-0 shadow-inner">
               <LeafletMap />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BrandManager = () => {
    const filteredBrands = brands.filter(b => 
      b.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
      (b.code && b.code.toLowerCase().includes(globalSearch.toLowerCase())) ||
      (b.description && b.description.toLowerCase().includes(globalSearch.toLowerCase()))
    ).sort((a, b) => {
      const dir = brandSort.direction === 'asc' ? 1 : -1;
      if (brandSort.key === 'name') return a.name.localeCompare(b.name) * dir;
      if (brandSort.key === 'status') {
        if (a.status === b.status) return 0;
        return (a.status === 'Aktif' ? -1 : 1) * dir;
      }
      if (brandSort.key === 'sku') {
        const countA = products.filter(p => Number(p.brandId) === a.id).length;
        const countB = products.filter(p => Number(p.brandId) === b.id).length;
        return (countA - countB) * dir;
      }
      if (brandSort.key === 'owner') {
        const ownerA = systemUsers.find(u => u.id === a.ownerId)?.name || '';
        const ownerB = systemUsers.find(u => u.id === b.ownerId)?.name || '';
        return ownerA.localeCompare(ownerB) * dir;
      }
      return (a.id - b.id) * dir; 
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageAlert text="Halaman ini digunakan untuk mengelola data master Brand. Klik pada judul kolom di tabel untuk mengurutkan data." />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Total: {filteredBrands.length} Brand Terdaftar</span>
          </div>
          <button 
            onClick={() => {
              setEditingBrandId(null);
              setBrandInput({ name: '', description: '', ownerId: '' });
              setIsBrandModalOpen(true);
            }}
            className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Tambah Brand Baru
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('name', brandSort, setBrandSort)}>
                  <div className="flex items-center gap-2">Info Brand <SortIcon columnKey="name" sortConfig={brandSort} /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('owner', brandSort, setBrandSort)}>
                  <div className="flex items-center gap-2">Pemilik (Brand Owner) <SortIcon columnKey="owner" sortConfig={brandSort} /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('sku', brandSort, setBrandSort)}>
                  <div className="flex items-center gap-2">Jml SKU <SortIcon columnKey="sku" sortConfig={brandSort} /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('status', brandSort, setBrandSort)}>
                  <div className="flex items-center gap-2">Status <SortIcon columnKey="status" sortConfig={brandSort} /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBrands.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-400 text-sm">Tidak ada brand yang sesuai dengan pencarian.</td></tr>
              ) : (
                filteredBrands.map((brand) => {
                  const productCount = products.filter(p => Number(p.brandId) === brand.id).length;
                  const owner = systemUsers.find(u => u.id === brand.ownerId);
                  
                  return (
                    <tr key={brand.id} className={`transition-colors ${brand.status === 'Aktif' ? 'hover:bg-slate-50' : 'bg-slate-50/50 grayscale-[20%]'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                             <ImageIcon size={18} />
                          </div>
                          <div>
                            <p className={`font-medium text-sm ${brand.status === 'Aktif' ? 'text-slate-800' : 'text-slate-500'}`}>{brand.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                              {brand.code || `ID-${brand.id}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {owner ? (
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                               {owner.name.charAt(0)}
                             </div>
                             <span>{owner.name}</span>
                           </div>
                        ) : (
                           <span className="text-slate-400 italic">Belum ditetapkan</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium">
                          {productCount} Produk
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {brand.status === "Aktif" ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle2 size={12} /> Aktif
                          </span>
                        ) : (
                          <span className="bg-slate-200 text-slate-500 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                            <X size={12} /> Non-aktif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Tooltip text={brand.status === "Aktif" ? "Nonaktifkan Brand" : "Aktifkan Brand"} position="top">
                            <button 
                              onClick={() => handleToggleBrandStatus(brand.id)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all active:scale-95 focus:outline-none mx-1 ${brand.status === 'Aktif' ? 'bg-[#C1986E]' : 'bg-slate-300'}`}
                            >
                              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${brand.status === 'Aktif' ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                          </Tooltip>
                          <Tooltip text="Edit Brand" position="top">
                            <button 
                              onClick={() => handleEditBrand(brand)}
                              className="text-slate-400 hover:text-[#C1986E] hover:bg-[#C1986E]/10 transition-all p-1.5 rounded-lg active:scale-95"
                            >
                              <Edit size={16} />
                            </button>
                          </Tooltip>
                          <Tooltip text="Hapus Brand" position="top">
                            <button 
                              onClick={() => handleDeleteBrand(brand.id)}
                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95"
                            >
                              <Trash2 size={16} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Tambah/Edit Brand */}
        {isBrandModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                  {editingBrandId ? <Edit size={18} className="text-[#C1986E]" /> : <Building2 size={18} className="text-[#C1986E]" />}
                  {editingBrandId ? "Edit Data Brand" : "Registrasi Brand Baru"}
                </h3>
                <button onClick={handleCancelEditBrand} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all p-1.5 rounded-lg active:scale-95"><X size={18} /></button>
              </div>
              
              <form onSubmit={handleSaveBrand} className="flex flex-col overflow-hidden">
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    
                    {/* Area Upload Logo (Rasio 1:1) */}
                    <div className="w-full sm:w-40 aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-[#C1986E] transition-all group bg-slate-50/50 p-4 flex-shrink-0">
                      <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud size={20} className="group-hover:text-[#C1986E]" />
                      </div>
                      <span className="text-[11px] font-medium text-center px-2">Logo Brand</span>
                      <span className="text-[9px] text-slate-300 mt-1">(1:1 Ratio)</span>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Brand</label>
                        <input 
                          type="text" 
                          placeholder="Contoh: BeautyCare ID" 
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] transition-shadow text-sm"
                          value={brandInput.name}
                          onChange={(e) => setBrandInput({...brandInput, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pemilik Brand (Brand Owner)</label>
                         <select 
                           className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm"
                           value={brandInput.ownerId}
                           onChange={(e) => setBrandInput({...brandInput, ownerId: e.target.value})}
                         >
                           <option value="">-- Pilih Pemilik (Opsional) --</option>
                           {systemUsers.filter(u => u.role === "Brand Owner").map(user => (
                             <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                           ))}
                         </select>
                         <p className="text-[10px] text-slate-400">Pilih pengguna yang akan memiliki akses ke data analitik brand ini.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Deskripsi / Catatan</label>
                    <textarea 
                      rows="3"
                      placeholder="Deskripsi singkat brand atau catatan khusus..." 
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] transition-shadow resize-none text-sm"
                      value={brandInput.description}
                      onChange={(e) => setBrandInput({...brandInput, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end gap-3">
                  <button type="button" onClick={handleCancelEditBrand} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm">Batal</button>
                  <button type="submit" className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-sm active:scale-95 text-sm">{editingBrandId ? "Simpan Perubahan" : "Simpan Brand"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CategoryManager = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageAlert text="Anda dapat menambah, menghapus, atau mengubah struktur kategori produk. Perubahan di sini akan mempengaruhi formulir input produk secara real-time." />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden h-[350px] lg:h-full">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">1. Kategori Utama</h3>
            </div>
            <div className="p-3 border-b border-slate-100">
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   placeholder="Tambah Baru..." 
                   className="flex-1 text-sm border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1986E] focus:border-[#C1986E]"
                   value={newCatL1Name}
                   onChange={(e) => setNewCatL1Name(e.target.value)}
                   onKeyDown={(e) => {
                     if(e.key === 'Enter') addCategory(1);
                   }}
                 />
                 <button 
                   onClick={() => addCategory(1)}
                   className="bg-[#C1986E] text-white p-1.5 rounded-lg hover:bg-[#A37E58] transition-all active:scale-95"
                 >
                   <Plus size={18} />
                 </button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {categories.map(c1 => (
                <div 
                  key={c1.id}
                  onClick={() => { 
                    if(selectedCatL1 === c1.id) {
                      setSelectedCatL1(null); 
                      setSelectedCatL2(null);
                    } else {
                      setSelectedCatL1(c1.id); 
                      setSelectedCatL2(null);
                    }
                  }}
                  className={`flex justify-between items-center p-3 rounded-lg cursor-pointer text-sm transition-all ${selectedCatL1 === c1.id ? 'bg-[#C1986E]/10 text-[#C1986E] font-semibold border border-[#C1986E]/20' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                >
                  <span>{c1.name}</span>
                  <div className="flex items-center gap-2">
                     <span className={`text-[10px] ${selectedCatL1 === c1.id ? 'text-[#C1986E]' : 'text-slate-400'}`}>({c1.subCategories.length})</span>
                     {selectedCatL1 === c1.id && (
                       <Tooltip text="Hapus Kategori Utama" position="left">
                         <button onClick={(e) => { e.stopPropagation(); deleteCategory(1, c1.id); }} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                           <Trash2 size={14} />
                         </button>
                       </Tooltip>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 h-[350px] lg:h-full ${selectedCatL1 ? 'opacity-100 translate-x-0' : 'opacity-50 pointer-events-none'}`}>
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-slate-700">2. Sub Kategori</h3>
            </div>
            <div className="p-3 border-b border-slate-100">
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   placeholder={selectedCatL1 ? "Tambah Sub..." : "Pilih Utama dulu"}
                   className="flex-1 text-sm border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1986E] focus:border-[#C1986E] disabled:bg-slate-50 disabled:cursor-not-allowed"
                   value={newCatL2Name}
                   onChange={(e) => setNewCatL2Name(e.target.value)}
                   onKeyDown={(e) => {
                    if(e.key === 'Enter' && selectedCatL1) addCategory(2);
                  }}
                  disabled={!selectedCatL1}
                 />
                 <button 
                   onClick={() => addCategory(2)}
                   className="bg-[#C1986E] text-white p-1.5 rounded-lg hover:bg-[#A37E58] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                   disabled={!selectedCatL1}
                 >
                   <Plus size={18} />
                 </button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {selectedCatL1 && categories.find(c => c.id === selectedCatL1)?.subCategories.map(c2 => (
                <div 
                  key={c2.id}
                  onClick={() => {
                     if(selectedCatL2 === c2.id) setSelectedCatL2(null);
                     else setSelectedCatL2(c2.id);
                  }}
                  className={`flex justify-between items-center p-3 rounded-lg cursor-pointer text-sm transition-all ${selectedCatL2 === c2.id ? 'bg-[#C1986E]/10 text-[#C1986E] font-semibold border border-[#C1986E]/20' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
                >
                  <span>{c2.name}</span>
                  <div className="flex items-center gap-2">
                     <span className={`text-[10px] ${selectedCatL2 === c2.id ? 'text-[#C1986E]' : 'text-slate-400'}`}>({c2.subSubCategories.length})</span>
                     {selectedCatL2 === c2.id && (
                       <Tooltip text="Hapus Sub Kategori" position="left">
                         <button onClick={(e) => { e.stopPropagation(); deleteCategory(2, c2.id); }} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                           <Trash2 size={14} />
                         </button>
                       </Tooltip>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 h-[350px] lg:h-full ${selectedCatL2 ? 'opacity-100 translate-x-0' : 'opacity-50 pointer-events-none'}`}>
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-slate-700">3. Varian / Jenis</h3>
            </div>
            <div className="p-3 border-b border-slate-100">
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   placeholder={selectedCatL2 ? "Tambah Varian..." : "Pilih Sub dulu"}
                   className="flex-1 text-sm border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1986E] focus:border-[#C1986E] disabled:bg-slate-50 disabled:cursor-not-allowed"
                   value={newCatL3Name}
                   onChange={(e) => setNewCatL3Name(e.target.value)}
                   onKeyDown={(e) => {
                    if(e.key === 'Enter' && selectedCatL1 && selectedCatL2) addCategory(3);
                  }}
                  disabled={!selectedCatL2}
                 />
                 <button 
                   onClick={() => addCategory(3)}
                   className="bg-[#C1986E] text-white p-1.5 rounded-lg hover:bg-[#A37E58] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                   disabled={!selectedCatL2}
                 >
                   <Plus size={18} />
                 </button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {selectedCatL1 && selectedCatL2 && 
                categories.find(c => c.id === selectedCatL1)?.subCategories.find(s => s.id === selectedCatL2)?.subSubCategories.map(c3 => (
                <div 
                  key={c3.id}
                  className="flex justify-between items-center p-3 rounded-lg text-sm bg-white border border-slate-100 text-slate-700 hover:border-[#C1986E]/30 transition-colors"
                >
                  <span>{c3.name}</span>
                  <Tooltip text="Hapus Varian SKU" position="left">
                    <button onClick={() => deleteCategory(3, c3.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                      <Trash2 size={14} />
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const ProductManager = () => {
    if (brands.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-in fade-in duration-500">
          <AlertCircle size={48} className="text-yellow-600" />
          <h2 className="text-xl font-bold text-slate-800">Brand Belum Tersedia</h2>
          <button onClick={() => setActiveTab('brand')} className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm">Pergi ke Menu Brand</button>
        </div>
      );
    }

    const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      p.brandName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      p.categoryPath.toLowerCase().includes(globalSearch.toLowerCase())
    ).sort((a, b) => {
      const dir = productSort.direction === 'asc' ? 1 : -1;
      if (productSort.key === 'name') return a.name.localeCompare(b.name) * dir;
      if (productSort.key === 'category') return a.categoryPath.localeCompare(b.categoryPath) * dir;
      return (a.id - b.id) * dir;
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageAlert text="Kelola Master Data SKU Produk di sini. Klik pada judul kolom di tabel untuk mengurutkan data." />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Total: {filteredProducts.length} Produk SKU</span>
          </div>
          <button 
            onClick={() => {
              setEditingProductId(null);
              setProductInput({ name: '', brandId: '', description: '', catL1: '', catL2: '', catL3: '', skuCode: '' });
              setIsProductModalOpen(true);
            }}
            className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus size={16} /> Tambah SKU Baru
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('name', productSort, setProductSort)}>
                  <div className="flex items-center gap-2">Produk Info <SortIcon columnKey="name" sortConfig={productSort} /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('sku', productSort, setProductSort)}>
                  <div className="flex items-center gap-2">Kode SKU <SortIcon columnKey="sku" sortConfig={productSort} /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('category', productSort, setProductSort)}>
                  <div className="flex items-center gap-2">Kategori <SortIcon columnKey="category" sortConfig={productSort} /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Tag Dibuat</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-400 text-sm">Tidak ada produk yang sesuai dengan pencarian.</td></tr>
              ) : (
                filteredProducts.map((product) => {
                  // Perbaikan: Hitung jumlah tag berdasarkan total 'qty' di array batches
                  const tagCount = batches
                    .filter(b => b.productName === product.name)
                    .reduce((total, b) => total + b.qty, 0);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0">
                            <Package size={18} />
                          </div>
                          <div className="flex flex-col max-w-[200px]">
                            <span className="font-medium text-slate-800 text-sm truncate" title={product.name}>{product.name}</span>
                            <span className="text-xs text-[#C1986E] font-medium flex items-center gap-1 mt-0.5 truncate"><Building2 size={12}/> {product.brandName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                          {product.skuCode || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 max-w-[220px] whitespace-normal" title={product.categoryPath}>
                          {product.categoryPath.split(' > ').map((p, i, arr) => (
                            <span key={i} className="inline-block">
                              {p} {i < arr.length - 1 && <span className="text-slate-300 mx-1">/</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                          {new Intl.NumberFormat('id-ID').format(tagCount)} Tag
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Tooltip text="Lihat Detail Produk" position="top">
                            <button onClick={() => setSelectedProductDetail(product)} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all p-1.5 rounded-lg active:scale-95">
                              <Eye size={16} />
                            </button>
                          </Tooltip>
                          <Tooltip text="Edit Produk" position="top">
                            <button onClick={() => handleEditProduct(product)} className="text-slate-400 hover:text-[#C1986E] hover:bg-[#C1986E]/10 transition-all p-1.5 rounded-lg active:scale-95">
                              <Edit size={16} />
                            </button>
                          </Tooltip>
                          <Tooltip text="Hapus Data Produk" position="top">
                            <button onClick={() => handleDeleteProduct(product.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                              <Trash2 size={16} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Tambah/Edit Produk */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                  {editingProductId ? <Edit size={18} className="text-[#C1986E]" /> : <Package size={18} className="text-[#C1986E]" />}
                  {editingProductId ? "Edit Data SKU Produk" : "Tambah SKU Produk Baru"}
                </h3>
                <button onClick={handleCancelEditProduct} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all p-1.5 rounded-lg active:scale-95"><X size={18} /></button>
              </div>
              
              <form onSubmit={handleSaveProduct} className="flex flex-col overflow-hidden">
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    
                    {/* Area Upload Foto */}
                    <div className="w-full sm:w-40 aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-[#C1986E] transition-all group bg-slate-50/50 p-4 flex-shrink-0">
                      <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud size={20} className="group-hover:text-[#C1986E]" />
                      </div>
                      <span className="text-[11px] font-medium text-center px-2">Foto Produk</span>
                      <span className="text-[9px] text-slate-300 mt-1">(Max 2MB)</span>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Produk <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          placeholder="Cth: Sabun Cuci Muka Glowing 100ml" 
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] transition-shadow text-sm"
                          value={productInput.name}
                          onChange={(e) => setProductInput({...productInput, name: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Brand Utama <span className="text-red-500">*</span></label>
                        <select 
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm"
                          value={productInput.brandId || ''}
                          onChange={(e) => setProductInput({...productInput, brandId: e.target.value})}
                          required
                        >
                          <option value="" disabled>-- Pilih Brand --</option>
                          {brands.filter(b => b.status === "Aktif").map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                          <span>Kode SKU <span className="text-red-500">*</span></span>
                          <Tooltip text="Stock Keeping Unit (Kode Unik Produk)"><Info size={12} className="text-slate-400 cursor-help" /></Tooltip>
                        </label>
                        <input 
                          type="text" 
                          placeholder="Cth: GLW-FW-100" 
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] transition-shadow text-sm font-mono uppercase"
                          value={productInput.skuCode || ''}
                          onChange={(e) => setProductInput({...productInput, skuCode: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Kategori Etalase (Cascading) <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Level 1: Kategori Utama */}
                      <select 
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm"
                        value={productInput.catL1 || ''}
                        onChange={(e) => setProductInput({...productInput, catL1: e.target.value, catL2: '', catL3: ''})}
                        required
                      >
                        <option value="" disabled>1. Utama...</option>
                        {categories.map(c1 => <option key={c1.id} value={c1.id}>{c1.name}</option>)}
                      </select>

                      {/* Level 2: Sub Kategori */}
                      <select 
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm disabled:bg-slate-100 disabled:text-slate-400"
                        value={productInput.catL2 || ''}
                        onChange={(e) => setProductInput({...productInput, catL2: e.target.value, catL3: ''})}
                        disabled={!productInput.catL1}
                        required
                      >
                        <option value="" disabled>2. Sub Kategori...</option>
                        {productInput.catL1 && categories.find(c => c.id == productInput.catL1)?.subCategories.map(c2 => (
                          <option key={c2.id} value={c2.id}>{c2.name}</option>
                        ))}
                      </select>

                      {/* Level 3: Varian */}
                      <select 
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm disabled:bg-slate-100 disabled:text-slate-400"
                        value={productInput.catL3 || ''}
                        onChange={(e) => setProductInput({...productInput, catL3: e.target.value})}
                        disabled={!productInput.catL2}
                        required
                      >
                        <option value="" disabled>3. Varian / Jenis...</option>
                        {productInput.catL2 && categories.find(c => c.id == productInput.catL1)?.subCategories.find(s => s.id == productInput.catL2)?.subSubCategories.map(c3 => (
                          <option key={c3.id} value={c3.id}>{c3.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                      <span>Deskripsi Produk</span>
                      <span className="text-[10px] text-slate-400 font-normal normal-case">Opsional</span>
                    </label>
                    <textarea 
                      rows="3"
                      placeholder="Tuliskan keterangan detail, manfaat, atau cara penggunaan produk..." 
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] transition-shadow resize-none text-sm"
                      value={productInput.description}
                      onChange={(e) => setProductInput({...productInput, description: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end gap-3 z-0">
                  <button type="button" onClick={handleCancelEditProduct} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm">Batal</button>
                  <button type="submit" className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-sm active:scale-95 text-sm flex items-center gap-2">
                    {editingProductId ? "Simpan Perubahan" : "Simpan Data Produk"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Detail Produk */}
        {selectedProductDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center z-10 sticky top-0">
                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                  <Eye size={18} className="text-[#C1986E]" /> Detail Informasi Produk
                </h3>
                <button onClick={() => setSelectedProductDetail(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all p-1.5 rounded-lg active:scale-95"><X size={18} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-8">
                  
                  {/* Kolom Kiri: Visual & Statistik Utama */}
                  <div className="w-full md:w-1/3 flex flex-col gap-4 shrink-0">
                    <div className="w-full aspect-square bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 shadow-inner">
                      <ImageIcon size={48} className="mb-3 text-slate-300" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview Foto</span>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                      <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1.5">Total Tag QR Dibuat</p>
                      <p className="text-3xl font-extrabold text-blue-700 leading-none">
                        {new Intl.NumberFormat('id-ID').format(
                          batches
                            .filter(b => b.productName === selectedProductDetail.name)
                            .reduce((total, b) => total + b.qty, 0)
                        )}
                      </p>
                      <p className="text-xs font-medium text-blue-600 mt-1">Tag Keamanan</p>
                    </div>
                  </div>

                  {/* Kolom Kanan: Detail Data SKU */}
                  <div className="w-full md:w-2/3 flex flex-col">
                    <div className="pb-5 border-b border-slate-100 mb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200 uppercase tracking-widest">
                          SKU: {selectedProductDetail.skuCode || 'NO-SKU'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-2xl text-slate-800 leading-tight mb-3">{selectedProductDetail.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#C1986E] font-bold flex items-center gap-1.5 bg-[#C1986E]/10 w-fit px-3 py-1.5 rounded-lg border border-[#C1986E]/20">
                          <Building2 size={16}/> {selectedProductDetail.brandName}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Detail Kategori (Breadcrumb Style) */}
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                          <Layers size={14} className="text-slate-400"/> Struktur Kategori
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {selectedProductDetail.categoryPath.split(' > ').map((item, index, arr) => (
                            <React.Fragment key={index}>
                              <span className={`text-xs px-3 py-1.5 rounded-lg shadow-sm border ${
                                index === arr.length - 1 
                                  ? 'bg-slate-800 text-white font-medium border-slate-800' 
                                  : 'bg-white text-slate-600 border-slate-200 font-medium'
                              }`}>
                                {item}
                              </span>
                              {index < arr.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Deskripsi */}
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                          <FileText size={14} className="text-slate-400"/> Keterangan / Deskripsi Produk
                        </p>
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-line leading-relaxed min-h-[120px] shadow-inner">
                          {selectedProductDetail.description || <span className="text-slate-400 italic">Tidak ada deskripsi yang ditambahkan untuk produk ini.</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              
              <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end z-10 sticky bottom-0">
                <button type="button" onClick={() => setSelectedProductDetail(null)} className="px-8 py-2.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all shadow-md active:scale-95 text-sm">
                  Tutup Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const TagGenerator = () => {
    const handleDeleteBatch = (batchId) => {
      setConfirmObj({
        isOpen: true,
        title: "Hapus Batch Tag?",
        message: `Semua tag ID yang tergabung di dalam batch ${batchId} akan ikut terhapus dan tidak lagi valid. Lanjutkan?`,
        onConfirm: () => {
          setBatches(batches.filter(b => b.id !== batchId));
          setTags(tags.filter(t => t.batchId !== batchId));
          showToast(`Data batch ${batchId} berhasil dihapus!`);
        }
      });
    };

    const handlePrintBatch = (batchId) => {
      const batchTags = tags.filter(t => t.batchId === batchId);
      if(batchTags.length === 0) {
         showToast("Data tag untuk batch ini tidak ditemukan.", "error");
         return;
      }
      const printWindow = window.open('', '_blank');
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Layout - ${batchId}</title>
            <style>
              @page { size: 300mm 450mm; margin: 10mm; }
              body { margin: 0; padding: 0; font-family: sans-serif; background: white; -webkit-print-color-adjust: exact; color-adjust: exact; }
              #print-root { width: 100%; }
              .print-container { display: flex; flex-wrap: wrap; gap: 4mm; width: 100%; align-content: flex-start; }
              .tag-item { width: 30mm; height: 30mm; border: 1px dashed #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box; padding: 2mm; page-break-inside: avoid; }
              .qr-mockup { width: 20mm; height: 20mm; margin-bottom: 1mm; display: flex; justify-content: center; align-items: center; }
              .qr-mockup svg { width: 100%; height: 100%; }
              .tag-code { font-size: 5px; font-family: monospace; text-align: center; word-break: break-all; font-weight: bold; letter-spacing: 0.5px; }
            </style>
            <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
            <script crossorigin src="https://unpkg.com/qrcode.react@3.1.0/lib/index.js"></script>
          </head>
          <body>
            <div id="print-root"></div>
            <script>
              window.onload = () => {
                const rootElement = document.getElementById('print-root');
                const root = ReactDOM.createRoot(rootElement);
                const tagsData = window.__BATCH_TAGS__ || [];
                const QRCodeComponent = window.QRCodeSVG || window.QRCode?.QRCodeSVG || window.QRCode;
                root.render(
                  React.createElement('div', { className: 'print-container' },
                    tagsData.map(tag => 
                      React.createElement('div', { className: 'tag-item', key: tag.code },
                        React.createElement('div', { className: 'qr-mockup' },
                           React.createElement(QRCodeComponent, { value: "https://mki-auth.com/verify/" + tag.code, level: tag.ecc || "M", renderAs: "svg", width: "100%", height: "100%" })
                        ),
                        React.createElement('div', { className: 'tag-code' }, tag.code)
                      )
                    )
                  )
                );
                setTimeout(() => { window.print(); }, 500);
              };
            </script>
          </body>
        </html>
      `;
      const dataInjection = `<script>window.__BATCH_TAGS__ = ${JSON.stringify(batchTags)};</script>`;
      printWindow.document.write(htmlContent.replace('</head>', `${dataInjection}</head>`));
      printWindow.document.close();
    };

    const filteredBatches = batches.filter(b => 
      b.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
      b.productName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      b.brandName.toLowerCase().includes(globalSearch.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageAlert text="Gunakan fitur ini untuk membuat batch Tag QR secara massal. Konfigurasi PIN dan Error Correction dapat disesuaikan secara spesifik per batch." />
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <QrCode size={18} className="text-[#C1986E]" /> Konfigurasi Batch Baru
          </h3>
          <form onSubmit={handleGenerateTags} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Pilih Produk (SKU)</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm"
                  value={tagConfig.productId}
                  onChange={(e) => setTagConfig({...tagConfig, productId: e.target.value})}
                  required
                >
                  <option value="">-- Pilih Produk Terdaftar --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.brandName})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Jumlah Tag (Quantity)</label>
                <input 
                  type="number" 
                  min="1" max="10000"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                  value={tagConfig.quantity}
                  onChange={(e) => setTagConfig({...tagConfig, quantity: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h4 className="text-sm font-semibold text-slate-700 mb-2 border-b border-slate-200 pb-3">Pengaturan Tag & Keamanan</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Panjang ID Acak</label>
                  <select 
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm h-[42px]"
                    value={tagConfig.idLength}
                    onChange={(e) => setTagConfig({...tagConfig, idLength: Number(e.target.value)})}
                  >
                    <option value={8}>8 Karakter (Standar)</option>
                    <option value={10}>10 Karakter</option>
                    <option value={12}>12 Karakter</option>
                  </select>
                </div>
                <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-200 h-[42px]">
                  <label className="text-sm font-medium text-slate-600">Gunakan PIN</label>
                  <button 
                    type="button"
                    onClick={() => setTagConfig({...tagConfig, usePin: !tagConfig.usePin})}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all active:scale-95 focus:outline-none ${tagConfig.usePin ? 'bg-[#C1986E]' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${tagConfig.usePin ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                {tagConfig.usePin && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Panjang PIN (Digit)</label>
                    <select 
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm h-[42px]"
                      value={tagConfig.pinLength}
                      onChange={(e) => setTagConfig({...tagConfig, pinLength: Number(e.target.value)})}
                    >
                      <option value={4}>4 Digit</option>
                      <option value={6}>6 Digit</option>
                    </select>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">QR Error Correction</label>
                  <select 
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm h-[42px]"
                    value={tagConfig.errorCorrection}
                    onChange={(e) => setTagConfig({...tagConfig, errorCorrection: e.target.value})}
                  >
                    <option value="M">Level M (15% recovery)</option>
                    <option value="H">Level H (30% recovery)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button type="submit" className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-8 py-2.5 rounded-lg font-medium transition-all active:scale-95 flex items-center gap-2">
                <Hash size={18} /> Generate Batch Sekarang
              </button>
            </div>
          </form>
        </div>

        {/* TABEL RIWAYAT BATCH */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto mt-6">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Layers size={18} className="text-[#C1986E]" /> Riwayat Batch Generate
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500">Total Tag Dibuat:</span>
                <span className="text-sm font-bold text-[#C1986E]">
                  {new Intl.NumberFormat('id-ID').format(filteredBatches.reduce((total, batch) => total + batch.qty, 0))}
                </span>
              </div>
              <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg">{filteredBatches.length} Batch</span>
            </div>
          </div>
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Batch ID & Info</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Produk SKU</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Jumlah & Keamanan</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-slate-400 text-sm">Tidak ada riwayat batch yang ditemukan.</td></tr>
              ) : (
                filteredBatches.map(batch => (
                  <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block mb-1">{batch.id}</p>
                      <p className="text-xs text-slate-500">{batch.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 text-sm">{batch.productName}</p>
                      <p className="text-xs text-[#C1986E] font-medium">{batch.brandName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700">{batch.qty} <span className="text-xs font-normal text-slate-500">Tag</span></p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium border border-blue-100">PIN: {batch.settings.pin}</span>
                        <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium border border-purple-100">ECC: {batch.settings.ecc}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip text="Print / Cetak Barcode" position="top">
                          <button onClick={() => handlePrintBatch(batch.id)} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all p-1.5 rounded-lg active:scale-95">
                            <Printer size={16} />
                          </button>
                        </Tooltip>
                        <Tooltip text="Hapus Seluruh Batch" position="top">
                          <button onClick={() => handleDeleteBatch(batch.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                            <Trash2 size={16} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Berhasil Generate */}
        {isTagModalOpen && generatedQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col text-center">
              <div className="bg-emerald-50 p-6 flex flex-col items-center border-b border-emerald-100">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-bold text-lg text-emerald-800">Generate Berhasil!</h3>
                <p className="text-sm text-emerald-600 mt-1">{generatedQR.count} Tag telah dibuat untuk {generatedQR.productName}.</p>
              </div>
              <div className="p-6 bg-slate-50">
                <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Batch ID</p>
                <p className="font-mono text-sm bg-white border border-slate-200 py-2 rounded-lg text-slate-800 font-bold tracking-widest">{generatedQR.batchId}</p>
              </div>
              <div className="p-4 flex gap-3">
                <button onClick={() => setIsTagModalOpen(false)} className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm">Tutup</button>
                <button onClick={() => { setIsTagModalOpen(false); handlePrintBatch(generatedQR.batchId); }} className="flex-1 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm active:scale-95 text-sm flex items-center justify-center gap-2">
                  <Printer size={16} /> Cetak Batch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const UserManager = () => {
    const filteredUsers = systemUsers.filter(u => 
      u.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(globalSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(globalSearch.toLowerCase())
    ).sort((a, b) => {
      const dir = userSort.direction === 'asc' ? 1 : -1;
      if (userSort.key === 'name') return a.name.localeCompare(b.name) * dir;
      if (userSort.key === 'role') return a.role.localeCompare(b.role) * dir;
      return (a.id - b.id) * dir;
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageAlert text="Kelola akses pengguna sistem di sini. Klik pada judul kolom di tabel untuk mengurutkan data." />
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('name', userSort, setUserSort)}>
                  <div className="flex items-center gap-2">Informasi Pengguna <SortIcon columnKey="name" sortConfig={userSort} /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('role', userSort, setUserSort)}>
                  <div className="flex items-center gap-2">Role Akses <SortIcon columnKey="role" sortConfig={userSort} /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-[#C1986E]/10 rounded-full flex items-center justify-center text-[#C1986E] font-bold">
                         {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${user.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip text="Reset Sandi" position="top">
                        <button onClick={() => handleOpenPasswordModal(user)} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all p-1.5 rounded-lg active:scale-95"><Key size={16} /></button>
                      </Tooltip>
                      <Tooltip text="Edit User" position="top">
                        <button onClick={() => handleEditUser(user)} className="text-slate-400 hover:text-[#C1986E] hover:bg-[#C1986E]/10 transition-all p-1.5 rounded-lg active:scale-95"><Edit size={16} /></button>
                      </Tooltip>
                      <Tooltip text="Hapus User" position="top">
                        <button onClick={() => handleDeleteUser(user.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95"><Trash2 size={16} /></button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Ubah Password */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
              <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                  <Key size={18} className="text-[#C1986E]" /> Ubah Sandi Pengguna
                </h3>
                <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all p-1.5 rounded-lg active:scale-95"><X size={18} /></button>
              </div>
              <form onSubmit={handleSavePassword} className="flex flex-col">
                <div className="p-6 space-y-4">
                  <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg border border-blue-100 mb-2">
                    Mengubah sandi untuk pengguna: <strong>{passwordData.userName}</strong>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Sandi Baru</label>
                    <input 
                      type="password" 
                      placeholder="Masukkan sandi baru" 
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Konfirmasi Sandi Baru</label>
                    <input 
                      type="password" 
                      placeholder="Ketik ulang sandi baru" 
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm">Batal</button>
                  <button type="submit" className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-sm active:scale-95 text-sm">Simpan Sandi Baru</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Tambah/Edit User (Existing logic but missing modal rendering) */}
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
              <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                  {editingUserId ? <Edit size={18} className="text-[#C1986E]" /> : <Users size={18} className="text-[#C1986E]" />}
                  {editingUserId ? "Edit Data Pengguna" : "Tambah Pengguna Baru"}
                </h3>
                <button onClick={handleCancelEditUser} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all p-1.5 rounded-lg active:scale-95"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveUser} className="flex flex-col">
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Nama Lengkap</label>
                    <input 
                      type="text" 
                      placeholder="Masukkan nama pengguna" 
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                      value={userInput.name}
                      onChange={(e) => setUserInput({...userInput, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Alamat Email</label>
                    <input 
                      type="email" 
                      placeholder="email@perusahaan.com" 
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                      value={userInput.email}
                      onChange={(e) => setUserInput({...userInput, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Role / Akses</label>
                    <select 
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm bg-white"
                      value={userInput.role}
                      onChange={(e) => setUserInput({...userInput, role: e.target.value})}
                    >
                      <option value="Brand Owner">Brand Owner (Lihat Data Saja)</option>
                      <option value="Super Admin">Super Admin (Akses Penuh)</option>
                    </select>
                  </div>
                  {!editingUserId && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Sandi Awal</label>
                      <input 
                        type="password" 
                        placeholder="Sandi untuk login pertama" 
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                        value={userInput.password}
                        onChange={(e) => setUserInput({...userInput, password: e.target.value})}
                        required={!editingUserId}
                      />
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end gap-3">
                  <button type="button" onClick={handleCancelEditUser} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm">Batal</button>
                  <button type="submit" className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-sm active:scale-95 text-sm">{editingUserId ? "Simpan Perubahan" : "Buat Akun"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ScanHistoryView = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageAlert text="Riwayat seluruh aktivitas pemindaian (scan) tag dari end-user (pelanggan). Fitur analitik anti-pemalsuan (anti-counterfeiting) dapat dipantau di sini." />
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Waktu Scan</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Tag ID</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Lokasi & IP</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status Identifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Dummy Scan Data */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600">Hari ini, 10:45 WIB</td>
                <td className="px-6 py-4"><span className="font-mono text-sm font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-800">MKI-101-ABCD1234</span></td>
                <td className="px-6 py-4"><p className="text-sm font-medium text-slate-800">Jakarta, ID</p><p className="text-xs text-slate-500">114.122.5.21</p></td>
                <td className="px-6 py-4"><span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">Original (Scan ke-1)</span></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600">Hari ini, 09:20 WIB</td>
                <td className="px-6 py-4"><span className="font-mono text-sm font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-800">MKI-101-WXYZ9012</span></td>
                <td className="px-6 py-4"><p className="text-sm font-medium text-slate-800">Surabaya, ID</p><p className="text-xs text-slate-500">36.78.22.1</p></td>
                <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-700 text-xs px-2.5 py-1 rounded-full font-medium">Peringatan (Scan ke-5)</span></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600">Kemarin, 14:15 WIB</td>
                <td className="px-6 py-4"><span className="font-mono text-sm font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-800">MKI-102-QRST7890</span></td>
                <td className="px-6 py-4"><p className="text-sm font-medium text-slate-800">Tidak Diketahui</p><p className="text-xs text-slate-500">Hidden Proxy</p></td>
                <td className="px-6 py-4"><span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium">Indikasi Palsu</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageAlert text="Pengaturan sistem global. Hanya Super Admin yang dapat mengubah beberapa konfigurasi krusial keamanan." />
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-3xl">
          <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock size={18} className="text-[#C1986E]" /> Konfigurasi Keamanan (Anti-Counterfeit)
          </h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Batas Maksimal Scan Valid</h4>
                <p className="text-xs text-slate-500 mt-0.5">Setelah batas dilewati, sistem akan memberi label "Indikasi Palsu/Digandakan".</p>
              </div>
              <select defaultValue="5 Kali Scan" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C1986E] bg-slate-50">
                <option value="3 Kali Scan">3 Kali Scan</option>
                <option value="5 Kali Scan">5 Kali Scan</option>
                <option value="10 Kali Scan">10 Kali Scan</option>
              </select>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Wajibkan Izin Lokasi Scan (GPS)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Memaksa browser meminta izin lokasi user saat membuka link validasi.</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#C1986E] transition-all focus:outline-none">
                <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Notifikasi Email Peringatan Pemalsuan</h4>
                <p className="text-xs text-slate-500 mt-0.5">Kirim notifikasi otomatis ke Brand Owner bila ada terdeteksi tag invalid.</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 transition-all focus:outline-none">
                <span className="inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white transition-transform" />
              </button>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm">Simpan Pengaturan</button>
          </div>
        </div>
      </div>
    );
  };

  const SidebarItem = ({ icon: Icon, label, id, isSub = false }) => (
    <Tooltip text={isSidebarMinimized ? label : ""} position="right" wrapperClass={`w-full ${isSidebarMinimized ? 'flex justify-center' : ''}`}>
      <button 
        onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }} 
        className={`flex items-center gap-3 py-2.5 rounded-lg transition-all text-sm w-full
          ${isSidebarMinimized ? 'px-0 justify-center' : 'px-3 justify-start'}
          ${isSub && !isSidebarMinimized ? 'ml-6 w-[calc(100%-24px)]' : ''}
          ${activeTab === id 
            ? 'bg-[#C1986E]/10 text-[#C1986E] font-bold border border-[#C1986E]/20' 
            : 'text-slate-600 hover:bg-slate-100 font-medium border border-transparent'
          }
        `}
      >
        <Icon size={isSub && !isSidebarMinimized ? 16 : 18} className={`${activeTab === id ? 'text-[#C1986E]' : 'text-slate-400'} flex-shrink-0`} />
        {!isSidebarMinimized && <span className="truncate">{label}</span>}
      </button>
    </Tooltip>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-slate-800 font-sans relative">
      {/* Toast Notification */}
      {toast.isOpen && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white font-medium animate-in slide-in-from-right-8 fade-in ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen ${isSidebarMinimized ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 shadow-sm transition-all duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className={`relative p-4 md:p-6 border-b border-slate-100 flex items-center ${isSidebarMinimized ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-[#C1986E] to-[#8C6D4D] rounded flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            {!isSidebarMinimized && <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#C1986E] to-[#604932]">MKI-Auth</span>}
          </div>
          <button className="hidden md:flex items-center justify-center absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 text-slate-400 rounded-full shadow-sm z-50 hover:text-[#C1986E]" onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}>
            {isSidebarMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
        
        {/* Tambahkan overflow-x-hidden pada baris di bawah ini */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 custom-scrollbar">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
          <div className="pt-2">
            {!isSidebarMinimized && <p className="px-3 text-xs font-bold uppercase text-slate-400 mb-2">Master Data</p>}
            <SidebarItem icon={Building2} label="Brand" id="brand" isSub />
            <SidebarItem icon={ListTree} label="Kategori Produk" id="categories" isSub />
            <SidebarItem icon={Package} label="SKU Produk" id="product" isSub />
            <SidebarItem icon={QrCode} label="Generate Tag/QR" id="tags" isSub />
          </div>
          <div className="pt-2">
            <SidebarItem icon={ScanLine} label="Aktivitas Scan" id="scan_history" />
            <SidebarItem icon={Users} label="Users & Roles" id="users" />
            <SidebarItem icon={Settings} label="Pengaturan" id="settings" />
          </div>
        </div>
        
        {/* User Profile & Logout - Bottom of Sidebar */}
        <div className={`p-4 border-t border-slate-200 flex items-center ${isSidebarMinimized ? 'justify-center cursor-pointer hover:bg-red-50 transition-colors group' : 'justify-between'} bg-slate-50`} onClick={isSidebarMinimized ? handleLogout : undefined}>
          {isSidebarMinimized ? (
            <Tooltip text="Logout" position="right">
              <LogOut size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
            </Tooltip>
          ) : (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C1986E] to-[#A37E58] text-white flex items-center justify-center font-bold flex-shrink-0 text-sm shadow-sm">
                  AU
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-slate-800 truncate">Admin Utama</span>
                  <span className="text-[10px] text-slate-500 truncate">Super Admin</span>
                </div>
              </div>
              <Tooltip text="Keluar Sistem" position="top">
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 flex-shrink-0">
                  <LogOut size={16} />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-lg md:text-xl font-bold text-slate-800">{getPageTitle(activeTab)}</h1>
          <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Cari data..." className="bg-transparent border-none outline-none text-sm w-48 focus:ring-0" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && DashboardView()}
            {activeTab === 'brand' && BrandManager()}
            {activeTab === 'categories' && CategoryManager()}
            {activeTab === 'product' && ProductManager()}
            {activeTab === 'tags' && TagGenerator()}
            {activeTab === 'users' && UserManager()}
            {activeTab === 'scan_history' && ScanHistoryView()}
            {activeTab === 'settings' && SettingsView()}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        .animate-bar { transform-origin: bottom; animation: barGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform: scaleY(0); }
        @keyframes barGrow { to { transform: scaleY(1); } }
      `}} />

      {/* Global Confirm Modal */}
      {confirmObj.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="font-bold text-lg text-slate-800">{confirmObj.title}</h3>
              <p className="text-sm text-slate-500 mt-2">{confirmObj.message}</p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => setConfirmObj({ ...confirmObj, isOpen: false })} className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-all active:scale-95 text-sm">Batal</button>
              <button onClick={() => { confirmObj.onConfirm(); setConfirmObj({ ...confirmObj, isOpen: false }); }} className="flex-1 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm active:scale-95 text-sm">Ya, Lanjutkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
