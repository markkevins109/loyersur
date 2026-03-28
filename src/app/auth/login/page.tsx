'use client';
import React from 'react';
import { LangProvider } from '@/lib/lang';
import AuthLayout from '../AuthLayout';
import LoginForm from './LoginForm';

export default function Page() {
  return (
    <LangProvider>
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </LangProvider>
  );
}
