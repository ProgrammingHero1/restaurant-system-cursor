"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/menu", label: "Menu" },
  { href: "/dashboard/tables", label: "Tables" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/reservations", label: "Reservations" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/staff", label: "Staff" },
];

export default function DashboardNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-4 min-h-14">
      <div className="navbar-start">
        <div className="dropdown md:hidden">
          <button type="button" tabIndex={0} className="btn btn-ghost btn-sm">
            Menu
          </button>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
          >
            {navItems.map(({ href, label, exact }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={
                    (exact ? pathname === href : pathname.startsWith(href))
                      ? "active"
                      : ""
                  }
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <span className="text-sm font-medium md:hidden ml-2">Admin</span>
      </div>
      <div className="flex-1 hidden md:block" />
      <div className="navbar-end gap-3">
        {session?.user?.email && (
          <span className="text-sm text-base-content/70 hidden sm:inline">
            {session.user.email}
          </span>
        )}
        <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
