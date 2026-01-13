"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css";

import { cn } from "@/lib/utils";

export type CarouselImage = { src: string; alt: string };

type Props = {
  images: CarouselImage[];
  className?: string;
  showPagination?: boolean;
  showNavigation?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  spaceBetween?: number;
  onIndexChange?: (index: number) => void;
  initialIndex?: number;
  heightPx?: number;
  heightPxMd?: number;
  slideWidthPx?: number;
  slideWidthPxMd?: number;
};

export const Carousel_003: React.FC<Props> = ({
  images,
  className,
  showPagination = false,
  showNavigation = false,
  loop = true,
  autoplay = false,
  spaceBetween = 0,
  onIndexChange,
  initialIndex = 0,
  heightPx = 300,
  heightPxMd = 340,
  slideWidthPx = 260,
  slideWidthPxMd = 300,
}) => {
  const css = `
  .Carousal_003 { width: 100%; height: ${heightPx}px; padding-bottom: 50px !important; }
  .Carousal_003 .swiper-slide { background-position: center; background-size: cover; width: ${slideWidthPx}px; background-color: transparent !important; }
  .Carousal_003 .swiper-slide img { object-fit: contain; background-color: transparent !important; }
  /* Уберём стандартные тени Swiper coverflow */
  .Carousal_003 .swiper-slide-shadow-left,
  .Carousal_003 .swiper-slide-shadow-right { display: none !important; opacity: 0 !important; }
  @media (min-width: 768px) {
    .Carousal_003 { height: ${heightPxMd}px; }
    .Carousal_003 .swiper-slide { width: ${slideWidthPxMd}px; }
  }
  .swiper-pagination-bullet { background-color: #000 !important; }
`;

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn("relative w-full max-w-4xl px-5", className)}
    >
      <style>{css}</style>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="w-full">
        <Swiper
          initialSlide={initialIndex}
          onSlideChange={(swiper) => onIndexChange?.(swiper.realIndex)}
          spaceBetween={spaceBetween}
          autoplay={
            autoplay
              ? { delay: 1800, disableOnInteraction: true }
              : false
          }
          effect="coverflow"
          grabCursor={true}
          slidesPerView="auto"
          centeredSlides={true}
          loop={loop}
          coverflowEffect={{ rotate: 40, stretch: 0, depth: 100, modifier: 1, slideShadows: false }}
          pagination={
            showPagination
              ? { clickable: true }
              : false
          }
          navigation={
            showNavigation
              ? { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
              : false
          }
          className="Carousal_003"
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <img className="h-full w-full object-cover" src={image.src} alt={image.alt} />
            </SwiperSlide>
          ))}
          {showNavigation && (
            <div>
              <div className="swiper-button-next after:hidden">
                <ChevronRightIcon className="h-6 w-6 text-white" />
              </div>
              <div className="swiper-button-prev after:hidden">
                <ChevronLeftIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
        </Swiper>
      </motion.div>
    </motion.div>
  );
};

export default Carousel_003;


