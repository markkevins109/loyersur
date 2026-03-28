'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { LangProvider, useLang } from '@/lib/lang';
import AuthLayout from '../AuthLayout';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

function ForgotForm() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-fade-in-up">
      {!sent ? (
        <>
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A5F] to-[#2a5298] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">{t('forgot_title')}</h1>
            <p className="text-gray-500 text-sm">{t('forgot_sub')}</p>
          </div>

          <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login_email')}</label>
              <input id="forgot-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@email.ci" className="input-field" required />
            </div>
            <button id="forgot-submit" type="submit"
              className="w-full bg-[#1E3A5F] text-white py-3.5 rounded-xl font-bold hover:bg-[#152844] transition-all duration-200 shadow-md flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              {t('forgot_btn')}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="font-black text-gray-900 text-xl mb-2">Email envoyé !</h2>
          <p className="text-gray-500 text-sm mb-6">Vérifiez votre boîte mail à {email}</p>
        </div>
      )}

      <Link href="/auth/login" id="back-to-login"
        className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-[#1E3A5F] mt-4 transition-colors duration-200">
        <ArrowLeft className="w-3.5 h-3.5" />
        {t('back')} — {t('login_title')}
      </Link>
    </div>
  );
}

export default function Page() {
  return (
    <LangProvider>
      <AuthLayout><ForgotForm /></AuthLayout>
    </LangProvider>
  );
}
