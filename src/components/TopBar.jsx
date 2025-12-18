import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Button } from "./ui";

export default function TopBar() {
  const u = auth.currentUser;

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        
        {/* LOGO */}
        <div className="group flex items-center gap-3 cursor-pointer">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full
                       bg-cyan-500/15 ring-1 ring-cyan-400/30
                       transition group-hover:bg-cyan-500/25"
          >
            <span className="text-cyan-400 text-lg font-bold">₺</span>
          </div>

          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-tight text-white">
              Finance Tracker
            </div>
            <div className="text-xs text-slate-400">
              {u?.displayName || u?.email}
            </div>
          </div>
        </div>

        {/* ÇIKIŞ */}
        <Button
          variant="ghost"
          onClick={() => signOut(auth)}
          className="rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
        >
          Çıkış
        </Button>
      </div>
    </header>
  );
}
