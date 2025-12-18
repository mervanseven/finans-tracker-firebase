import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

const PrefsCtx = createContext(null);

const DEFAULT_PREFS = {
  theme: "dark",
  accent: "emerald",
  currency: "TRY",
  defaultMonth: "auto",
  showAdvancedFilters: false,
  density: "comfortable",
  categories: {
    expense: ["Market", "Ulaşım", "Fatura", "Kira", "Eğlence", "Sağlık", "Diğer"],
    income: ["Maaş", "Prim", "Emeklilik", "Kira Geliri", "Freelance", "Burs", "Diğer"],
  },
};

function monthNow() {
  return new Date().toISOString().slice(0, 7);
}

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;

    const ref = doc(db, "users", u.uid);

    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        // ilk kez oluştur
        await setDoc(ref, {
          ...DEFAULT_PREFS,
          displayName: u.displayName || "",
          createdAt: Date.now(),
        });
        setPrefs(DEFAULT_PREFS);
        setReady(true);
        return;
      }
      setPrefs({ ...DEFAULT_PREFS, ...snap.data() });
      setReady(true);
    });

    return () => unsub();
  }, []);

  // Tema CSS class uygulaması (body’ye)
  useEffect(() => {
    document.documentElement.classList.toggle("theme-light", prefs.theme === "light");
  }, [prefs.theme]);

  const api = useMemo(() => ({
    prefs,
    ready,
    setPref: async (patch) => {
      const u = auth.currentUser;
      if (!u) return;
      const ref = doc(db, "users", u.uid);
      await setDoc(ref, patch, { merge: true });
    },
    getEffectiveMonth: () => (prefs.defaultMonth === "auto" ? monthNow() : prefs.defaultMonth),
  }), [prefs, ready]);

  return <PrefsCtx.Provider value={api}>{children}</PrefsCtx.Provider>;
}

export function usePrefs() {
  const v = useContext(PrefsCtx);
  if (!v) throw new Error("usePrefs must be used within PreferencesProvider");
  return v;
}
