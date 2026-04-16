"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Firebase Auth가 설정되기 전에는 로딩만 해제
    let unsubscribe: () => void = () => {};
    try {
      const { auth } = require("@/lib/firebase");
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          const token = await firebaseUser.getIdTokenResult();
          setIsPremium(!!token.claims.premium);
        } else {
          setIsPremium(false);
        }
        setLoading(false);
      });
    } catch {
      // Firebase 미설정 시 로딩 해제, 비로그인 상태로 진행
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
