'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const DashboardContent = dynamic(() => import('./DashboardContent'), { ssr: false });

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
