
import { useUpdateLesson } from './useLessons';
import { useToast } from './use-toast';

export function usePaymentStatus(lessonsData: any[]) {
  const { toast } = useToast();
  const updateLessonMutation = useUpdateLesson();

  const handleUpdatePaymentStatus = async (
    lessonId: string,
    status: "pending" | "paid" | "unpaid" | "free",
  ) => {
    try {
      const lessonToUpdate = lessonsData.find((l: any) => l.id === lessonId);
      if (lessonToUpdate) {
        await updateLessonMutation.mutateAsync({
          id: lessonId,
          ...lessonToUpdate,
          paymentStatus: status,
        });
        toast({
          title: "Success",
          description: `Payment status updated to ${status}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  return { handleUpdatePaymentStatus };
}
