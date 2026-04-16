/**
 * 카카오톡 알림 서비스 모듈
 *
 * ====================================================================
 * [카카오 알림톡 API 개요]
 * ====================================================================
 *
 * 카카오에서 제공하는 메시지 발송 방식:
 *
 * 1. 알림톡 (Alimtalk) - 가장 추천
 *    - 카카오톡 비즈니스 채널을 통해 정보성 메시지를 발송
 *    - 사용자가 채널을 추가하지 않아도 수신 가능 (전화번호 기반)
 *    - 템플릿 사전 심사 필요 (카카오 비즈니스 센터에서 등록)
 *    - 건당 약 8~10원 (NHN Cloud, 비즈엠 등 공식 대행사 이용)
 *    - 주식 시그널, 데일리 매크로 등 정보 알림에 최적
 *
 * 2. 친구톡 (FriendTalk)
 *    - 카카오톡 채널을 추가한 친구에게만 발송 가능
 *    - 광고성 메시지 발송 가능 (알림톡과의 차이점)
 *    - 이미지, 와이드형 등 다양한 메시지 형식 지원
 *    - 건당 약 15~20원
 *
 * 3. 카카오톡 채널 메시지 (구 플러스친구 메시지)
 *    - Kakao Developers에서 직접 API 호출
 *    - 채널 추가한 사용자에게만 발송
 *    - REST API로 직접 호출 가능
 *
 * ====================================================================
 * [사전 준비 사항]
 * ====================================================================
 *
 * 1. 카카오 비즈니스 채널 개설
 *    - https://center-pf.kakao.com 에서 채널 생성
 *    - 비즈니스 채널 전환 (사업자등록증 필요)
 *
 * 2. 알림톡 발송 대행사 선택 (택 1)
 *    - NHN Cloud (구 Toast): https://www.nhncloud.com/kr/service/notification/alimtalk
 *    - 비즈엠 (BizM): https://www.bizmsg.kr
 *    - 센드버드, 인포뱅크 등
 *    → 이 모듈에서는 NHN Cloud 기준으로 구현
 *
 * 3. 메시지 템플릿 등록 및 심사
 *    - 카카오 비즈니스 센터에서 템플릿 등록
 *    - 심사 승인까지 약 1~3 영업일 소요
 *    - 템플릿 코드가 발급되면 API에서 사용
 *
 * 4. 환경 변수 설정 (.env.local)
 *    - KAKAO_REST_API_KEY: 카카오 REST API 키
 *    - KAKAO_SENDER_KEY: 발신 프로필 키 (카카오 비즈니스 센터에서 확인)
 *    - KAKAO_ALIMTALK_API_URL: 알림톡 API 엔드포인트
 *    - KAKAO_ALIMTALK_APP_KEY: NHN Cloud 앱 키 (대행사 사용 시)
 *    - KAKAO_ALIMTALK_SECRET_KEY: NHN Cloud 시크릿 키
 *    - KAKAO_TEMPLATE_SIGNAL: 시그널 알림 템플릿 코드
 *    - KAKAO_TEMPLATE_DAILY: 데일리 매크로 템플릿 코드
 *    - KAKAO_TEMPLATE_ARTICLE: 아티클 알림 템플릿 코드
 *
 * ====================================================================
 */

import {
  formatSignalMessage,
  formatDailyMacroMessage,
  formatArticleMessage,
} from "./kakao-templates";

// ====================================================================
// 타입 정의
// ====================================================================

/** 시그널 데이터 */
export interface SignalData {
  stockName: string;
  sector: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  currentPrice: number;
  status: "active" | "hit_target" | "hit_stoploss" | "holding";
  memo: string;
  date: string;
}

/** 데일리 매크로 데이터 */
export interface DailyMacroData {
  date: string;
  summary: string[]; // 세줄요약
  marketSentiment: "매우긍정" | "긍정" | "중립" | "부정" | "매우부정";
  keyIndicators?: {
    kospi?: string;
    kosdaq?: string;
    usdKrw?: string;
    nasdaq?: string;
  };
  commentary?: string;
}

/** 아티클 데이터 */
export interface ArticleData {
  title: string;
  category: string;
  excerpt: string;
  link: string;
  isPremium: boolean;
}

/** 알림톡 발송 요청 */
export interface AlimtalkRequest {
  templateCode: string;
  recipientList: AlimtalkRecipient[];
}

/** 알림톡 수신자 */
export interface AlimtalkRecipient {
  recipientNo: string; // 수신자 전화번호 (예: 01012345678)
  templateParameter: Record<string, string>; // 템플릿 변수
}

/** 알림톡 발송 결과 */
export interface AlimtalkResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  failedRecipients?: string[];
}

/** 발송 콘텐츠 타입 */
export type ContentType = "signal" | "daily" | "article";

// ====================================================================
// 환경 변수 검증
// ====================================================================

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `환경 변수 ${key}가 설정되지 않았습니다. .env.local 파일을 확인하세요.`
    );
  }
  return value;
}

/** 카카오 API 설정값 로드 */
function getKakaoConfig() {
  return {
    restApiKey: getEnvVar("KAKAO_REST_API_KEY"),
    senderKey: getEnvVar("KAKAO_SENDER_KEY"),
    apiUrl: getEnvVar("KAKAO_ALIMTALK_API_URL"),
    appKey: getEnvVar("KAKAO_ALIMTALK_APP_KEY"),
    secretKey: getEnvVar("KAKAO_ALIMTALK_SECRET_KEY"),
    templates: {
      signal: getEnvVar("KAKAO_TEMPLATE_SIGNAL"),
      daily: getEnvVar("KAKAO_TEMPLATE_DAILY"),
      article: getEnvVar("KAKAO_TEMPLATE_ARTICLE"),
    },
  };
}

