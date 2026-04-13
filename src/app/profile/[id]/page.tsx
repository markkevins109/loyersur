'use client';
import React from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { mockLandlords, mockReviews, mockProperties } from '@/lib/mockData';
import { Star, CheckCircle2, MapPin, Calendar, Building2 } from 'lucide-react';

function ProfileContent({ id }: { id: string }) {
  const { lang, t } = useLang();
  const user = mockLandlords.find(l => l.id === id) || mockLandlords[0];
  const reviews = mockReviews.filter(r => r.targetId === user.id);
  const userProps = mockProperties.filter(p => p.landlordId === user.id);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile header */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-[#1E3A5F] to-[#2a5298] relative">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-white"
              />
              {user.verified && (
                <span className="mb-2 badge-verified">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('profile_verified')}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">{user.name}</h1>
                <p className="text-gray-500 text-sm capitalize">
                  {user.type === 'landlord' ? t('nav_landlord') : t('nav_tenant')}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="font-black text-gray-900 text-lg">{user.trustScore}</span>
                  </div>
                  <p className="text-gray-400 text-xs">{t('profile_trust')}</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-gray-900 text-lg">{user.reviewCount}</p>
                  <p className="text-gray-400 text-xs">{t('profile_reviews')}</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-gray-900 text-lg">{userProps.length}</p>
                  <p className="text-gray-400 text-xs">{t('profile_listings')}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F59E0B]" />
                Abidjan, Côte d&apos;Ivoire
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#1E3A5F]" />
                {t('profile_joined')}: {user.joinedDate}
              </div>
            </div>

            <p className="mt-4 text-gray-600 leading-relaxed">
              {lang === 'fr' ? user.bio : user.bioEn}
            </p>
          </div>
        </div>

        {/* Listings */}
        {userProps.length > 0 && (
          <div className="mb-8">
            <h2 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1E3A5F]" />
              {t('profile_listings')} ({userProps.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {userProps.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h2 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
            {t('detail_reviews')} ({reviews.length})
          </h2>
          {reviews.length ? (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={r.authorAvatar} alt={r.authorName} className="w-10 h-10 rounded-full bg-gray-100" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{r.authorName}</p>
                      <p className="text-gray-400 text-xs">{r.date}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      {Array(r.rating).fill(0).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm italic leading-relaxed">
                    &ldquo;{lang === 'fr' ? r.comment : r.commentEn}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-md border border-gray-100">
              <p className="text-gray-400">{lang === 'fr' ? 'Aucun avis pour le moment.' : 'No reviews yet.'}</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  return <ProfileContent id={params.id} />;
}
