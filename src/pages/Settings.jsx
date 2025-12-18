import AppShell from "../components/AppShell";
import TopBar from "../components/TopBar";
import { Button, Card, CardBody, CardHeader, Input, Select } from "../components/ui";
import { usePrefs } from "../prefs/PreferencesContext";
import { useMemo, useState } from "react";

export default function Settings() {
  const { prefs, ready, setPref } = usePrefs();

  const [newExpenseCat, setNewExpenseCat] = useState("");
  const [newIncomeCat, setNewIncomeCat] = useState("");

  const currencies = useMemo(() => ([
    { v: "TRY", label: "₺ TRY" },
    { v: "USD", label: "$ USD" },
    { v: "EUR", label: "€ EUR" },
  ]), []);

  if (!ready) {
    return (
      <AppShell>
        <div className="p-8 text-slate-200">Ayarlar yükleniyor…</div>
      </AppShell>
    );
  }

  const expenseCats = prefs.categories?.expense ?? [];
  const incomeCats = prefs.categories?.income ?? [];

  const addCat = async (type, value) => {
    const v = value.trim();
    if (!v) return;
    const next = Array.from(new Set([...(prefs.categories?.[type] ?? []), v]));
    await setPref({ categories: { ...prefs.categories, [type]: next } });
  };

  const removeCat = async (type, value) => {
    const next = (prefs.categories?.[type] ?? []).filter((x) => x !== value);
    await setPref({ categories: { ...prefs.categories, [type]: next } });
  };

  return (
    <AppShell>
      <TopBar />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Card>
          <CardHeader
            title="Ayarlar"
            subtitle="Uygulamayı kendine göre kişiselleştir. (Tema, para birimi, filtre davranışı, kategoriler)"
            right={
              <a href="/" className="text-sm text-slate-300 hover:text-white">
                ← Panele dön
              </a>
            }
          />
          <CardBody>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
                <div className="text-lg font-semibold">Genel</div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-slate-300">Tema</div>
                    <Select
                      value={prefs.theme}
                      onChange={(e) => setPref({ theme: e.target.value })}
                    >
                      <option value="dark">Koyu</option>
                      <option value="light">Açık</option>
                    </Select>
                  </div>

                  <div>
                    <div className="text-xs text-slate-300">Para Birimi</div>
                    <Select
                      value={prefs.currency}
                      onChange={(e) => setPref({ currency: e.target.value })}
                    >
                      {currencies.map((c) => (
                        <option key={c.v} value={c.v}>{c.label}</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <div className="text-xs text-slate-300">Varsayılan Ay</div>
                    <Select
                      value={prefs.defaultMonth}
                      onChange={(e) => setPref({ defaultMonth: e.target.value })}
                    >
                      <option value="auto">Otomatik (bulunduğun ay)</option>
                      <option value="2025-12">2025-12</option>
                      <option value="2026-01">2026-01</option>
                    </Select>
                    <div className="mt-1 text-xs text-slate-400">
                      İstersen bunu sonra dinamik ay seçiciye çeviririz.
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-300">Liste Yoğunluğu</div>
                    <Select
                      value={prefs.density}
                      onChange={(e) => setPref({ density: e.target.value })}
                    >
                      <option value="comfortable">Rahat</option>
                      <option value="compact">Sıkı</option>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold">Filtre Davranışı</div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-300">Gelişmiş filtreler açık başlasın</div>
                    <Button
                      variant="ghost"
                      onClick={() => setPref({ showAdvancedFilters: !prefs.showAdvancedFilters })}
                    >
                      {prefs.showAdvancedFilters ? "Açık" : "Kapalı"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
                <div className="text-lg font-semibold">Kategoriler</div>
                <div className="mt-1 text-sm text-slate-300">
                  Gelir ve gider kategorilerini kendine göre düzenle.
                </div>

                <div className="mt-5 grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold">Gider</div>
                    <div className="mt-2 flex gap-2">
                      <Input value={newExpenseCat} onChange={(e) => setNewExpenseCat(e.target.value)} placeholder="Yeni gider kategorisi" />
                      <Button
                        onClick={async () => {
                          await addCat("expense", newExpenseCat);
                          setNewExpenseCat("");
                        }}
                      >
                        Ekle
                      </Button>
                    </div>

                    <div className="mt-3 space-y-2">
                      {expenseCats.map((c) => (
                        <div key={c} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                          <div className="text-sm">{c}</div>
                          <Button variant="ghost" onClick={() => removeCat("expense", c)}>Sil</Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold">Gelir</div>
                    <div className="mt-2 flex gap-2">
                      <Input value={newIncomeCat} onChange={(e) => setNewIncomeCat(e.target.value)} placeholder="Yeni gelir kategorisi" />
                      <Button
                        onClick={async () => {
                          await addCat("income", newIncomeCat);
                          setNewIncomeCat("");
                        }}
                      >
                        Ekle
                      </Button>
                    </div>

                    <div className="mt-3 space-y-2">
                      {incomeCats.map((c) => (
                        <div key={c} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                          <div className="text-sm">{c}</div>
                          <Button variant="ghost" onClick={() => removeCat("income", c)}>Sil</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-400">
                  Kategoriler kaydedilir ve Dashboard’da otomatik görünür.
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
