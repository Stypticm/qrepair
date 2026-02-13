import { getPictureUrl } from '@/core/lib/assets';
import Image from 'next/image';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-4">
      <img
        src={getPictureUrl('coconut-dancing.gif') || '/coconut-dancing.gif'}
        alt="Загрузка"
        className="w-12 h-12 object-contain"
      />
    </div>
  );
}
