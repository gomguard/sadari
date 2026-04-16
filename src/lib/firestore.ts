import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ============================================================
// 타입 정의
// ============================================================

/** 매매 시그널 */
export interface FirestoreSignal {
  id?: string;
  stockName: string;
  ticker: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  status: "active" | "hit_target" | "hit_stoploss" | "holding";
  sector: string;
  date: string; // 언급일
  exitDate?: string;
  returnPct?: number;
  memo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** 데일리 매크로 */
export interface FirestoreDaily {
  id?: string;
  date: string;
  mood: "bullish" | "bearish" | "neutral";
  haseulComment: string;
  summary: string[]; // 세줄요약
  indicators: { label: string; value: string; up: boolean }[];
  actions: {
    type: "watch" | "buy" | "caution" | "target";
    content: string;
  }[];
  createdAt: Timestamp;
}

/** 아티클 / 콘텐츠 */
export interface FirestoreArticle {
  id?: string;
  title: string;
  description: string;
  category: string;
  content?: string;
  isPremium: boolean;
  date: string;
  createdAt: Timestamp;
}

// ============================================================
// 컬렉션 참조
// ============================================================

const signalsCol = collection(db, "signals");
const dailiesCol = collection(db, "dailies");
const articlesCol = collection(db, "articles");

// ============================================================
// Signals CRUD — 매매 시그널
// ============================================================

/** 시그널 추가 */
export async function addSignal(
  data: Omit<FirestoreSignal, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(signalsCol, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/** 시그널 수정 */
export async function updateSignal(
  id: string,
  data: Partial<Omit<FirestoreSignal, "id" | "createdAt">>
): Promise<void> {
  const ref = doc(db, "signals", id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** 시그널 삭제 */
export async function deleteSignal(id: string): Promise<void> {
  const ref = doc(db, "signals", id);
  await deleteDoc(ref);
}

/** 전체 시그널 조회 (최신순) */
export async function getSignals(): Promise<FirestoreSignal[]> {
  const q = query(signalsCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreSignal);
}

/** 활성 시그널만 조회 */
export async function getActiveSignals(): Promise<FirestoreSignal[]> {
  const q = query(
    signalsCol,
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreSignal);
}

/** 단일 시그널 조회 */
export async function getSignalById(
  id: string
): Promise<FirestoreSignal | null> {
  const ref = doc(db, "signals", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FirestoreSignal;
}

// ============================================================
// Dailies CRUD — 데일리 매크로
// ============================================================

/** 데일리 추가 */
export async function addDaily(
  data: Omit<FirestoreDaily, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(dailiesCol, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** 데일리 수정 */
export async function updateDaily(
  id: string,
  data: Partial<Omit<FirestoreDaily, "id" | "createdAt">>
): Promise<void> {
  const ref = doc(db, "dailies", id);
  await updateDoc(ref, { ...data });
}

/** 데일리 삭제 */
export async function deleteDaily(id: string): Promise<void> {
  const ref = doc(db, "dailies", id);
  await deleteDoc(ref);
}

/** 데일리 목록 조회 (날짜 내림차순, limit 지원) */
export async function getDailies(
  count?: number
): Promise<FirestoreDaily[]> {
  const constraints = [orderBy("date", "desc")] as Parameters<typeof query>[1][];
  if (count) constraints.push(firestoreLimit(count));

  const q = query(dailiesCol, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreDaily);
}

/** 최신 데일리 1건 조회 */
export async function getLatestDaily(): Promise<FirestoreDaily | null> {
  const q = query(dailiesCol, orderBy("date", "desc"), firestoreLimit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as FirestoreDaily;
}

// ============================================================
// Articles CRUD — 아티클 / 콘텐츠
// ============================================================

/** 아티클 추가 */
export async function addArticle(
  data: Omit<FirestoreArticle, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(articlesCol, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** 아티클 수정 */
export async function updateArticle(
  id: string,
  data: Partial<Omit<FirestoreArticle, "id" | "createdAt">>
): Promise<void> {
  const ref = doc(db, "articles", id);
  await updateDoc(ref, { ...data });
}

/** 아티클 삭제 */
export async function deleteArticle(id: string): Promise<void> {
  const ref = doc(db, "articles", id);
  await deleteDoc(ref);
}

/** 아티클 목록 조회 (카테고리 필터 지원) */
export async function getArticles(
  category?: string
): Promise<FirestoreArticle[]> {
  const constraints = [orderBy("createdAt", "desc")] as Parameters<typeof query>[1][];
  if (category) constraints.push(where("category", "==", category));

  const q = query(articlesCol, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreArticle);
}

/** 단일 아티클 조회 */
export async function getArticleById(
  id: string
): Promise<FirestoreArticle | null> {
  const ref = doc(db, "articles", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FirestoreArticle;
}

// ============================================================
// 커뮤니티 게시판 (Community Board)
// ============================================================

export interface FirestoreCommunityPost {
  id?: string;
  nickname: string;
  title: string;
  content: string;
  category: "자유" | "질문" | "종목토론" | "수익인증";
  likes: number;
  commentCount: number;
  createdAt: Timestamp;
}

export interface FirestoreCommunityComment {
  id?: string;
  postId: string;
  nickname: string;
  content: string;
  likes: number;
  createdAt: Timestamp;
}

const postsCol = collection(db, "communityPosts");
const commentsCol = collection(db, "communityComments");

/** 게시글 추가 */
export async function addPost(
  data: Omit<FirestoreCommunityPost, "id" | "createdAt" | "likes" | "commentCount">
): Promise<string> {
  const docRef = await addDoc(postsCol, {
    ...data,
    likes: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** 게시글 목록 조회 (최신순, 카테고리 필터·limit 지원) */
export async function getPosts(
  category?: string,
  count?: number
): Promise<FirestoreCommunityPost[]> {
  const constraints = [orderBy("createdAt", "desc")] as Parameters<typeof query>[1][];
  if (category) constraints.push(where("category", "==", category));
  if (count) constraints.push(firestoreLimit(count));

  const q = query(postsCol, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreCommunityPost);
}

/** 단일 게시글 조회 */
export async function getPostById(
  id: string
): Promise<FirestoreCommunityPost | null> {
  const ref = doc(db, "communityPosts", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FirestoreCommunityPost;
}

/** 게시글 삭제 */
export async function deletePost(id: string): Promise<void> {
  const ref = doc(db, "communityPosts", id);
  await deleteDoc(ref);
}

/** 게시글 좋아요 (increment) */
export async function likePost(id: string): Promise<void> {
  const ref = doc(db, "communityPosts", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = snap.data().likes ?? 0;
  await updateDoc(ref, { likes: current + 1 });
}

/** 댓글 추가 */
export async function addComment(
  data: Omit<FirestoreCommunityComment, "id" | "createdAt" | "likes">
): Promise<string> {
  const docRef = await addDoc(commentsCol, {
    ...data,
    likes: 0,
    createdAt: serverTimestamp(),
  });
  // increment commentCount on the post
  const postRef = doc(db, "communityPosts", data.postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    const current = postSnap.data().commentCount ?? 0;
    await updateDoc(postRef, { commentCount: current + 1 });
  }
  return docRef.id;
}

/** 댓글 목록 조회 (오래된순) */
export async function getComments(
  postId: string
): Promise<FirestoreCommunityComment[]> {
  const q = query(
    commentsCol,
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreCommunityComment);
}

/** 댓글 삭제 */
export async function deleteComment(id: string): Promise<void> {
  const ref = doc(db, "communityComments", id);
  await deleteDoc(ref);
}

/** 댓글 좋아요 (increment) */
export async function likeComment(id: string): Promise<void> {
  const ref = doc(db, "communityComments", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = snap.data().likes ?? 0;
  await updateDoc(ref, { likes: current + 1 });
}

// ============================================================
// 사용자 프로필 (User Profile)
// ============================================================

export interface FirestoreUserProfile {
  uid: string;
  nickname: string;
  contact: string;
  sectors: string[];
  updatedAt: Timestamp;
}

/** 사용자 프로필 조회 */
export async function getUserProfile(
  uid: string
): Promise<FirestoreUserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as FirestoreUserProfile;
}

/** 사용자 프로필 저장 (생성 또는 업데이트) */
export async function saveUserProfile(
  uid: string,
  data: Omit<FirestoreUserProfile, "uid" | "updatedAt">
): Promise<void> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } else {
    const { setDoc } = await import("firebase/firestore");
    await setDoc(ref, {
      uid,
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
}

// ============================================================
// 회원 관리 (User Management - Admin)
// ============================================================

/** 전체 사용자 목록 조회 */
export async function getAllUsers(): Promise<FirestoreUserProfile[]> {
  const usersCol = collection(db, "users");
  const snapshot = await getDocs(usersCol);
  return snapshot.docs.map(
    (d) => ({ uid: d.id, ...d.data() }) as FirestoreUserProfile
  );
}

/** 사용자 정지 처리 */
export async function suspendUser(uid: string): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { suspended: true });
}

/** 사용자 정지 해제 */
export async function unsuspendUser(uid: string): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { suspended: false });
}

/** 사용자 프로필 삭제 (Firestore 문서만 삭제 — Firebase Auth 계정 삭제는 Firebase Admin SDK 필요) */
export async function deleteUserProfile(uid: string): Promise<void> {
  const ref = doc(db, "users", uid);
  await deleteDoc(ref);
}
