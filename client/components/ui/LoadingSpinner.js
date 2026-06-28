export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClass =
    size === "sm" ? "loading-sm" : size === "lg" ? "loading-lg" : "";

  return (
    <div className={`flex justify-center items-center p-8 ${className}`}>
      <span className={`loading loading-spinner loading-primary ${sizeClass}`} />
    </div>
  );
}
