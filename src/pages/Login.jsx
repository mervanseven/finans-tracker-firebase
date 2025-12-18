import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { Button, Card, CardBody, Input } from "../components/ui";

function niceMsg(err) {
  const code = err?.code || "";
  if (code === "auth/invalid-credential") return "E-posta veya şifre hatalı.";
  if (code === "auth/too-many-requests") return "Çok fazla deneme yapıldı. Lütfen bekleyin.";
  return "Giriş yapılırken bir hata oluştu.";
}

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pw);
      nav("/");
    } catch (e) {
      setErr(niceMsg(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#0f172a] px-4 py-12 overflow-hidden">
        
        {/* Turkuaz Dekoratif Işıklar */}
        <div className="absolute -top-24 -left-24 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full bg-cyan-600/10 blur-[120px]" />

        <div className="relative w-full max-w-[480px]">
          
          {/* Başlık ve Finans Mesajı */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-7 w-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white italic">
              Finansal Takip
            </h1>
            <p className="mt-3 text-slate-400 font-medium">
              Gelir ve giderlerini <span className="text-cyan-400">tek ekranda</span> akıllıca yönet.
            </p>
          </div>

          <Card className="border-white/10 bg-slate-900/60 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardBody className="p-10">
              <form onSubmit={onSubmit} className="space-y-6">
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500/80 ml-1">Kullanıcı Hesabı</label>
                    <Input 
                      type="email"
                      required
                      className="h-14 border-none bg-white text-slate-900 placeholder:text-slate-400 font-semibold text-lg rounded-2xl focus:ring-4 focus:ring-cyan-500/20 transition-all"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="e-posta@adresiniz.com" 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500/80">Güvenli Şifre</label>
                    </div>
                    <Input 
                      required
                      className="h-14 border-none bg-white text-slate-900 placeholder:text-slate-400 font-semibold text-lg rounded-2xl focus:ring-4 focus:ring-cyan-500/20 transition-all"
                      value={pw} 
                      onChange={(e) => setPw(e.target.value)} 
                      type="password" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                {err && (
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-400 border border-red-500/20 animate-in fade-in duration-300">
                    <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]" />
                    {err}
                  </div>
                )}

                <Button 
                  type="submit"
                  className="group relative w-full h-16 overflow-hidden rounded-2xl bg-cyan-500 text-slate-950 font-black text-xl uppercase tracking-tighter transition-all hover:bg-cyan-400 hover:scale-[1.02] active:scale-95 shadow-xl shadow-cyan-500/20" 
                  disabled={loading}
                >
                  <div className="flex items-center justify-center gap-3">
                    {loading ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-3 border-slate-950/30 border-t-slate-950" />
                    ) : (
                      <>
                        <span>Giriş Yap</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </div>
                </Button>

                <div className="pt-2 text-center text-sm font-bold">
                  <span className="text-slate-500">Hesabın yok mu?</span>{" "}
                  <Link className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/30 underline-offset-4 transition-colors" to="/register">
                    Kayıt Ol
                  </Link>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}