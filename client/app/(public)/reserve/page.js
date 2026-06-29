import ReservationForm from "@/components/public/ReservationForm";

export default function ReservePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 text-center max-w-xl mx-auto">
        <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-1">
          Book ahead
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">Reserve a table</h1>
        <p className="text-base-content/70 mt-2">
          Submit your request and we&apos;ll confirm availability by phone.
        </p>
      </div>
      <ReservationForm />
    </div>
  );
}
