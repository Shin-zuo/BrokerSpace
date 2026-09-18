"use client";
import React, { useState, useEffect } from "react";
import { propertyApi } from "@/src/api/propertyApi";
import Modal from "@/src/components/ui/Modal";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Loader2, Plus, Filter, Search, Building2, MapPin, Eye, Edit, Trash2, Tag, ChevronDown, Check, Home, ExternalLink, Image as ImageIcon, ChevronLeft, ChevronRight, Edit2, Trash2 as Trash2Icon, X } from "lucide-react";
import BackButton from '@/src/components/ui/BackButton';
import Link from "next/link";

const MySwal = withReactContent(Swal);
import AutocompleteInput from "@/src/components/ui/AutocompleteInput";
import LocationPicker, { LocationDetails } from "@/src/components/ui/LocationPicker";
// @ts-ignore
import { regions, provinces, citiesMunicipalities } from "ph-locations";

interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface Property {
  id: string;
  title: string;
  price: number;
  status: string;
  propertyType: string;
  region: string;
  stateProvince: string;
  city: string;
  addressLine1: string;
  postalCode?: string;
  description?: string;
  sizeSqm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  visibility?: string;
  locationVisibility?: string;
  images?: PropertyImage[];
}

const initialForm = {
  title: "",
  description: "",
  price: "",
  status: "Available",
  propertyType: "House",
  sizeSqm: "",
  region: "",
  stateProvince: "",
  city: "",
  addressLine1: "",
  postalCode: "",
  latitude: null as number | null,
  longitude: null as number | null,
  visibility: "PUBLIC",
  locationVisibility: "PUBLIC",
};

