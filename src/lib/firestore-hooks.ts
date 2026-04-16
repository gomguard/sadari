"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  FirestoreSignal,
  FirestoreDaily,
  FirestoreArticle,
} from "@/lib/firestore";

// ============================================================
// 공통 반환 타입
// ============================================================

interface HookResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

// ============================================================
// useSignals — 시그널 실시간 구독
// ============================================================

export function useSignals(
  options?: { status?: string; limit?: number }
): HookResult<FirestoreSignal[]> {
  const [data, setData] = useState<FirestoreSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 옵션을 문자열로 직렬화하여 의존성 배열에 안전하게 사용
  const statusFilter = options?.status;
  const limitCount = options?.limit;

  useEffect(() => {
    const constraints: QueryConstraint[] = [];

    // 상태 필터 (active, holding 등)
    if (statusFilter) {
      constraints.push(where("status", "==", statusFilter));
    }

    constraints.push(orderBy("createdAt", "desc"));

    if (limitCount) {
      constraints.push(firestoreLimit(limitCount));
    }

    const q = query(collection(db, "signals"), ...constraints);

    // 실시간 리스너 등록
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const signals = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as FirestoreSignal
        );
        setData(signals);
        setLoading(false);
      },
      (err) => {
        console.error("시그널 구독 에러:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [statusFilter, limitCount]);

  return { data, loading, error };
}

// ============================================================
// useLatestDaily — 최신 데일리 실시간 구독
// ============================================================

export function useLatestDaily(): HookResult<FirestoreDaily | null> {
  const [data, setData] = useState<FirestoreDaily | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "dailies"),
      orderBy("date", "desc"),
      firestoreLimit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setData(null);
        } else {
          const doc = snapshot.docs[0];
          setData({ id: doc.id, ...doc.data() } as FirestoreDaily);
        }
        setLoading(false);
      },
      (err) => {
        console.error("데일리 구독 에러:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, error };
}

// ============================================================
// useArticles — 아티클 실시간 구독 (카테고리 필터 지원)
// ============================================================

export function useArticles(
  category?: string
): HookResult<FirestoreArticle[]> {
  const [data, setData] = useState<FirestoreArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const constraints: QueryConstraint[] = [];

    if (category) {
      constraints.push(where("category", "==", category));
    }

    constraints.push(orderBy("createdAt", "desc"));

    const q = query(collection(db, "articles"), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const articles = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as FirestoreArticle
        );
        setData(articles);
        setLoading(false);
      },
      (err) => {
        console.error("아티클 구독 에러:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [category]);

  return { data, loading, error };
}
