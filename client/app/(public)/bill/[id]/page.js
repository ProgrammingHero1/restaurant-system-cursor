import BillSummary from "@/components/public/BillSummary";
import EmptyState from "@/components/ui/EmptyState";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function BillPage({ params, searchParams }) {
  const { id } = await params;
  const { payment } = await searchParams;
  let bill = null;
  let error = null;

  try {
    bill = await api.get(`/api/bills/${id}`);
  } catch (err) {
    error = err.message || "Bill not found";
  }

  const paymentResult =
    payment === "success" || payment === "canceled" ? payment : null;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {error || !bill ? (
        <EmptyState
          title="Bill not found"
          description={error || "This bill may have been removed or the link is invalid."}
        />
      ) : (
        <BillSummary bill={bill} paymentResult={paymentResult} />
      )}
    </div>
  );
}
