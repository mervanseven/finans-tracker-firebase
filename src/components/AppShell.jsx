export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      {children}
    </div>
  );
}
