/**
 * 업종별 시세 조회 API 라우트
 *
 * GET /api/stock/sector              - 주요 업종 전체 조회
 * GET /api/stock/sector?codes=0013,0009 - 특정 업종코드 조회
 *
 * 주요 업종 매핑:
 *   0001: 종합(코스피)     0013: 전기전자 (반도체)
 *   1001: 종합(코스닥)     0009: 의약품 (바이오)
 *   0015: 운수장비 (조선)  0008: 화학
 *   0011: 철강금속         0018: 건설업
 *   0021: 금융업           0020: 통신업
 *   0016: 유통업           0026: 서비스업
 *   0012: 기계             0002: 대형주
 *
 * 응답:
 * {
 *   success: boolean,
 *   data: SectorData[],
 *   timestamp: number
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getSectorData, MAJOR_SECTOR_MAP, SECTOR_CODES } from "@/lib/kis";

/** 응답 캐시 헤더 (15초 캐시) */
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codesParam = searchParams.get("codes");

    let sectorCodes: string[];

    if (codesParam) {
      // 특정 업종코드 지정 조회
      sectorCodes = codesParam
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      // 유효한 업종코드인지 검증
      const invalidCodes = sectorCodes.filter((c) => !SECTOR_CODES[c]);
      if (invalidCodes.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `알 수 없는 업종코드: ${invalidCodes.join(", ")}`,
            availableCodes: SECTOR_CODES,
          },
          { status: 400 }
        );
      }
    } else {
      // 기본: 주요 업종 전체 조회 (코스피/코스닥 제외, 개별 업종만)
      sectorCodes = Object.entries(MAJOR_SECTOR_MAP)
        .filter(([name]) => name !== "코스피" && name !== "코스닥")
        .map(([, code]) => code);
    }

    // 최대 15개 업종 제한 (Rate Limit 보호)
    if (sectorCodes.length > 15) {
      return NextResponse.json(
        {
          success: false,
          error: "한 번에 최대 15개 업종까지 조회할 수 있습니다.",
        },
        { status: 400 }
      );
    }

    const data = await getSectorData(sectorCodes);

    return NextResponse.json(
      {
        success: true,
        data,
        sectorMap: MAJOR_SECTOR_MAP,
        timestamp: Date.now(),
      },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error("[/api/stock/sector] 에러:", error);

    const message =
      error instanceof Error ? error.message : "업종 데이터 조회 중 오류가 발생했습니다.";
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500;

    return NextResponse.json(
      { success: false, error: message },
      { status: statusCode }
    );
  }
}
