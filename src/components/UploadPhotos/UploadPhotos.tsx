"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import SafeImage from "@/components/ui/safe-image";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteImageFromSupabase } from "@/core/lib/deleteImageFromSupabase";
import { uploadImageToSupabase } from "@/core/lib/uploadImageToSupabase";

type PhotoLabel = {
  id: number;
  text: string;
  pic: string;
};

type Props = {
  photoUrls: (string | null)[];
  setPhotoUrls: (urls: (string | null)[]) => void;
  photoLoading: boolean[];
  setPhotoLoading: (loading: boolean[]) => void;
};

export default function UploadPhotos({
  photoUrls,
  setPhotoUrls,
  photoLoading,
  setPhotoLoading,
}: Props) {
  const inputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const photoLabels: PhotoLabel[] = [
    { id: 0, text: "спереди", pic: "/front.png" },
    { id: 1, text: "сзади", pic: "/back.png" },
    { id: 2, text: "сбоку", pic: "/right_side.png" },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const newLoading = [...photoLoading];
    newLoading[index] = true;
    setPhotoLoading(newLoading);

    try {
      const preview = URL.createObjectURL(file);
      const newPhotos = [...photoUrls];
      newPhotos[index] = preview;
      setPhotoUrls(newPhotos);

      const url = await uploadImageToSupabase(file);
      newPhotos[index] = url; // заменяем на постоянную URL
      setPhotoUrls(newPhotos);
    } catch (error) {
      console.error(error);
      const newPhotos = [...photoUrls];
      newPhotos[index] = null;
      setPhotoUrls(newPhotos);
    } finally {
      const newLoading = [...photoLoading];
      newLoading[index] = false;
      setPhotoLoading(newLoading);
      e.target.value = "";
    }
  };

  const deleteImage = async (index: number) => {
    if (!photoUrls[index]) return;

    const newLoading = [...photoLoading];
    newLoading[index] = true;
    setPhotoLoading(newLoading);

    try {
      await deleteImageFromSupabase(photoUrls[index]!);
      const newPhotos = [...photoUrls];
      newPhotos[index] = null;
      setPhotoUrls(newPhotos);
    } catch (error) {
      console.error(error);
    } finally {
      const newLoading = [...photoLoading];
      newLoading[index] = false;
      setPhotoLoading(newLoading);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        {photoLabels.slice(0, 2).map((item, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="relative flex items-center justify-center">
              {photoUrls[index] ? (
                <>
                  <SafeImage
                    src={photoUrls[index]}
                    alt={`${item.text} фото`}
                    width={120}
                    height={120}
                    className="rounded-sm h-full w-full object-cover"
                  />
                  <X
                    className="text-red-600 cursor-pointer absolute top-1 right-1"
                    onClick={() => deleteImage(index)}
                  />
                </>
              ) : photoLoading[index] ? (
                <div className="w-full h-full flex justify-center items-center bg-gray-100 text-gray-500 font-bold">
                  Загрузка...
                </div>
              ) : (
                <SafeImage
                  src={item.pic}
                  alt={item.text}
                  width={150}
                  height={150}
                  className="object-cover rounded-md cursor-pointer"
                  onClick={() => inputRefs[index]?.current?.click()}
                />
              )}
              <Input
                type="file"
                ref={inputRefs[index]}
                onChange={(e) => handleFileChange(e, index)}
                className="hidden"
                disabled={photoLoading[index]}
              />
            </div>
            <Label className="text-black font-bold text-xl flex justify-center items-center">
              {item.text}
            </Label>
          </div>
        ))}
      </div>

      <div className="flex justify-center w-full">
        {photoLabels.slice(2).map((item, index) => (
          <div key={index + 2} className="flex flex-col gap-2">
            <div className="relative flex items-center justify-center">
              {photoUrls[index + 2] ? (
                <>
                  <SafeImage
                    src={photoUrls[index + 2]!}
                    alt={`${item.text} фото`}
                    width={200}
                    height={150}
                    className="rounded-md w-full h-full object-cover"
                  />
                  <X
                    className="text-red-600 cursor-pointer absolute top-1 right-1"
                    onClick={() => deleteImage(index + 2)}
                  />
                </>
              ) : photoLoading[index + 2] ? (
                <div className="w-full h-full flex justify-center items-center bg-gray-100 text-gray-500 font-bold">
                  Загрузка...
                </div>
              ) : (
                <SafeImage
                  src={item.pic}
                  alt={item.text}
                  width={200}
                  height={150}
                  className="object-cover rounded-md w-full cursor-pointer"
                  onClick={() => inputRefs[index + 2]?.current?.click()}
                />
              )}
              <Input
                type="file"
                ref={inputRefs[index + 2]}
                onChange={(e) => handleFileChange(e, index + 2)}
                className="hidden"
                disabled={photoLoading[index + 2]}
              />
            </div>
            <Label className="text-black font-bold text-xl flex justify-center items-center">
              {item.text}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
