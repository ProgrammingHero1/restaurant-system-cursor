"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/menu", label: "Menu" },
  { href: "/dashboard/tables", label: "Tables" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/reservations", label: "Reservations" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/staff", label: "Staff" },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href, exact) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="w-56 min-h-full bg-base-300 flex flex-col">
      <div className="p-4 border-b border-base-content/10">
        <Link href="/dashboard" className="font-bold text-lg">
          Admin
        </Link>
        <p className="text-xs opacity-60 mt-1">Restaurant dashboard</p>
      </div>
      <ul className="menu p-4 flex-1">
        {navItems.map(({ href, label, exact }) => (
          <li key={href}>
            <Link
              href={href}
              className={isActive(href, exact) ? "active font-semibold" : ""}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t border-base-content/10">
        <Link href="/" className="btn btn-ghost btn-sm w-full">
          View site
        </Link>
      </div>
    </aside>
  );
}
