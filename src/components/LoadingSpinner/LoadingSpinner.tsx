import { getPictureUrl } from '@/core/lib/assets';
import Image from 'next/image';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-4">
      <Image
        src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
        alt="Загрузка"
        width={48}
        height={48}
        className="object-contain"
      />
    </div>
  );
}
