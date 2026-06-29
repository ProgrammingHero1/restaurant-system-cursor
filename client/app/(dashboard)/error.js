"use client";

export default function DashboardError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-center">
      <div role="alert" className="alert alert-error max-w-md mb-6">
        <span>{error?.message || "Something went wrong loading this page."}</span>
      </div>
      <button type="button" className="btn btn-primary" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
