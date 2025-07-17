'use client';

import { List } from '@telegram-apps/telegram-ui';
import ProgressBar from '../ProgressBar/ProgressBar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <List>
      <section className="flex flex-col justify-between h-[calc(100vh-100px)]">
        <ProgressBar />
        <div className="flex flex-col rounded-2xl m-1 p-2 h-[calc(100vh-150px)]">
          {children}
        </div>
      </section>
    </List>
  );
}
