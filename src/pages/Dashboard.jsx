import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

import { auth, db } from "../firebase";
import AppShell from "../components/AppShell";
import TopBar from "../components/TopBar";
import { Button, Input, PillTabs, Select, cx } from "../components/ui";

const EXPENSE_CATS = ["Market", "Ulaşım", "Fatura", "Kira", "Eğlence", "Sağlık", "Diğer"];
const INCOME_CATS = ["Maaş", "Prim", "Emeklilik", "Kira Geliri", "Freelance", "Burs", "Diğer"];
const COLORS = ["#22d3ee", "#818cf8", "#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#94a3b8"];

function money(n) {
  return Number(n || 0).toLocaleString("tr-TR");
}
function monthNow() {
  return new Date().toISOString().slice(0, 7);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function sum(arr) {
  return arr.reduce((s, x) => s + Number(x || 0), 0);
}

// ---- küçük UI parçaları ----
function ShellCard({ children, className = "" }) {
  return (
    <div className={cx("rounded-3xl border border-white/10 bg-slate-900/55 p-6 backdrop-blur", className)}>
      {children}
    </div>
  );
}

function Kpi({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-rose-300" : "text-cyan-200";

  return (
    <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</div>
      <div className={cx("mt-2 text-3xl font-semibold", toneClass)}>{money(value)} ₺</div>
    </div>
  );
}

export default function Dashboard() {
  const user = auth.currentUser;

  // Basit yükleniyor ekranı (sade)
  if (!user) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center bg-[#0b1220]">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400" />
        </div>
      </AppShell>
    );
  }

  // Sekmeler
  const [page, setPage] = useState("overview"); // overview | charts | table
  const [tab, setTab] = useState("all"); // all | income | expense

  // Form
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState(EXPENSE_CATS[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  // Filtre
  const [qText, setQText] = useState("");
  const [month, setMonth] = useState(monthNow());

  // Firestore
  const txCol = useMemo(() => collection(db, "transactions"), []);
  const txQuery = useMemo(() => query(txCol, where("uid", "==", user.uid), orderBy("date", "desc")), [txCol, user.uid]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      txQuery,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        console.error(err);
        alert(err.message);
      }
    );
    return () => unsub();
  }, [txQuery]);

  // kategori uyumu
  useEffect(() => {
    const list = type === "expense" ? EXPENSE_CATS : INCOME_CATS;
    if (!list.includes(category)) setCategory(list[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // stats
  const incomeSum = sum(items.filter((x) => x.type === "income").map((x) => Number(x.amount || 0)));
  const expenseSum = sum(items.filter((x) => x.type === "expense").map((x) => Number(x.amount || 0)));
  const net = incomeSum - expenseSum;

  // tablo filtre
  const tabFiltered = tab === "all" ? items : items.filter((x) => x.type === tab);
  const visibleItems = tabFiltered.filter((x) => {
    const t = (qText || "").trim().toLowerCase();
    const hay = `${x.category || ""} ${x.note || ""} ${(x.date || "")}`.toLowerCase();
    return t ? hay.includes(t) : true;
  });

  // grafik verileri (seçili ay)
  const monthItems = items.filter((x) => (x.date || "").slice(0, 7) === month);

  const dailyMap = new Map();
  for (const it of monthItems) {
    const d = it.date || "";
    if (!d) continue;
    if (!dailyMap.has(d)) dailyMap.set(d, { date: d, income: 0, expense: 0 });
    const row = dailyMap.get(d);
    if (it.type === "income") row.income += Number(it.amount || 0);
    if (it.type === "expense") row.expense += Number(it.amount || 0);
  }
  const dailySeries = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const pieExpenseMap = new Map();
  const pieIncomeMap = new Map();
  for (const it of monthItems) {
    const key = it.category || "Diğer";
    if (it.type === "expense") pieExpenseMap.set(key, (pieExpenseMap.get(key) || 0) + Number(it.amount || 0));
    if (it.type === "income") pieIncomeMap.set(key, (pieIncomeMap.get(key) || 0) + Number(it.amount || 0));
  }
  const pieExpense = Array.from(pieExpenseMap.entries()).map(([name, value]) => ({ name, value }));
  const pieIncome = Array.from(pieIncomeMap.entries()).map(([name, value]) => ({ name, value }));

  async function addItem(e) {
    e.preventDefault();
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) return alert("Tutarı kontrol et.");

    setBusy(true);
    try {
      await addDoc(txCol, {
        uid: user.uid,
        type,
        amount: num,
        category,
        date,
        note: note.trim(),
        createdAt: Date.now(),
      });
      setAmount("");
      setNote("");
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeTx(id) {
  const ok = window.confirm("Bu işlemi silmek istiyor musun?");
  if (!ok) return;

  await deleteDoc(doc(db, "transactions", id));
}

  const helloName = (user.displayName || "").trim();
  const title = helloName ? `Merhaba, ${helloName}` : "Finans Takibi";

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0b1220] pb-16">
        <TopBar />

        <div className="mx-auto max-w-6xl px-4 pt-10">
          {/* header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
              <div className="mt-1 text-sm text-slate-400">Kayıt ekle, görüntüle, takip et.</div>
            </div>

            <PillTabs
              value={page}
              onChange={setPage}
              tabs={[
                { value: "overview", label: "Özet" },
                { value: "charts", label: "Grafikler" },
                { value: "table", label: "İşlemler" },
              ]}
            />
          </div>

          <div className="grid gap-7">
            {/* form */}
            <ShellCard>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-base font-semibold text-white">Yeni işlem</div>
                  <div className="mt-1 text-sm text-slate-400">Gelir veya gider ekleyebilirsin.</div>
                </div>

                <PillTabs
                  value={type}
                  onChange={setType}
                  tabs={[
                    { value: "expense", label: "Gider" },
                    { value: "income", label: "Gelir" },
                  ]}
                />
              </div>

              <form onSubmit={addItem} className="mt-5 grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                <div className="md:col-span-1">
                  <div className="mb-2 text-xs font-medium text-slate-400">Tutar</div>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    inputMode="decimal"
                    className="h-12 rounded-2xl border-none bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div className="md:col-span-1">
                  <div className="mb-2 text-xs font-medium text-slate-400">Tarih</div>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12 rounded-2xl border-none bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="mb-2 text-xs font-medium text-slate-400">Kategori</div>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-12 rounded-2xl border-none bg-white text-slate-900 font-semibold"
                  >
                    {(type === "expense" ? EXPENSE_CATS : INCOME_CATS).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <div className="mb-2 text-xs font-medium text-slate-400">Not</div>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="İstersen kısa bir not ekle"
                    className="h-12 rounded-2xl border-none bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div className="md:col-span-4 lg:col-span-6">
                  <Button
                    disabled={busy}
                    className="h-12 w-full rounded-2xl bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400"
                  >
                    {busy ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </form>
            </ShellCard>

            {/* overview */}
            {page === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Kpi label="Toplam Gelir" value={incomeSum} tone="good" />
                  <Kpi label="Toplam Gider" value={expenseSum} tone="bad" />
                  <Kpi label="Net" value={net} tone={net >= 0 ? "neutral" : "bad"} />
                </div>

                <ShellCard className="flex items-center justify-between gap-4">
                  <div className="text-sm text-slate-300">
                    İstersen “Grafikler” sekmesinden ay seçip detaylara bakabilirsin.
                  </div>
                  <Button variant="ghost" onClick={() => setPage("charts")} className="rounded-2xl">
                    Grafikleri aç
                  </Button>
                </ShellCard>
              </div>
            )}

            {/* charts */}
            {page === "charts" && (
              <div className="space-y-7">
                <ShellCard>
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <div className="text-base font-semibold text-white">Aylık trend</div>
                      <div className="mt-1 text-sm text-slate-400">Seçili ay: {month}</div>
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-medium text-slate-400">Ay</div>
                      <Input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="h-11 w-44 rounded-2xl border-none bg-white text-slate-900 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="mt-5 h-[290px] w-full">
                    {dailySeries.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        Bu ay için kayıt yok.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailySeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" vertical={false} />
                          <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            fontSize={11}
                            tickFormatter={(val) => val.split("-")[2]}
                          />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#ffffffff",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                              borderRadius: "14px",
                              fontSize: "12px",
                              color: "#e2e8f0",
                            }}
                          />
                          <Line type="monotone" dataKey="income" name="Gelir" stroke="#22d3ee" strokeWidth={3} dot={false} />
                          <Line type="monotone" dataKey="expense" name="Gider" stroke="#fb7185" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </ShellCard>

                <div className="grid gap-7 lg:grid-cols-2">
                  <ShellCard>
                    <div className="text-base font-semibold text-white">Gider dağılımı</div>
                    <div className="mt-5 h-[260px]">
                      {pieExpense.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">Veri yok.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieExpense} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                              {pieExpense.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#ffffffff",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "14px",
                                fontSize: "12px",
                                color: "#e2e8f0",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </ShellCard>

                  <ShellCard>
                    <div className="text-base font-semibold text-white">Gelir dağılımı</div>
                    <div className="mt-5 h-[260px]">
                      {pieIncome.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">Veri yok.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieIncome} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                              {pieIncome.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#ffffffff",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "14px",
                                fontSize: "12px",
                                color: "#e2e8f0",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </ShellCard>
                </div>
              </div>
            )}

            {/* table */}
            {page === "table" && (
              <ShellCard className="p-0 overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-white/10 p-6 md:flex-row md:items-center md:justify-between">
                  <div className="text-base font-semibold text-white">İşlemler</div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <PillTabs
                      value={tab}
                      onChange={setTab}
                      tabs={[
                        { value: "all", label: "Hepsi" },
                        { value: "income", label: "Gelir" },
                        { value: "expense", label: "Gider" },
                      ]}
                    />

                    <Input
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      placeholder="Ara..."
                      className="h-11 w-full rounded-2xl border-none bg-white text-slate-900 font-semibold md:w-64"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto p-3">
                  {visibleItems.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">Henüz işlem yok.</div>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                          <th className="p-4">Tarih</th>
                          <th className="p-4">Kategori</th>
                          <th className="p-4">Not</th>
                          <th className="p-4 text-right">Tutar</th>
                          <th className="p-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {visibleItems.map((it) => (
                          <tr key={it.id} className="hover:bg-white/[0.03]">
                            <td className="p-4 text-slate-400 font-mono text-xs">{it.date}</td>
                            <td className="p-4 font-medium text-white">{it.category}</td>
                            <td className="p-4 text-slate-400">{it.note || "-"}</td>
                            <td
                              className={cx(
                                "p-4 text-right font-semibold",
                                it.type === "income" ? "text-cyan-300" : "text-rose-300"
                              )}
                            >
                              {it.type === "income" ? "+" : "-"}
                              {money(it.amount)} ₺
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => removeTx(it.id)}
                                className="text-slate-500 hover:text-rose-300 transition"
                              >
                                Sil
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </ShellCard>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
