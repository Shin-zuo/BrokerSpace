import React from 'react';
import Link from 'next/link';
import { prisma } from '@/src/lib/prisma';
import PropertyCard from '@/src/components/ui/PropertyCard';
import FilterBar from '@/src/components/ui/FilterBar';
import { Prisma } from '@/src/generated/prisma/client';

const ITEMS_PER_PAGE = 9;

export default async function MarketingPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1;
  const q = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const type = typeof searchParams?.type === 'string' ? searchParams.type : '';
  const minPrice = typeof searchParams?.minPrice === 'string' ? parseFloat(searchParams.minPrice) : null;
  const maxPrice = typeof searchParams?.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : null;
  const minSize = typeof searchParams?.minSize === 'string' ? parseFloat(searchParams.minSize) : null;
  const maxSize = typeof searchParams?.maxSize === 'string' ? parseFloat(searchParams.maxSize) : null;
  const region = typeof searchParams?.region === 'string' ? searchParams.region : '';
  const province = typeof searchParams?.province === 'string' ? searchParams.province : '';
  const city = typeof searchParams?.city === 'string' ? searchParams.city : '';

  // Build the where clause
  const where: Prisma.PropertyWhereInput = {
    status: 'Available',
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { addressLine1: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (region) where.region = region;
  if (province) where.stateProvince = province;
  if (city) where.city = city;

  if (type) {
    // Assuming PropertyType enum matches the string
    where.propertyType = type as any;
  }

  if (minPrice !== null || maxPrice !== null) {
    where.price = {};
    if (minPrice !== null && !isNaN(minPrice)) where.price.gte = minPrice;
    if (maxPrice !== null && !isNaN(maxPrice)) where.price.lte = maxPrice;
  }

  if (minSize !== null || maxSize !== null) {
    where.sizeSqm = {};
    if (minSize !== null && !isNaN(minSize)) where.sizeSqm.gte = minSize;
    if (maxSize !== null && !isNaN(maxSize)) where.sizeSqm.lte = maxSize;
  }

  const [properties, totalCount] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        images: true,
        broker: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.property.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-panel border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-500/20">
              B
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">BrokerSpace</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-full shadow-md shadow-indigo-500/20 transition-all">
              Sign up as Broker
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/60 blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">dream property</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-12">
            Discover premium real estate properties from top brokers. Filter by price, size, and location to find exactly what you're looking for.
          </p>
        </div>
      </section>

      {/* Filter & Properties Section */}
      <section className="flex-1 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <FilterBar />
          
          <div className="mt-16 mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Featured Properties <span className="text-slate-400 text-lg font-normal">({totalCount})</span>
            </h2>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No properties found</h3>
              <p className="text-slate-500">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map(property => {
                const serializedProperty = {
                  ...property,
                  price: property.price.toString(),
                  sizeSqm: property.sizeSqm ? property.sizeSqm.toString() : null,
                };
                return <PropertyCard key={property.id} property={serializedProperty as any} />;
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                // Reconstruct search params
                const params = new URLSearchParams(searchParams as Record<string, string>);
                params.set('page', p.toString());
                
                return (
                  <Link
                    key={p}
                    href={`/?${params.toString()}`}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-colors ${
                      page === p 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <span className="text-xl font-bold text-slate-900">BrokerSpace</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} BrokerSpace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
