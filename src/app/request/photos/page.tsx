'use client';
export const dynamic = 'force-dynamic';

import FooterButton from '@/components/FooterButton/FooterButton';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Page } from '@/components/Page';
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import UploadPhotos from '@/components/UploadPhotos/UploadPhotos';

const PhotosPage = () => {
  const { telegramId, photoUrls, setPhotoUrls } = useStartForm();

  const initialPhotos = photoUrls || new Array(6).fill(null);
  const [photos, setPhotos] = useState<(string | null)[]>(initialPhotos);

  const [uploading, setUploading] = useState(false);
  

  const isNextDisabled = photos.filter((photo) => photo !== null).length >= 3;

  const handleNext = async () => {
    const payload = { telegramId, photoUrls: photos };
    const response = await fetch('/api/request/photos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    console.log('API response:', data);
  };

  return (
    <Page back={true}>
      <section className="h-full w-full flex flex-col gap-4">
        <h2 className="text-3xl font-extrabold uppercase text-black flex justify-center items-center">
          📷 загрузите фото
        </h2>
        <span className="text-slate-700 text-lg font-bold text-center border-3 !border-slate-700 p-2 rounded-md">
          Загрузите минимум 3 фото: спереди, сзади и сбоку.
        </span>
        <UploadPhotos
          photoUrls={photos}
          setPhotoUrls={setPhotos}
          uploading={uploading}
          setUploading={setUploading}
        />
        <FooterButton nextPath="/request/form" isNextDisabled={isNextDisabled} onNext={handleNext} />
      </section>
    </Page>
  );
};

export default PhotosPage;
