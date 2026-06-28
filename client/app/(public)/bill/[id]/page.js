export default async function BillPage({ params }) {
  const { id } = await params;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Bill</h1>
      <p className="text-base-content/70">Bill #{id} — coming in T-038.</p>
    </div>
  );
}
