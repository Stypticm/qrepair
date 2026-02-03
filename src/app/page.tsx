'use client';

export const dynamic = 'force-dynamic';

import { MobileApp } from '@/components/MobileApp/MobileApp';
import { DesktopHome } from '@/components/Desktop/DesktopHome';

const HomeContent = () => {
  return (
    <>
      {/* 
        Responsive Switching:
        - Mobile/PWA/Telegram: Visible on small screens (<768px)
        - Desktop Landing: Visible on medium+ screens (>=768px)
      */}

      {/* Mobile App View */}
      <div className="block md:hidden">
        <MobileApp />
      </div>

      {/* Desktop Landing Page */}
      <div className="hidden md:block">
        <DesktopHome />
      </div>
    </>
  );
}
export default function Home() {
  return <HomeContent />;
}