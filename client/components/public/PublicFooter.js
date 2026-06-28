export default function PublicFooter() {
  return (
    <footer className="footer footer-center bg-base-300 text-base-content p-6 mt-auto">
      <aside>
        <p className="font-semibold">Restaurant Management</p>
        <p className="text-sm opacity-70">
          Browse, order, and reserve — powered by our kitchen team.
        </p>
        <p className="text-xs opacity-50 mt-2">
          © {new Date().getFullYear()} Restaurant
        </p>
      </aside>
    </footer>
  );
}
