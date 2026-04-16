import { auth } from "./firebase";
import {
  signInWithPopup,
  OAuthProvider,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from "firebase/auth";

/**
 * ============================================================
 * 카카오 로그인 (Firebase OIDC Provider)
 * ============================================================
 *
 * Firebase는 카카오를 네이티브 소셜 로그인으로 지원하지 않으므로,
 * OIDC(OpenID Connect) 커스텀 프로바이더를 통해 연동합니다.
 *
 * 🔧 Firebase Console 설정 방법:
 *
 * 1. Kakao Developers (https://developers.kakao.com) 에서 앱 생성
 *    - 앱 설정 > 플랫폼 > Web 사이트 도메인 등록
 *    - 제품 설정 > 카카오 로그인 > 활성화
 *    - 제품 설정 > 카카오 로그인 > Redirect URI 등록:
 *      https://{your-project}.firebaseapp.com/__/auth/handler
 *    - 제품 설정 > 카카오 로그인 > 동의항목 > OpenID Connect 활성화
 *    - 앱 키 > REST API 키 (= Client ID)
 *    - 보안 > Client Secret 생성
 *
 * 2. Firebase Console (https://console.firebase.google.com)
 *    - Authentication > Sign-in method > "새 공급업체 추가"
 *    - OpenID Connect 선택
 *    - 공급업체 ID: oidc.kakao (이 코드에서 사용하는 ID와 일치해야 함)
 *    - 이름: Kakao
 *    - Client ID: 카카오 REST API 키
 *    - Issuer URL: https://kauth.kakao.com
 *    - Client Secret: 카카오에서 생성한 Client Secret
 *    - 승인 유형: 코드 흐름 (Authorization Code Flow)
 *
 * 3. 카카오 개발자 콘솔에서 OpenID Connect 동의항목 설정:
 *    - 카카오 로그인 > 동의항목 > openid 필수 동의
 *    - profile_nickname, profile_image, account_email 선택 동의
 *
 * ============================================================
 */
export async function signInWithKakao() {
  const provider = new OAuthProvider("oidc.kakao");

  // 카카오에서 요청할 스코프 (OpenID Connect 필수)
  provider.addScope("openid");
  provider.addScope("profile_nickname");
  provider.addScope("profile_image");
  provider.addScope("account_email");

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: unknown) {
    // 사용자가 팝업을 닫은 경우 에러 무시
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "auth/popup-closed-by-user"
    ) {
      return null;
    }
    console.error("카카오 로그인 에러:", error);
    throw error;
  }
}

/**
 * ============================================================
 * 구글 로그인 (백업 옵션 — 별도 설정 없이 즉시 사용 가능)
 * ============================================================
 *
 * Firebase Console에서 Google 로그인만 활성화하면 바로 사용 가능합니다.
 * Authentication > Sign-in method > Google > 사용 설정
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "auth/popup-closed-by-user"
    ) {
      return null;
    }
    console.error("구글 로그인 에러:", error);
    throw error;
  }
}

/**
 * 로그아웃
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("로그아웃 에러:", error);
    throw error;
  }
}
