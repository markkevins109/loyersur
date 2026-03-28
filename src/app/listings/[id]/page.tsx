'use client';
import React from 'react';
import { LangProvider } from '@/lib/lang';
import PropertyDetailPage from './PropertyDetailPage';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <LangProvider>
      <PropertyDetailPage id={params.id} />
    </LangProvider>
  );
}
