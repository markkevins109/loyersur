'use client';
import React, { use } from 'react';
import PropertyDetailPage from './PropertyDetailPage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PropertyDetailPage id={id} />;
}
