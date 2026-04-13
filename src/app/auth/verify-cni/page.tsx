'use client';
import React from 'react';
import { LangProvider } from '@/lib/lang';
import AuthLayout from '../AuthLayout';
import CniVerificationForm from './CniVerificationForm';

export default function VerifyCniPage() {
  return (
    <LangProvider>
      <AuthLayout>
        <CniVerificationForm />
      </AuthLayout>
    </LangProvider>
  );
}
