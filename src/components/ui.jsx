export function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function Card({ className = "", children }) {
  return (
    <div className={cx("rounded-3xl border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200 p-6 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-xl font-semibold text-slate-900">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-slate-600">{subtitle}</div> : null}
      </div>
      {right ? <div className="mt-2 md:mt-0">{right}</div> : null}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={cx("p-6", className)}>{children}</div>;
}

export function Button({ className = "", variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    ghost: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    soft: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  };
  return <button className={cx(base, styles[variant], className)} {...props} />;
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={cx(
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-slate-300",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={cx(
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function PillTabs({ value, onChange, tabs }) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cx(
            "rounded-xl px-4 py-2 text-sm transition",
            value === t.value ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
