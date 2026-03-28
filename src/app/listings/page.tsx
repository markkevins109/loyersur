'use client';
import React from 'react';
import { LangProvider } from '@/lib/lang';
import ListingsPage from './ListingsPage';

export default function Page() {
  return (
    <LangProvider>
      <ListingsPage />
    </LangProvider>
  );
}
