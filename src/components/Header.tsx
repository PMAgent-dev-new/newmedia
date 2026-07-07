'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Category } from '@/types/microcms';
import { withBasePath } from '@/lib/basePath';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Figmaデザインに合わせた固定カテゴリ（環境変数エラーを回避）
  const categories: Category[] = [
    { id: '2', name: '企業取材', slug: 'company-interview', createdAt: '', updatedAt: '', publishedAt: '', revisedAt: '' },
    { id: '3', name: 'ご利用者様の声', slug: 'user-voices', createdAt: '', updatedAt: '', publishedAt: '', revisedAt: '' },
    { id: '4', name: 'お役立ち情報', slug: 'helpful-info', createdAt: '', updatedAt: '', publishedAt: '', revisedAt: '' },
    { id: '5', name: 'インタビュー', slug: 'interview', createdAt: '', updatedAt: '', publishedAt: '', revisedAt: '' }
  ];

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white w-full border-b border-gray-200 relative z-40">
        <div className="px-4 md:px-10">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <Image
                src={withBasePath('/logo-ridejob.png')}
                alt="RIDE JOB Logo"
                width={120}
                height={39}
                className="h-[39px] w-[120px] object-contain"
                priority
                sizes="120px"
              />
            </Link>
            
            {/* Desktop Menu: Centered categories */}
            <div className="hidden lg:flex items-center flex-1 min-w-0 mx-6 justify-center">
              <nav className="flex items-center gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/blog?category=${category.id}`}
                    className="text-[#555555] font-bold hover:opacity-80 transition-opacity whitespace-nowrap"
                    aria-label={`${category.name}カテゴリへ`}
                  >
                    {category.name}
                  </Link>
                ))}
                {/* Additional Links */}
                <Link
                  href="/contact"
                  className="text-[#555555] font-bold hover:opacity-80 transition-opacity whitespace-nowrap"
                  aria-label="お問い合わせページへ"
                >
                  お問い合わせ
                </Link>
                <Link
                  href="/about"
                  className="text-[#555555] font-bold hover:opacity-80 transition-opacity whitespace-nowrap"
                  aria-label="ライドジョブについて"
                >
                  ライドジョブについて
                </Link>
              </nav>
            </div>

            {/* Desktop CTAs (right side) */}
            <div className="hidden lg:flex items-center space-x-4">
              <a
                href="https://ridejob.jp/entry"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#04acdb] text-white px-6 py-2 rounded-[10px] font-bold text-base shadow-sm hover:bg-[#0398c0] transition-colors"
                aria-label="まずお話を聞く"
              >
                まずお話を聞く
              </a>
              <a
                href="https://ridejob.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2204db] text-white px-6 py-2 rounded-[10px] font-bold text-base shadow-sm hover:bg-[#1b03b8] transition-colors"
                aria-label="求人情報を見る（外部サイト）"
              >
                求人情報を見る
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
            >
              <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-gray-600 transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </div>
        </div>
      </header>

            {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#d5fbfe] z-50 lg:hidden">
          {/* Close Button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={closeMenu}
              className="bg-[#19bbfb] p-4 rounded-[10px] border border-black shadow-[4px_4px_0px_0px_rgba(51,51,51,0.2)]"
            >
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                <path d="M2 2L22 14M22 2L2 14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex flex-col items-center justify-center h-full gap-8 px-4">
              {/* Category & Additional Menu Items */}
              <div className="flex flex-col gap-4 items-center">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.id}`}
                  onClick={closeMenu}
                  className="bg-white border border-black rounded-[10px] px-4 py-2 w-full max-w-[240px] text-center"
                >
                  <span className="text-[#2204db] text-[24px] font-bold" style={{ fontFamily: 'Dela Gothic One, sans-serif' }}>
                    {category.name}
                  </span>
                </Link>
              ))}
                {/* お問い合わせ */}
                <Link
                  href="/contact"
                  onClick={closeMenu}
                  className="bg-white border border-black rounded-[10px] px-4 py-2 w-full max-w-[240px] text-center"
                >
                  <span className="text-[#2204db] text-[24px] font-bold" style={{ fontFamily: 'Dela Gothic One, sans-serif' }}>
                    お問い合わせ
                  </span>
                </Link>
                {/* ライドジョブについて（外部） */}
                <Link
                  href="/about"
                  onClick={closeMenu}
                  className="bg-white border border-black rounded-[10px] px-4 py-2 w-full max-w-[240px] text-center"
                >
                  <span className="text-[#2204db] text-[24px] font-bold" style={{ fontFamily: 'Dela Gothic One, sans-serif' }}>
                    ライドジョブについて
                  </span>
                </Link>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-2 items-center">
              {/* TikTok Icon */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-black rounded-full flex items-center justify-center"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M19.321 5.562a5.124 5.124 0 01-.443-.258 6.228 6.228 0 01-1.137-.966c-.849-.849-1.375-2.021-1.375-3.338H12.5v14.031c0 1.604-1.306 2.906-2.914 2.906-1.607 0-2.914-1.302-2.914-2.906s1.307-2.906 2.914-2.906c.302 0 .593.049.865.136V9.428c-.276-.037-.558-.056-.845-.056C5.486 9.372 2.5 12.358 2.5 16.031S5.486 22.69 9.606 22.69s7.106-2.986 7.106-6.659V9.283a8.504 8.504 0 004.788 1.49V7.106c-1.022 0-1.967-.399-2.679-1.117-.712-.712-1.117-1.657-1.117-2.679h-1.383z" fill="white"/>
                </svg>
              </a>

              {/* YouTube Icon */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center"
              >
                <svg width="30" height="21" viewBox="0 0 30 21" fill="none">
                  <path d="M29.52 3.28c-.346-1.297-1.366-2.317-2.663-2.663C24.485 0 15.06 0 15.06 0S5.635 0 3.263.617c-1.297.346-2.317 1.366-2.663 2.663C0 5.652 0 10.5 0 10.5s0 4.848.6 7.22c.346 1.297 1.366 2.317 2.663 2.663C5.635 21 15.06 21 15.06 21s9.425 0 11.797-.617c1.297-.346 2.317-1.366 2.663-2.663.6-2.372.6-7.22.6-7.22s0-4.848-.6-7.22zM12.048 15V6l7.872 4.5-7.872 4.5z" fill="#FF0000"/>
                </svg>
              </a>

              {/* Instagram Icon */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center"
              >
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                  <path d="M15 7.3c2.49 0 2.784.009 3.766.054.909.041 1.403.193 1.732.32.435.17.745.372 1.071.698.326.326.528.636.698 1.071.127.329.279.823.32 1.732.045.982.054 1.276.054 3.766s-.009 2.784-.054 3.766c-.041.909-.193 1.403-.32 1.732-.17.435-.372.745-.698 1.071a2.88 2.88 0 01-1.071.698c-.329.127-.823.279-1.732.32-.982.045-1.276.054-3.766.054s-2.784-.009-3.766-.054c-.909-.041-1.403-.193-1.732-.32a2.88 2.88 0 01-1.071-.698 2.88 2.88 0 01-.698-1.071c-.127-.329-.279-.823-.32-1.732C7.358 17.784 7.35 17.49 7.35 15s.009-2.784.054-3.766c.041-.909.193-1.403.32-1.732.17-.435.372-.745.698-1.071a2.88 2.88 0 011.071-.698c.329-.127.823-.279 1.732-.32.982-.045 1.276-.054 3.766-.054zM15 5.5c-2.533 0-2.851.011-3.847.056-.995.045-1.675.204-2.267.435-.614.238-1.135.557-1.654 1.076a4.58 4.58 0 00-1.076 1.654c-.231.592-.39 1.272-.435 2.267C5.676 12.149 5.65 12.467 5.65 15s.026 2.851.071 3.847c.045.995.204 1.675.435 2.267.238.614.557 1.135 1.076 1.654.519.519 1.04.838 1.654 1.076.592.231 1.272.39 2.267.435.996.045 1.314.056 3.847.056s2.851-.011 3.847-.056c.995-.045 1.675-.204 2.267-.435a4.58 4.58 0 001.654-1.076 4.58 4.58 0 001.076-1.654c.231-.592.39-1.272.435-2.267.045-.996.056-1.314.056-3.847s-.011-2.851-.056-3.847c-.045-.995-.204-1.675-.435-2.267a4.58 4.58 0 00-1.076-1.654A4.58 4.58 0 0021.114 6.42c-.592-.231-1.272-.39-2.267-.435C17.851 5.54 17.533 5.5 15 5.5z" fill="url(#paint0_linear)"/>
                  <path d="M15 10.27a4.73 4.73 0 100 9.46 4.73 4.73 0 000-9.46zM15 18a3 3 0 110-6 3 3 0 010 6zM20.27 10.09a1.105 1.105 0 11-2.21 0 1.105 1.105 0 012.21 0z" fill="url(#paint1_linear)"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="15" x2="30" y2="15" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#E09B3D"/>
                      <stop offset=".3" stopColor="#C74C4D"/>
                      <stop offset=".6" stopColor="#C21975"/>
                      <stop offset="1" stopColor="#7024C4"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="0" y1="15" x2="30" y2="15" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#E09B3D"/>
                      <stop offset=".3" stopColor="#C74C4D"/>
                      <stop offset=".6" stopColor="#C21975"/>
                      <stop offset="1" stopColor="#7024C4"/>
                    </linearGradient>
                  </defs>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}