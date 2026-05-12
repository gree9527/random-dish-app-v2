import JSZip from 'jszip'
import { Share } from '@capacitor/share'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'
import type { Dish } from '../types/dish'
import { useFilesystem } from './useFilesystem'

const BACKUP_FILE_NAME = '今天吃什么-备份'

async function buildZip(dishes: Dish[], fs: ReturnType<typeof useFilesystem>) {
  const zip = new JSZip()
  const meta: { dishes: Dish[]; version: number; exportedAt: number } = {
    dishes,
    version: 1,
    exportedAt: Date.now(),
  }
  zip.file('meta.json', JSON.stringify(meta, null, 2))

  const photosFolder = zip.folder('photos')
  const thumbsFolder = zip.folder('thumbnails')

  for (const dish of dishes) {
    try {
      const imageData = await fs.readFile(dish.imagePath)
      photosFolder?.file(dish.imagePath.split('/').pop()!, imageData.split(',')[1] || imageData, { base64: true })
    } catch {
      // skip missing images
    }
    try {
      const thumbData = await fs.readFile(dish.thumbnailPath)
      thumbsFolder?.file(dish.thumbnailPath.split('/').pop()!, thumbData.split(',')[1] || thumbData, { base64: true })
    } catch {
      // skip missing thumbnails
    }
  }

  return zip
}

export function useBackup() {
  const fs = useFilesystem()

  async function exportBackup(dishes: Dish[]): Promise<Blob> {
    const zip = await buildZip(dishes, fs)
    return zip.generateAsync({ type: 'blob' })
  }

  async function shareBackup(dishes: Dish[]): Promise<{ path: string; shared: boolean }> {
    const zip = await buildZip(dishes, fs)
    const base64Data = await zip.generateAsync({ type: 'base64' })
    const fileName = `${BACKUP_FILE_NAME}-${Date.now()}.zip`

    if (!Capacitor.isNativePlatform()) {
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBackup(blob)
      return { path: '浏览器下载文件夹', shared: false }
    }

    const saved = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
    })

    let shared = false
    try {
      await Share.share({
        title: '今天吃什么-备份',
        files: [saved.uri],
      })
      shared = true
    } catch {
      // 用户取消分享或设备不支持，忽略
    }

    return { path: saved.uri, shared }
  }

  async function importBackup(file: File): Promise<{ dishes: Dish[] }> {
    const zip = await JSZip.loadAsync(file)
    const metaRaw = await zip.file('meta.json')?.async('string')
    if (!metaRaw) throw new Error('备份文件格式错误：缺少 meta.json')

    const meta = JSON.parse(metaRaw)
    const dishes: Dish[] = meta.dishes || []

    // Restore images
    for (const dish of dishes) {
      const imageName = dish.imagePath.split('/').pop()!
      const thumbName = dish.thumbnailPath.split('/').pop()!

      const imageFile = zip.file(`photos/${imageName}`)
      if (imageFile) {
        const data = await imageFile.async('base64')
        dish.imagePath = await fs.writeImage(imageName, `data:image/jpeg;base64,${data}`)
      }

      const thumbFile = zip.file(`thumbnails/${thumbName}`)
      if (thumbFile) {
        const data = await thumbFile.async('base64')
        dish.thumbnailPath = await fs.writeThumbnail(thumbName, `data:image/jpeg;base64,${data}`)
      }
    }

    return { dishes }
  }

  function downloadBackup(blob: Blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${BACKUP_FILE_NAME}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { exportBackup, shareBackup, importBackup, downloadBackup }
}
