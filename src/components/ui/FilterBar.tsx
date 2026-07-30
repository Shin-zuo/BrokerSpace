'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Maximize, Filter } from 'lucide-react';
import { PropertyType } from '@/src/generated/prisma/client';
import AutocompleteInput from '@/src/components/ui/AutocompleteInput';
// @ts-ignore
import { regions, provinces, citiesMunicipalities } from 'ph-locations';

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minSize, setMinSize] = useState(searchParams.get('minSize') || '');
  const [maxSize, setMaxSize] = useState(searchParams.get('maxSize') || '');
  
  // Location states
  const [region, setRegion] = useState(searchParams.get('region') || '');
  const [province, setProvince] = useState(searchParams.get('province') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  
  // Codes for ph-locations filtering
  const [regionCode, setRegionCode] = useState<string>('');
  const [provinceCode, setProvinceCode] = useState<string>('');

  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize region/province codes if URL has values
  useEffect(() => {
    if (region) {
      const r = regionOptions.find(opt => opt.value === region);
      if (r) setRegionCode(r.code);
    }
    if (province) {
      const p = provinces.find((x: any) => x.name === province);
      if (p) setProvinceCode(p.code);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('q', searchTerm);
    if (propertyType) params.set('type', propertyType);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minSize) params.set('minSize', minSize);
    if (maxSize) params.set('maxSize', maxSize);
    
    // Add location filters
    if (region) params.set('region', region);
    if (province) params.set('province', province);
    if (city) params.set('city', city);
    
    // reset to page 1 on new search
    params.set('page', '1');
    
    router.push(`/?${params.toString()}`);
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
    .map((p: any) => ({ label: p.name, value: p.name, code: p.code }));
  
  const cityOptions = citiesMunicipalities
    .filter((c: any) => {
      if (regionCode === 'PH-00') return c.province === null;
      return provinceCode ? c.province === provinceCode : false;
    })
    .map((c: any) => ({ label: c.name, value: c.name, code: c.name }));

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 rounded-2xl p-4 w-full max-w-5xl mx-auto z-10 relative mt-[-40px]">
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        {/* Primary Search Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
              placeholder="Search by keyword, address, or broker..."
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium transition-colors border cursor-pointer ${
                isExpanded 
                  ? 'bg-teal-50 text-teal-700 border-teal-200' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button
              type="submit"
              className="flex items-center justify-center px-8 py-3.5 rounded-xl text-white font-medium bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all shadow-md shadow-teal-500/20 cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-200">
            {/* Location Filters */}
            <div className="space-y-4 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <AutocompleteInput
                label="Region"
                name="region"
                value={region}
                options={regionOptions}
                onChange={(val, code) => {
                  setRegion(val);
                  setProvince('');
                  setCity('');
                  setProvinceCode('');
                  if (code) setRegionCode(code);
                  else setRegionCode('');
                }}
                placeholder="Any Region"
              />
              <AutocompleteInput
                label="Province"
                name="province"
                value={province}
                options={provinceOptions}
                onChange={(val, code) => {
                  setProvince(val);
                  setCity('');
                  if (code) setProvinceCode(code);
                  else setProvinceCode('');
                }}
                placeholder="Any Province"
                disabled={!regionCode && provinceOptions.length === 0}
              />
              <AutocompleteInput
                label="City / Municipality"
                name="city"
                value={city}
                options={cityOptions}
                onChange={(val) => setCity(val)}
                placeholder="Any City"
                disabled={(!provinceCode && regionCode !== 'PH-00') || cityOptions.length === 0}
              />
            </div>

            <div className="col-span-1 md:col-span-3 border-t border-slate-100 my-1"></div>

            {/* Property Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              >
                <option value="">Any Type</option>
                <option value="House">House</option>
                <option value="Condominium">Condominium</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Land">Land</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price Range (PHP)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            {/* Size Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Size (sqm)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minSize}
                  onChange={(e) => setMinSize(e.target.value)}
                  placeholder="Min"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                  placeholder="Max"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
