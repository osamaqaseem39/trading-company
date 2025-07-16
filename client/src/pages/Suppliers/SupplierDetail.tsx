import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supplierApi, SupplierRequest } from '../../services/api';

const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<SupplierRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      supplierApi.getById(id)
        .then(res => setSupplier(res.data))
        .catch(() => setError('Supplier not found'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error || !supplier) return <div className="flex justify-center items-center h-64">{error || 'Supplier not found'}</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Link to="/suppliers" className="text-indigo-600 hover:underline mb-4 inline-block">&larr; Back to List</Link>
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">Supplier Request Details</h2>
        <div className="mb-2"><span className="font-semibold">Name:</span> {supplier.firstName} {supplier.lastName}</div>
        <div className="mb-2"><span className="font-semibold">Email:</span> {supplier.email}</div>
        <div className="mb-2"><span className="font-semibold">Phone:</span> {supplier.phone}</div>
        <div className="mb-2"><span className="font-semibold">Company Name:</span> {supplier.companyName}</div>
        <div className="mb-2"><span className="font-semibold">Job Title:</span> {supplier.jobTitle}</div>
        <div className="mb-2"><span className="font-semibold">Address:</span> {supplier.address.street}, {supplier.address.city}, {supplier.address.zip}, {supplier.address.country}</div>
        <div className="mb-2"><span className="font-semibold">Ingredients Supplied:</span> {supplier.ingredientsSupplied}</div>
        <div className="mb-2"><span className="font-semibold">Food Safety Accreditations:</span> {supplier.foodSafetyAccreditations}</div>
        {supplier.brochure && (
          <div className="mb-2">
            <span className="font-semibold">Brochure:</span> <a href={`/${supplier.brochure.replace('uploads', 'uploads')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a>
          </div>
        )}
        {supplier.website && (
          <div className="mb-2"><span className="font-semibold">Website:</span> <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{supplier.website}</a></div>
        )}
        <div className="mb-2"><span className="font-semibold">Message:</span> {supplier.message}</div>
        <div className="mb-2"><span className="font-semibold">Newsletter Subscribed:</span> {supplier.newsletterSubscribed ? 'Yes' : 'No'}</div>
        <div className="mb-2 text-xs text-gray-500">Submitted: {new Date(supplier.createdAt).toLocaleString()}</div>
      </div>
    </div>
  );
};

export default SupplierDetail; 