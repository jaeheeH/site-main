// apps/web/app/(dashboard)/admin/users/utils/userUtils.ts

/**
 * 활동 로그 액션 라벨 변환
 */
export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    'login': '로그인',
    'logout': '로그아웃',
    'create_post': '게시글 작성',
    'update_post': '게시글 수정',
    'delete_post': '게시글 삭제',
    'create_comment': '댓글 작성',
    'update_profile': '프로필 수정',
  }
  return labels[action] || action
}

/**
 * 역할명을 한글로 변환
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    'admin': '관리자',
    'editor': '편집자',
    'user': '사용자',
  }
  return labels[role] || role
}

/**
 * 기본 역할인지 확인
 */
export function isDefaultRole(roleName: string): boolean {
  return ['admin', 'editor', 'user'].includes(roleName)
}

/**
 * 기본 권한 구조 생성
 */
export function createDefaultPermissions() {
  return {
    dashboard: false,
    users: false,
    content: {
      read: false,
      write: false,
      update: false,
      delete: false,
    },
    media: false,
    settings: false,
  }
}

/**
 * 권한 데이터 정규화
 */
export function normalizePermissions(permissions: any) {
  const defaultPermissions = createDefaultPermissions()

  if (!permissions) return defaultPermissions

  // {"all": "true"} 형태 처리
  if (permissions.all === "true" || permissions.all === true) {
    return {
      dashboard: true,
      users: true,
      content: {
        read: true,
        write: true,
        update: true,
        delete: true,
      },
      media: true,
      settings: true,
    }
  }

  // 일반적인 권한 구조
  return {
    dashboard: permissions.dashboard || false,
    users: permissions.users || false,
    content: {
      read: permissions.content?.read || false,
      write: permissions.content?.write || false,
      update: permissions.content?.update || false,
      delete: permissions.content?.delete || false,
    },
    media: permissions.media || false,
    settings: permissions.settings || false,
  }
}