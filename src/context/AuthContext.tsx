"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPremium: false,
});

/** 로그인 시 자동으로 Firestore users 컬렉션에 유저 등록 */
async function ensureUserProfile(user: User) {
  try {
    const { db } = await import("@/lib/firebase");
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // 신규 유저 → 자동 생성
      await setDoc(userRef, {
        uid: user.uid,
        nickname: user.displayName || "사다리 멤버",
        phone: "",
        sectors: [],
        photoURL: user.photoURL || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (e) {
    console.error("유저 프로필 자동 생성 실패:", e);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const { auth } = require("@/lib/firebase");
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          const token = await firebaseUser.getIdTokenResult();
          setIsPremium(!!token.claims.premium);
          // 로그인 시 자동으로 유저 프로필 생성/확인
          await ensureUserProfile(firebaseUser);
        } else {
          setIsPremium(false);
        }
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isPremium }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
