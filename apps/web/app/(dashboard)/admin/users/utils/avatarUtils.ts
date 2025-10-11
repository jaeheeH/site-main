// apps/web/app/(dashboard)/admin/users/utils/avatarUtils.ts

import imageCompression from 'browser-image-compression'
import { supabase } from '@/shared/api/supabaseClient'

/**
 * 아바타 URL에서 파일 경로 추출
 */
export function extractAvatarPath(avatarUrl: string): string | null {
  const urlParts = avatarUrl.split('/avatars/')
  if (urlParts.length > 1) {
    return urlParts[1].split('?')[0]
  }
  return null
}

/**
 * 스토리지에서 아바타 삭제
 */
export async function deleteAvatarFromStorage(avatarUrl: string): Promise<void> {
  const filePath = extractAvatarPath(avatarUrl)
  if (!filePath) return

  const { error } = await supabase.storage
    .from('avatars')
    .remove([filePath])

  if (error) {
    throw error
  }
}

/**
 * 이미지를 정사각형으로 크롭
 */
export async function cropImageToSquare(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      const { width, height } = img
      
      // 정사각형 크기 결정 (작은 쪽 기준)
      const size = Math.min(width, height)
      
      canvas.width = size
      canvas.height = size

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // 크롭 위치 계산
      let sx = 0
      let sy = 0

      if (width > height) {
        // 가로가 더 긴 경우 - 가운데 기준으로 양옆 자르기
        sx = (width - height) / 2
        sy = 0
      } else {
        // 세로가 더 긴 경우 - 위에서부터 자르기
        sx = 0
        sy = 0
      }

      // 이미지 크롭
      ctx.drawImage(
        img,
        sx, sy, size, size,  // 원본 이미지에서 자를 영역
        0, 0, size, size     // 캔버스에 그릴 영역
      )

      // Canvas를 Blob으로 변환
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'))
          return
        }

        // Blob을 File로 변환
        const croppedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })

        resolve(croppedFile)
      }, 'image/jpeg', 0.95)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // 이미지 로드
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 이미지 파일 압축
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 400,
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
  }

  console.log('원본 파일 크기:', (file.size / 1024 / 1024).toFixed(2), 'MB')

  const compressedFile = await imageCompression(file, options)

  console.log('압축 후 파일 크기:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB')

  return compressedFile
}

/**
 * 아바타 이미지 업로드
 */
export async function uploadAvatar(
  file: File,
  userId: string,
  existingAvatarUrl?: string
): Promise<string> {
  // 1. 기존 아바타 삭제
  if (existingAvatarUrl) {
    try {
      await deleteAvatarFromStorage(existingAvatarUrl)
      console.log('기존 아바타 삭제 완료')
    } catch (error) {
      console.warn('기존 아바타 삭제 실패:', error)
    }
  }

  // 2. 이미지 정사각형으로 크롭
  console.log('이미지 크롭 중...')
  const croppedFile = await cropImageToSquare(file)
  console.log('크롭 완료')

  // 3. 이미지 압축
  const compressedFile = await compressImage(croppedFile)

  // 4. 파일명 생성
  const fileName = `${userId}_${Date.now()}.jpg`

  // 5. 업로드
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, compressedFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg'
    })

  if (uploadError) throw uploadError

  // 6. Public URL 가져오기
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  return publicUrl
}