// ====================================================================
// 알림톡 발송 함수
// ====================================================================

/**
 * 알림톡 발송 (NHN Cloud 기준)
 *
 * NHN Cloud 알림톡 API를 사용하여 메시지를 발송합니다.
 * 실제 운영 시에는 대행사(NHN Cloud, 비즈엠 등)의 API 문서를 참고하여
 * 엔드포인트와 요청 형식을 맞춰야 합니다.
 *
 * @param templateCode - 카카오 비즈니스 센터에서 승인받은 템플릿 코드
 * @param recipients - 수신자 목록 (전화번호 + 템플릿 변수)
 * @returns 발송 결과
 */
export async function sendAlimtalk(
  templateCode: string,
  recipients: AlimtalkRecipient[]
): Promise<AlimtalkResponse> {
  try {
    const config = getKakaoConfig();

    // NHN Cloud 알림톡 API 엔드포인트
    // 실제 URL: https://api-alimtalk.cloud.toast.com/alimtalk/v2.3/appkeys/{appKey}/messages
    const url = `${config.apiUrl}/alimtalk/v2.3/appkeys/${config.appKey}/messages`;

    const requestBody = {
      senderKey: config.senderKey,
      templateCode: templateCode,
      recipientList: recipients.map((r) => ({
        recipientNo: r.recipientNo,
        templateParameter: r.templateParameter,
      })),
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "X-Secret-Key": config.secretKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[카카오 알림톡] API 오류:", response.status, errorText);
      return {
        success: false,
        error: `API 호출 실패 (${response.status}): ${errorText}`,
      };
    }

    const result = await response.json();

    // NHN Cloud 응답 형식 처리
    if (result.header?.isSuccessful) {
      return {
        success: true,
        messageId: result.message?.requestId,
      };
    } else {
      return {
        success: false,
        error: result.header?.resultMessage || "알 수 없는 오류",
      };
    }
  } catch (error) {
    console.error("[카카오 알림톡] 발송 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알림톡 발송 중 오류 발생",
    };
  }
}

// ====================================================================
// 콘텐츠별 알림톡 발송 헬퍼
// ====================================================================

/**
 * 시그널 알림톡 발송
 *
 * 새로운 시그널이 등록되면 회원들에게 카카오톡 알림을 보냅니다.
 * 템플릿 변수에 종목명, 진입가, 목표가, 손절가 등을 포함합니다.
 */
export async function sendSignalNotification(
  signal: SignalData,
  recipientPhoneNumbers: string[]
): Promise<AlimtalkResponse> {
  const config = getKakaoConfig();
  const templateParams = formatSignalMessage(signal);

  const recipients: AlimtalkRecipient[] = recipientPhoneNumbers.map(
    (phone) => ({
      recipientNo: phone.replace(/-/g, ""), // 하이픈 제거
      templateParameter: templateParams,
    })
  );

  return sendAlimtalk(config.templates.signal, recipients);
}

/**
 * 데일리 매크로 알림톡 발송
 *
 * 데일리 매크로 포스트가 발행되면 회원들에게 알림을 보냅니다.
 */
export async function sendDailyMacroNotification(
  daily: DailyMacroData,
  recipientPhoneNumbers: string[]
): Promise<AlimtalkResponse> {
  const config = getKakaoConfig();
  const templateParams = formatDailyMacroMessage(daily);

  const recipients: AlimtalkRecipient[] = recipientPhoneNumbers.map(
    (phone) => ({
      recipientNo: phone.replace(/-/g, ""),
      templateParameter: templateParams,
    })
  );

  return sendAlimtalk(config.templates.daily, recipients);
}

/**
 * 아티클 알림톡 발송
 *
 * 새로운 아티클(웹진)이 발행되면 회원들에게 알림을 보냅니다.
 */
export async function sendArticleNotification(
  article: ArticleData,
  recipientPhoneNumbers: string[]
): Promise<AlimtalkResponse> {
  const config = getKakaoConfig();
  const templateParams = formatArticleMessage(article);

  const recipients: AlimtalkRecipient[] = recipientPhoneNumbers.map(
    (phone) => ({
      recipientNo: phone.replace(/-/g, ""),
      templateParameter: templateParams,
    })
  );

  return sendAlimtalk(config.templates.article, recipients);
}

// ====================================================================
// 수신자 목록 조회 (Firestore 연동)
// ====================================================================

/**
 * 알림 수신 동의한 회원의 전화번호 목록을 조회합니다.
 *
 * TODO: Firestore에서 알림 수신 동의한 사용자 목록을 가져오도록 구현
 * - users 컬렉션에서 kakaoNotification: true 인 사용자 필터링
 * - 유료 회원만 필터링하는 옵션 추가
 */
export async function getNotificationRecipients(
  _options: { premiumOnly?: boolean } = {}
): Promise<string[]> {
  // TODO: Firestore 연동 후 실제 구현
  // const usersRef = collection(db, 'users');
  // const q = query(usersRef, where('kakaoNotification', '==', true));
  // if (options.premiumOnly) {
  //   q = query(q, where('membership', '==', 'premium'));
  // }
  // const snapshot = await getDocs(q);
  // return snapshot.docs.map(doc => doc.data().phoneNumber);

  console.warn(
    "[카카오 알림톡] Firestore 연동 전이므로 빈 수신자 목록을 반환합니다."
  );
  return [];
}
