'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function DeletePropertyButton({ propertyId, propertyTitle }: { propertyId: string, propertyTitle: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${propertyTitle}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5', // indigo-600
      cancelButtonColor: '#ef4444', // red-500
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/properties/${propertyId}`, {
          method: 'DELETE',
        });
        
        const data = await res.json();
        if (data.success) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Your property has been deleted.',
            icon: 'success',
            confirmButtonColor: '#4f46e5'
          });
          router.refresh();
        } else {
          throw new Error(data.error || 'Failed to delete');
        }
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
      title="Delete Listing"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