export default function PropertiesView() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | 'VIEW' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewProperty, setViewProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [formData, setFormData] = useState(initialForm);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Location data states
  const [regionCode, setRegionCode] = useState<string>("");
  const [provinceCode, setProvinceCode] = useState<string>("");

  useEffect(() => {
    loadProperties();
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('add') === 'true') {
      handleOpenModal('CREATE');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyApi.fetchMine();
      setProperties(data);
    } catch (error) {
      console.error("Failed to load properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'CREATE' | 'EDIT' | 'VIEW', property?: Property) => {
    setModalMode(mode);
    setSelectedFiles([]);
    setCurrentImageIndex(0);
    
    if (property) {
      if (mode === 'VIEW') {
        setViewProperty(property);
      } else {
        setEditingId(property.id);
        setFormData({
          title: property.title,
          description: property.description || "",
          price: property.price.toString(),
          status: property.status,
          propertyType: property.propertyType || "House",
          sizeSqm: property.sizeSqm ? property.sizeSqm.toString() : "",
          region: property.region,
          stateProvince: property.stateProvince,
          city: property.city,
          addressLine1: property.addressLine1,
          postalCode: property.postalCode || "",
          visibility: property.visibility || "PUBLIC",
          locationVisibility: property.locationVisibility || "PUBLIC",
          latitude: property.latitude || null,
          longitude: property.longitude || null,
        });
        // Re-hydrate location codes
        const r = regions.find((x: any) => x.name === property.region || x.altName === property.region || formatRegionName(x) === property.region);
        if (r) {
          setRegionCode(r.code);
          const p = provinces.find((x: any) => x.name === property.stateProvince && x.region === r.code);
          if (p) setProvinceCode(p.code);
        }
        setExistingImages(property.images || []);
        setImagesToDelete([]);
      }
    } else {
      setEditingId(null);
      setFormData(initialForm);
      setRegionCode("");
      setProvinceCode("");
      setViewProperty(null);
      setExistingImages([]);
      setImagesToDelete([]);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const result = await MySwal.fire({
      title: 'Delete Property?',
      text: 'Are you sure you want to delete this property?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete it',
      customClass: { popup: 'rounded-2xl' }
    });
    if (result.isConfirmed) {
      try {
        await propertyApi.delete(id);
        setProperties(properties.filter((p) => p.id !== id));
        toast.success('Property deleted successfully');
      } catch (error) {
        console.error('Failed to delete:', error);
        toast.error('Failed to delete property');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          submitData.append(key, value.toString());
        }
      });
      
      selectedFiles.forEach(file => {
        submitData.append('images', file);
      });
      imagesToDelete.forEach(id => submitData.append('imagesToDelete', id));

      if (editingId) {
        const updated = await propertyApi.update(editingId, submitData);
        setProperties(properties.map(p => p.id === editingId ? updated : p));
        toast.success('Property updated successfully');
      } else {
        const created = await propertyApi.create(submitData);
        setProperties([created, ...properties]);
        toast.success('Property created successfully');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Save failed:", error);
      toast.error(error?.message || 'Failed to save property');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    setFormData({ ...formData, price: rawValue });
  };

  const formatPrice = (value: string | number) => {
    if (!value) return "";
    const num = Number(value);
    if (isNaN(num)) return value.toString();
    return num.toLocaleString('en-US');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validImages = files.filter(file => file.type.startsWith("image/"));
      if (validImages.length !== files.length) {
        alert("Only image files are allowed.");
      }
      setSelectedFiles([...selectedFiles, ...validImages]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: string) => {
    setExistingImages(existingImages.filter(img => img.id !== imageId));
    setImagesToDelete([...imagesToDelete, imageId]);
  };

  const nextImage = () => {
    if (viewProperty?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % viewProperty.images!.length);
    }
  };

  const prevImage = () => {
    if (viewProperty?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + viewProperty.images!.length) % viewProperty.images!.length);
    }
  };

  // Prepare location options
  const formatRegionName = (r: any) => {
    if (!r.altName) return r.name;
    const roman = /^(I|II|III|IV-A|IV-B|V|VI|VII|VIII|IX|X|XI|XII|XIII)$/i;
    if (roman.test(r.altName)) return `Region ${r.altName.toUpperCase()}`;
    return r.altName;
  };

  const regionOptions = regions.map((r: any) => ({ label: formatRegionName(r), value: formatRegionName(r), code: r.code }))
    .sort((a: any, b: any) => {
      const getRomanValue = (str: string) => {
        if (!str.startsWith("Region ")) return 999;
        const roman = str.replace("Region ", "").split("-")[0];
        const map: { [key: string]: number } = { I: 1, V: 5, X: 10 };
        let result = 0;
        for (let i = 0; i < roman.length; i++) {
          if (i > 0 && map[roman[i]] > map[roman[i - 1]]) {
            result += map[roman[i]] - 2 * map[roman[i - 1]];
          } else {
            result += map[roman[i]];
          }
        }
        return result;
      };
      const valA = getRomanValue(a.label);
      const valB = getRomanValue(b.label);
      if (valA !== valB) return valA - valB;
      return a.label.localeCompare(b.label);
    });
  const provinceOptions = provinces
    .filter((p: any) => (regionCode ? p.region === regionCode : true))
    .map((p: any) => ({ label: p.name, value: p.code, code: p.code }));
  const cityOptions = citiesMunicipalities
    .filter((c: any) => {
      if (regionCode === 'PH-00') return c.province === null;
      return provinceCode ? c.province === provinceCode : false;
    })
    .map((c: any) => ({ label: c.name, value: c.name, code: c.name }));

  const filteredProperties = properties.filter((p) => 
    p.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
    p.propertyType.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    (p.city && p.city.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="mb-2"><BackButton /></div>
          <h1 className="text-2xl font-bold text-slate-900">My Properties</h1>
          <p className="text-slate-500">Manage and track all your real estate listings</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
          />
          <button
            onClick={() => handleOpenModal('CREATE')}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer shadow-sm shadow-teal-600/20 shrink-0"
          >
            <Plus className="w-5 h-5" />
            Add Property
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Property</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">Loading properties...</td>
                </tr>
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No properties found.</td>
                </tr>
              ) : (
                filteredProperties.map((property) => (
                  <motion.tr 
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    key={property.id} 
                    onClick={() => handleOpenModal('VIEW', property)}
                    className="border-b border-slate-100/50 hover:bg-teal-50/30 transition-colors cursor-pointer"
                  >
                    <td className="py-2 px-4 text-sm font-medium text-slate-900 flex items-center gap-3">
                      {property.images && property.images.length > 0 ? (
                        <img src={property.images[0].url} alt={property.title} className="w-12 h-8 rounded object-cover bg-slate-100 border border-slate-200 shadow-sm" />
                      ) : (
                        <div className="w-12 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <span className="line-clamp-1 max-w-[200px]" title={property.title}>{property.title}</span>
                    </td>
                    <td className="py-2 px-4 text-sm text-slate-600 whitespace-nowrap">{property.propertyType}</td>
                    <td className="py-2 px-4 text-sm text-slate-600 whitespace-nowrap">
                      <span className="line-clamp-1 max-w-[150px]" title={`${property.city}, ${property.stateProvince}`}>
                        {property.city}, {property.stateProvince}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-sm text-slate-900 font-semibold whitespace-nowrap">₱{Number(property.price).toLocaleString()}</td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider
                        ${property.status === 'Available' ? 'bg-emerald-100/80 text-emerald-700' : 
                          property.status === 'Sold' ? 'bg-slate-200/80 text-slate-700' : 
                          'bg-amber-100/80 text-amber-700'}`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right space-x-1 whitespace-nowrap">
                      <Link
                        href={`/property/${property.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center text-slate-400 hover:text-slate-900 transition-colors p-1.5 rounded hover:bg-slate-100"
                        title="View Live"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal('EDIT', property); }}
                        className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer p-1.5 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(property.id, e)}
                        className="text-red-500 hover:text-red-700 transition-colors cursor-pointer p-1.5 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalMode === 'VIEW' ? "Property Details" : modalMode === 'EDIT' ? "Edit Property" : "Add New Property"}
        maxWidth="max-w-2xl"
      >
        {modalMode === 'VIEW' && viewProperty ? (
          <div className="space-y-6">
            {/* Carousel */}
            {viewProperty.images && viewProperty.images.length > 0 ? (
              <div className="relative w-full h-80 rounded-xl overflow-hidden bg-slate-100 group">
                <img 
                  src={viewProperty.images[currentImageIndex].url} 
                  alt="Property Image" 
                  className="w-full h-full object-cover"
                />
                {viewProperty.images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {viewProperty.images.map((_, idx) => (
                        <div key={idx} className={`w-2 h-2 rounded-full shadow-sm transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-64 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-12 h-12 mb-3 text-slate-300" />
                <p>No photos available</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{viewProperty.title}</h3>
                <p className="text-lg font-semibold text-blue-600 mt-1">₱{Number(viewProperty.price).toLocaleString()}</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                    {viewProperty.propertyType}
                  </span>
                  {viewProperty.sizeSqm && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
                      {viewProperty.sizeSqm} sqm
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold
                    ${viewProperty.status === 'Available' ? 'bg-green-100 text-green-800' : 
                      viewProperty.status === 'Sold' ? 'bg-slate-200 text-slate-800' : 
                      'bg-amber-100 text-amber-800'}`}
                  >
                    {viewProperty.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Location</h4>
                <p className="text-sm text-slate-700">{viewProperty.addressLine1}</p>
                <p className="text-sm text-slate-700">{viewProperty.city}, {viewProperty.stateProvince}</p>
                <p className="text-sm text-slate-700">{viewProperty.region} {viewProperty.postalCode}</p>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Description</h4>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {viewProperty.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Property Title</label>
                <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-slate-900" placeholder="e.g. Modern Villa in Tagaytay" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Price (₱)</label>
                <input required type="text" name="price" value={formatPrice(formData.price)} onChange={handlePriceChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-slate-900" placeholder="5,000,000" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-slate-900 bg-white">
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Property Type</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-slate-900 bg-white">
                  <option value="House">House</option>
                  <option value="Condominium">Condominium</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Land">Land</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Resort">Resort</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Size (sqm)</label>
                <input type="number" step="any" name="sizeSqm" value={formData.sizeSqm} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-slate-900" placeholder="e.g. 150" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Property Visibility</label>
                <select name="visibility" value={formData.visibility} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-slate-900 bg-white">
                  <option value="PUBLIC">Public</option>
                  <option value="FRIENDS">Friends Only</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              {(formData.addressLine1 || formData.city || formData.region) && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Location Visibility</label>
                  <select name="locationVisibility" value={formData.locationVisibility} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-slate-900 bg-white">
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private (Hide Exact Location)</option>
                  </select>
                </div>
              )}

              {/* Photos Upload */}
              <div className="flex flex-col gap-1.5 md:col-span-2 mt-2">
                <label className="text-sm font-medium text-slate-700">Property Photos</label>
                <div className="flex flex-col items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-10 h-10 mb-3 text-slate-400" />
                      <p className="mb-1 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-slate-500">PNG, JPG, WEBP (Image files only)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                
                {/* Unified Image Preview Grid */}
                {(existingImages.length > 0 || selectedFiles.length > 0) && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-64 overflow-y-auto">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-white border border-slate-200 shadow-sm">
                        <img src={img.url} alt="existing" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-white border border-slate-200 shadow-sm">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeFile(idx)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md">
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-500/90 text-white text-[10px] font-bold text-center py-0.5 shadow-sm">
                          NEW
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Address fields using Autocomplete */}
              <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-sm font-semibold text-slate-900 mb-4">Map Location</h4>
                <div className="mb-6">
                  <LocationPicker 
                    initialPosition={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : undefined}
                    onLocationChange={(details: LocationDetails) => {
                      setFormData(prev => ({
                        ...prev,
                        latitude: details.lat,
                        longitude: details.lng,
                        addressLine1: details.addressLine1 || prev.addressLine1,
                        city: details.city || prev.city,
                        stateProvince: details.stateProvince || prev.stateProvince,
                        postalCode: details.postalCode || prev.postalCode,
                      }));
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-2">Drag the pin to the exact location. The fields below will automatically update.</p>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 mb-4">Address Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <AutocompleteInput
                    label="Region"
                    name="region"
                    value={formData.region}
                    options={regionOptions}
                    onChange={(val, code) => {
                      setFormData({ ...formData, region: val });
                      if (code) setRegionCode(code);
                    }}
                    placeholder="Select Region"
                  />
                  
                  <AutocompleteInput
                    label="Province"
                    name="stateProvince"
                    value={formData.stateProvince}
                    options={provinceOptions}
                    onChange={(val, code) => {
                      setFormData({ ...formData, stateProvince: val });
                      if (code) setProvinceCode(code);
                    }}
                    placeholder="Select Province"
                    disabled={!regionCode && provinceOptions.length === 0}
                  />

                  <AutocompleteInput
                    label="Municipality / City"
                    name="city"
                    value={formData.city}
                    options={cityOptions}
                    onChange={(val) => {
                      setFormData({ ...formData, city: val });
                    }}
                    placeholder="Select Municipality"
                    disabled={(!provinceCode && regionCode !== 'PH-00') || cityOptions.length === 0}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Postal Code</label>
                    <input name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-slate-900" placeholder="e.g. 1000" />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Address Line 1 (Street, Barangay)</label>
                    <input name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-slate-900" placeholder="e.g. 123 Main St, Brgy. San Jose" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-slate-900 resize-none" placeholder="Describe the property..." />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer">
                {editingId ? "Update Property" : "Save Property"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
