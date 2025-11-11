export type PaymentStatus = "pending" | "paid" | "overdue" | "unpaid" | "free" | "cancelled";

export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case "pending":
      return "bg-lesson-pending text-lesson-pending-foreground border-lesson-pending";
    case "paid":
      return "bg-lesson-confirmed text-lesson-confirmed-foreground border-lesson-confirmed";
    case "overdue":
      return "bg-lesson-cancelled text-lesson-cancelled-foreground border-lesson-cancelled";
    case "unpaid":
      return "bg-lesson-cancelled text-lesson-cancelled-foreground border-lesson-cancelled";
    case "free":
      return "bg-blue-400 text-white border-blue-400";
    case "cancelled":
      return "bg-gray-400 text-white border-gray-400";
    default:
      return "bg-gray-400 text-white border-gray-400";
  }
}