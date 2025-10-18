
export type PaymentStatus = "pending" | "paid" | "unpaid" | "free" | "overdue";

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case "paid":
      return "bg-lesson-confirmed text-white";
    case "pending":
      return "bg-lesson-pending text-black";
    case "overdue":
    case "unpaid":
      return "bg-lesson-cancelled text-white";
    case "free":
      return "bg-gray-400 text-white";
    default:
      return "bg-secondary";
  }
};
