export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-base-300 p-4 hidden md:block">
        <p className="font-bold text-sm uppercase opacity-60">Dashboard</p>
        <p className="text-xs mt-2 opacity-50">Sidebar — coming in T-016.</p>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
