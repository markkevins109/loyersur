'use client';
import React from 'react';
import { LangProvider } from '@/lib/lang';
import AuthLayout from '../AuthLayout';
import SignupForm from './SignupForm';

export default function Page() {
  return (
    <LangProvider>
      <AuthLayout>
        <SignupForm />
      </AuthLayout>
    </LangProvider>
  );
}
