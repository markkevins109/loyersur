'use client';
import React from 'react';
import PropertyDetailPage from './PropertyDetailPage';

export default function Page({ params }: { params: { id: string } }) {
  return <PropertyDetailPage id={params.id} />;
}
