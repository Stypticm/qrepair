'''
'use client'

import { useState, useEffect, useRef } from 'react'
import { getPictureUrl } from '@/core/lib/assets'
import { Button } from '@/components/ui/button'

interface CameraWithOverlayProps {
  onPhotoCapture: (blob: Blob) => void
  overlayImage: string
}

export const CameraWithOverlay = ({ onPhotoCapture, overlayImage }: CameraWithOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mediaStream: MediaStream | null = null

    const getCameraStream = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Use the back camera
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error("Error accessing camera: ", err)
        if (err instanceof Error) {
            if (err.name === 'NotAllowedError') {
                setError('Доступ к камере запрещен. Пожалуйста, разрешите доступ в настройках браузера.')
            } else if (err.name === 'NotFoundError') {
                setError('Камера не найдена. Убедитесь, что она подключена и исправна.')
            } else {
                setError(`Ошибка доступа к камере: ${err.message}`)
            }
        } else {
            setError('Произошла неизвестная ошибка при доступе к камере.')
        }
      }
    }

    getCameraStream()

    // Cleanup function to stop the stream when the component unmounts
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Set canvas dimensions to match the video stream
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the current video frame onto the canvas
      const context = canvas.getContext('2d')
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert the canvas image to a Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            onPhotoCapture(blob)
          }
        },
        'image/jpeg',
        0.9 // Image quality
      )
    }
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4 text-center rounded-lg">
        <p className="text-red-600 font-semibold">Ошибка</p>
        <p className="text-gray-700 mt-2">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Попробовать снова</Button>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <img
        src={getPictureUrl(overlayImage)}
        alt="Overlay"
        className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none mix-blend-mode-lighten"
      />
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
        <Button onClick={handleTakePhoto} className="w-20 h-20 rounded-full bg-white text-black border-4 border-gray-300 hover:bg-gray-200">
          Снять
        </Button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
'''