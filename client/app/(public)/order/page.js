import OrderFlow from "@/components/public/OrderFlow";

export default function OrderPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-1">
          Dine in
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">Place your order</h1>
        <p className="text-base-content/70 mt-2 max-w-xl">
          Pick an available table, add items from the menu, and submit to the kitchen.
        </p>
      </div>
      <OrderFlow />
    </div>
  );
}
