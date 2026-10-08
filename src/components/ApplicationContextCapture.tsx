'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { captureApplicationContext } from '@/lib/application-context';

export default function ApplicationContextCapture() {
  const pathname = usePathname();
  const initial = useRef(true);
  useEffect(() => {
    try { captureApplicationContext({ search: window.location.search, url: window.location.href, referrer: document.referrer, title: document.title, allowReferrer: initial.current }); }
    catch { console.warn('[application-context] capture failed; navigation continues'); }
    initial.current = false;
  }, [pathname]);
  return null;
}
