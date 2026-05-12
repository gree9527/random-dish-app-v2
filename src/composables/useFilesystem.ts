import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'

const PHOTO_DIR = 'photos'
const THUMB_DIR = 'thumbnails'

const webFileStore = new Map<string, string>()

export function useFilesystem() {
  async function ensureDir(dir: string) {
    try {
      await Filesystem.mkdir({
        path: dir,
        directory: Directory.Data,
        recursive: true,
      })
    } catch (e: any) {
      if (!e.message?.toLowerCase().includes('exist')) throw e
    }
  }

  async function writeImage(fileName: string, data: string): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      const path = `web://${PHOTO_DIR}/${fileName}`
      webFileStore.set(path, data)
      return path
    }
    await ensureDir(PHOTO_DIR)
    const result = await Filesystem.writeFile({
      path: `${PHOTO_DIR}/${fileName}`,
      data,
      directory: Directory.Data,
    })
    return result.uri
  }

  async function writeThumbnail(fileName: string, data: string): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      const path = `web://${THUMB_DIR}/${fileName}`
      webFileStore.set(path, data)
      return path
    }
    await ensureDir(THUMB_DIR)
    const result = await Filesystem.writeFile({
      path: `${THUMB_DIR}/${fileName}`,
      data,
      directory: Directory.Data,
    })
    return result.uri
  }

  async function readFile(path: string): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      const data = webFileStore.get(path)
      if (!data) throw new Error('File not found: ' + path)
      return data.replace(/^data:image\/\w+;base64,/, '')
    }
    const result = await Filesystem.readFile({
      path,
      directory: Directory.Data,
    })
    return result.data as string
  }

  async function deleteFile(path: string) {
    if (!Capacitor.isNativePlatform()) {
      webFileStore.delete(path)
      return
    }
    try {
      await Filesystem.deleteFile({
        path,
        directory: Directory.Data,
      })
    } catch {
      // ignore if not found
    }
  }

  function convertToWebPath(path: string): string {
    if (!path) return ''
    if (Capacitor.isNativePlatform()) {
      return Capacitor.convertFileSrc(path)
    }
    if (webFileStore.has(path)) {
      return webFileStore.get(path)!
    }
    if (path.startsWith('data:') || path.startsWith('blob:')) {
      return path
    }
    return path
  }

  return {
    writeImage,
    writeThumbnail,
    readFile,
    deleteFile,
    convertToWebPath,
  }
}
