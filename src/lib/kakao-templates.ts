/**
 * 카카오톡 알림톡 메시지 템플릿
 *
 * ====================================================================
 * [템플릿 등록 안내]
 * ====================================================================
 *
 * 알림톡 발송을 위해서는 카카오 비즈니스 센터에서 메시지 템플릿을
 * 사전 등록하고 심사를 받아야 합니다.
 *
 * 1. 카카오 비즈니스 센터 접속: https://business.kakao.com
 * 2. 내 채널 → 알림톡 관리 → 템플릿 등록
 * 3. 아래 템플릿 내용을 등록하고 심사 요청
 * 4. 심사 완료 후 발급된 템플릿 코드를 .env.local에 설정
 *
 * 템플릿 변수는 #{변수명} 형식으로 작성합니다.
 * 예: #{stockName}, #{entryPrice} 등
 *
 * ====================================================================
 */

import type { SignalData, DailyMacroData, ArticleData } from "./kakao";

// ====================================================================
// 시그널 알림 템플릿
// ====================================================================

/**
 * 시그널 메시지 템플릿 파라미터 생성
 *
 * 카카오 비즈니스 센터에 등록할 템플릿 예시:
 * ─────────────────────────────
 * [사다리] 새 시그널 알림 📊
 *
 * 종목: #{stockName} (#{sector})
 * 진입가: #{entryPrice}원
 * 목표가: #{targetPrice}원 (#{targetPercent})
 * 손절가: #{stopLoss}원 (#{stopPercent})
 *
 * 💬 #{memo}
 *
 * ※ 본 정보는 투자 참고용이며, 투자 판단의
 * 최종 책임은 투자자 본인에게 있습니다.
 * ─────────────────────────────
 */
export function formatSignalMessage(
  signal: SignalData
): Record<string, string> {
  // 목표 수익률 계산
  const targetPercent =
    signal.entryPrice > 0
      ? (
          ((signal.targetPrice - signal.entryPrice) / signal.entryPrice) *
          100
        ).toFixed(1)
      : "0.0";

  // 손절률 계산
  const stopPercent =
    signal.entryPrice > 0
      ? (
          ((signal.stopLoss - signal.entryPrice) / signal.entryPrice) *
          100
        ).toFixed(1)
      : "0.0";

  return {
    stockName: signal.stockName,
    sector: signal.sector,
    entryPrice: signal.entryPrice.toLocaleString("ko-KR"),
    targetPrice: signal.targetPrice.toLocaleString("ko-KR"),
    targetPercent: `+${targetPercent}%`,
    stopLoss: signal.stopLoss.toLocaleString("ko-KR"),
    stopPercent: `${stopPercent}%`,
    memo: signal.memo || "추가 코멘트 없음",
    date: signal.date,
  };
}

/**
 * 시그널 알림톡에 등록할 전체 템플릿 텍스트 (참고용)
 *
 * 이 텍스트를 카카오 비즈니스 센터 템플릿 등록 시 본문으로 사용하세요.
 * #{변수명} 은 카카오 알림톡 템플릿 변수 규격입니다.
 */
export const SIGNAL_TEMPLATE_TEXT = `[사다리] 새 시그널 알림

📊 종목: #{stockName} (#{sector})

💰 진입가: #{entryPrice}원
🎯 목표가: #{targetPrice}원 (#{targetPercent})
🛑 손절가: #{stopLoss}원 (#{stopPercent})

💬 #{memo}

※ 본 정보는 투자 참고용이며, 투자 판단의 최종 책임은 투자자 본인에게 있습니다.`;

// ====================================================================
// 데일리 매크로 템플릿
// ====================================================================

/**
 * 데일리 매크로 메시지 템플릿 파라미터 생성
 *
 * 카카오 비즈니스 센터에 등록할 템플릿 예시:
 * ─────────────────────────────
 * [사다리] 오늘의 시장 브리핑 🌅
 *
 * 📅 #{date}
 *
 * 📌 세줄요약
 * 1. #{summary1}
 * 2. #{summary2}
 * 3. #{summary3}
 *
 * 🧭 시장 심리: #{sentiment}
 *
 * 📈 주요 지표
 * KOSPI #{kospi} | KOSDAQ #{kosdaq}
 * USD/KRW #{usdKrw} | NASDAQ #{nasdaq}
 *
 * 자세한 내용은 사다리에서 확인하세요.
 * ─────────────────────────────
 */
export function formatDailyMacroMessage(
  daily: DailyMacroData
): Record<string, string> {
  const sentimentEmoji: Record<string, string> = {
    매우긍정: "🟢🟢",
    긍정: "🟢",
    중립: "🟡",
    부정: "🔴",
    매우부정: "🔴🔴",
  };

  return {
    date: daily.date,
    summary1: daily.summary[0] || "-",
    summary2: daily.summary[1] || "-",
    summary3: daily.summary[2] || "-",
    sentiment: `${sentimentEmoji[daily.marketSentiment] || ""} ${daily.marketSentiment}`,
    kospi: daily.keyIndicators?.kospi || "-",
    kosdaq: daily.keyIndicators?.kosdaq || "-",
    usdKrw: daily.keyIndicators?.usdKrw || "-",
    nasdaq: daily.keyIndicators?.nasdaq || "-",
  };
}

/**
 * 데일리 매크로 알림톡에 등록할 전체 템플릿 텍스트 (참고용)
 */
export const DAILY_TEMPLATE_TEXT = `[사다리] 오늘의 시장 브리핑

📅 #{date}

📌 세줄요약
1. #{summary1}
2. #{summary2}
3. #{summary3}

🧭 시장 심리: #{sentiment}

📈 주요 지표
KOSPI #{kospi} | KOSDAQ #{kosdaq}
USD/KRW #{usdKrw} | NASDAQ #{nasdaq}

자세한 내용은 사다리에서 확인하세요.`;

// ====================================================================
// 아티클 알림 템플릿
// ====================================================================

/**
 * 아티클 메시지 템플릿 파라미터 생성
 *
 * 카카오 비즈니스 센터에 등록할 템플릿 예시:
 * ─────────────────────────────
 * [사다리] 새 아티클 발행 📰
 *
 * 📂 #{category}
 * 📝 #{title}
 *
 * #{excerpt}
 *
 * 👉 자세히 보기: #{link}
 * ─────────────────────────────
 */
export function formatArticleMessage(
  article: ArticleData
): Record<string, string> {
  // 요약문이 너무 길면 잘라내기 (알림톡 본문 최대 1000자)
  const maxExcerptLength = 200;
  const excerpt =
    article.excerpt.length > maxExcerptLength
      ? article.excerpt.substring(0, maxExcerptLength) + "..."
      : article.excerpt;

  return {
    title: article.title,
    category: article.category,
    excerpt: excerpt,
    link: article.link,
    badge: article.isPremium ? "PRO" : "",
  };
}

/**
 * 아티클 알림톡에 등록할 전체 템플릿 텍스트 (참고용)
 */
export const ARTICLE_TEMPLATE_TEXT = `[사다리] 새 아티클 발행 📰

📂 #{category} #{badge}
📝 #{title}

#{excerpt}

👉 자세히 보기: #{link}`;
