'use client';
import React from 'react';
import AuthLayout from '../AuthLayout';
import CniVerificationForm from './CniVerificationForm';

export default function VerifyCniPage() {
  return (
    <AuthLayout>
      <CniVerificationForm />
    </AuthLayout>
  );
}
