/**
 * 카카오톡 알림톡 발송 API 라우트
 *
 * POST /api/kakao/send
 *
 * 관리자가 시그널, 데일리 매크로, 아티클을 발행할 때
 * 이 API를 호출하여 회원들에게 카카오톡 알림을 발송합니다.
 */

import { NextRequest, NextResponse } from "next/server";
import type {
  SignalData,
  DailyMacroData,
  ArticleData,
  ContentType,
} from "@/lib/kakao";
import {
  sendSignalNotification,
  sendDailyMacroNotification,
  sendArticleNotification,
  getNotificationRecipients,
} from "@/lib/kakao";

// ====================================================================
// 요청/응답 타입
// ====================================================================

interface SendNotificationRequest {
  type: ContentType;
  data: SignalData | DailyMacroData | ArticleData;
  /** 특정 수신자만 지정 (선택) - 미지정 시 전체 회원에게 발송 */
  recipients?: string[];
}

// ====================================================================
// 인증 확인 (placeholder)
// ====================================================================

/**
 * 관리자 인증 확인
 *
 * TODO: Firebase Auth 토큰 검증으로 교체
 * - Authorization 헤더에서 Bearer 토큰 추출
 * - Firebase Admin SDK로 토큰 검증
 * - 사용자의 admin 권한 확인 (커스텀 클레임 또는 Firestore)
 */
async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  // TODO: Firebase Admin SDK 연동 후 실제 토큰 검증 구현
  // const token = authHeader.replace("Bearer ", "");
  // const decodedToken = await adminAuth.verifyIdToken(token);
  // const isAdmin = decodedToken.admin === true;
  // return isAdmin;

  // 개발 환경에서는 임시로 true 반환
  if (process.env.NODE_ENV === "development") {
    console.warn("[카카오 API] 개발 모드: 인증 검증 생략");
    return true;
  }

  return false;
}

// ====================================================================
// POST 핸들러
// ====================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. 관리자 인증 확인
    const isAdmin = await verifyAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "권한이 없습니다. 관리자 인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 2. 요청 본문 파싱
    const body: SendNotificationRequest = await request.json();

    if (!body.type || !body.data) {
      return NextResponse.json(
        { success: false, error: "type과 data는 필수 항목입니다." },
        { status: 400 }
      );
    }

    if (!["signal", "daily", "article"].includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "type은 signal, daily, article 중 하나여야 합니다.",
        },
        { status: 400 }
      );
    }

    // 3. 수신자 목록 조회
    const recipients =
      body.recipients ??
      (await getNotificationRecipients({
        premiumOnly: body.type === "signal", // 시그널은 유료 회원만
      }));

    if (recipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "알림을 받을 수신자가 없습니다. 회원 설정을 확인하세요.",
        },
        { status: 400 }
      );
    }

    // 4. 콘텐츠 타입별 발송
    let result;

    switch (body.type) {
      case "signal":
        result = await sendSignalNotification(
          body.data as SignalData,
          recipients
        );
        break;

      case "daily":
        result = await sendDailyMacroNotification(
          body.data as DailyMacroData,
          recipients
        );
        break;

      case "article":
        result = await sendArticleNotification(
          body.data as ArticleData,
          recipients
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: "지원하지 않는 콘텐츠 타입입니다." },
          { status: 400 }
        );
    }

    // 5. 결과 반환
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${recipients.length}명에게 알림톡 발송을 요청했습니다.`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          failedRecipients: result.failedRecipients,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[카카오 API] 처리 중 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알림톡 발송 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
