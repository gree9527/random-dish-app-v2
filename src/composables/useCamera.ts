import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import imageCompression from 'browser-image-compression'
import { useFilesystem } from './useFilesystem'

export interface PhotoResult {
  imagePath: string
  thumbnailPath: string
  imageUrl: string
  thumbnailUrl: string
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function compressImage(file: File, maxWidth: number, quality: number): Promise<File> {
  return imageCompression(file, {
    maxWidthOrHeight: maxWidth,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: quality,
  })
}

export function useCamera() {
  const fs = useFilesystem()

  async function takePhoto(): Promise<PhotoResult | null> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        quality: 90,
      })

      if (!photo.path && !photo.webPath) return null

      // Read original image as blob
      const response = await fetch(photo.webPath || photo.path!)
      const blob = await response.blob()
      const originalFile = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })

      // Compress original (~1000px)
      const compressedFile = await compressImage(originalFile, 1000, 0.7)
      const compressedBase64 = await fileToBase64(compressedFile)
      const imageName = `dish-${Date.now()}.jpg`
      const imagePath = await fs.writeImage(imageName, compressedBase64)

      // Generate thumbnail (~300px)
      const thumbnailFile = await compressImage(originalFile, 300, 0.6)
      const thumbnailBase64 = await fileToBase64(thumbnailFile)
      const thumbnailName = `thumb-${Date.now()}.jpg`
      const thumbnailPath = await fs.writeThumbnail(thumbnailName, thumbnailBase64)

      return {
        imagePath,
        thumbnailPath,
        imageUrl: fs.convertToWebPath(imagePath),
        thumbnailUrl: fs.convertToWebPath(thumbnailPath),
      }
    } catch (e) {
      console.error('Camera error:', e)
      return null
    }
  }

  async function pickFromInput(file: File): Promise<PhotoResult | null> {
    try {
      const compressedFile = await compressImage(file, 1000, 0.7)
      const compressedBase64 = await fileToBase64(compressedFile)
      const imageName = `dish-${Date.now()}.jpg`
      const imagePath = await fs.writeImage(imageName, compressedBase64)

      const thumbnailFile = await compressImage(file, 300, 0.6)
      const thumbnailBase64 = await fileToBase64(thumbnailFile)
      const thumbnailName = `thumb-${Date.now()}.jpg`
      const thumbnailPath = await fs.writeThumbnail(thumbnailName, thumbnailBase64)

      return {
        imagePath,
        thumbnailPath,
        imageUrl: fs.convertToWebPath(imagePath),
        thumbnailUrl: fs.convertToWebPath(thumbnailPath),
      }
    } catch (e) {
      console.error('Image processing error:', e)
      return null
    }
  }

  return { takePhoto, pickFromInput }
}
