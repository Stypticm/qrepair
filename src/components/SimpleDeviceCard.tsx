"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getPictureUrl } from "@/core/lib/assets";
import { Heart, ShoppingCart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DeviceCard } from "./AdaptiveDeviceFeed";

interface SimpleDeviceCardProps {
  cards: DeviceCard[];
  isSingle?: boolean;
}

export function SimpleDeviceCard({ cards, isSingle = false }: SimpleDeviceCardProps) {
  const [previewCard, setPreviewCard] = useState<DeviceCard>(cards[0]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    if (cards.length > 0) {
      setPreviewCard(cards[0]);
      setCurrentPhotoIndex(0);
    }
  }, [cards]);

  const photos = previewCard.photos && previewCard.photos.length > 0 
    ? previewCard.photos 
    : [previewCard.cover || getPictureUrl('display_front_new.png') || '/display_front_new.png'];

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Цена не указана';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <Link
      href={`/catalog/${previewCard.id}`}
      className={cn(
        "bg-white rounded-[24px] border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col group h-full",
        isSingle ? "w-full max-w-[320px] mx-auto" : "w-full"
      )}
    >
      <div className={cn(
        "bg-gradient-to-b from-gray-50/50 to-white flex items-center justify-center relative overflow-hidden",
        isSingle ? "h-64" : "h-44"
      )}>
        <Image
          width={300}
          height={300}
          src={photos[currentPhotoIndex]}
          alt={previewCard.title}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />

        {photos.length > 1 && (
          <div 
            className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-2"
          >
            <div 
              className="w-1/2 h-full cursor-pointer" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
              }}
            />
            <div 
              className="w-1/2 h-full cursor-pointer" 
              onClick={handleNextPhoto}
            />
          </div>
        )}

        {photos.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-20">
            {photos.map((_, idx) => (
              <div 
                key={idx}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  idx === currentPhotoIndex ? "bg-gray-900 w-3" : "bg-gray-300"
                )}
              />
            ))}
          </div>
        )}

        {/* Sale Badge */}
        {previewCard.oldPrice && previewCard.price && previewCard.oldPrice > previewCard.price && (
          <div className="absolute top-3 left-3 bg-[#FF3B30] text-white px-2 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase z-30 shadow-sm animate-in fade-in zoom-in duration-300">
            -{Math.round((1 - previewCard.price / previewCard.oldPrice) * 100)}%
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(previewCard.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm z-30"
        >
          <Heart className={cn("w-4 h-4", isFavorite(previewCard.id) && "fill-current text-red-500")} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Variants row */}
        {cards.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-3" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
            {Array.from(new Set(cards.map(c => c.storage))).filter(Boolean).slice(0, 3).map(storage => {
              const isActive = previewCard.storage === storage;
              const variant = cards.find(c => c.storage === storage && c.color === previewCard.color) || cards.find(c => c.storage === storage);
              return (
                <button
                  key={storage}
                  onClick={() => {
                    if (variant) {
                      setPreviewCard(variant);
                      setCurrentPhotoIndex(0);
                    }
                  }}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-bold rounded-md border transition-all",
                    isActive ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                  )}
                >
                  {storage}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-[13px] leading-tight mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
            {previewCard.title}
          </h3>

          <div className="flex flex-col mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-gray-900 tracking-tight">
                {formatPrice(previewCard.price)}
              </span>
              {previewCard.oldPrice && previewCard.price && previewCard.oldPrice > previewCard.price && (
                <span className="text-[13px] text-gray-300 line-through font-bold decoration-red-500/50">
                  {formatPrice(previewCard.oldPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
