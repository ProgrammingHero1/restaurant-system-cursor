"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/reserve", label: "Reserve" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      <div className="navbar-start">
        <div className="dropdown">
          <button
            type="button"
            tabIndex={0}
            className="btn btn-ghost lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {open && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
            >
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} onClick={() => setOpen(false)}>
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Staff Login
                </Link>
              </li>
            </ul>
          )}
        </div>
        <Link href="/" className="btn btn-ghost text-xl font-bold">
          Restaurant
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={pathname === href ? "active font-semibold" : ""}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end">
        <Link href="/login" className="btn btn-ghost btn-sm">
          Staff Login
        </Link>
      </div>
    </div>
  );
}
