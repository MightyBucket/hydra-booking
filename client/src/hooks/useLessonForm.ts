import { useToast } from '@/hooks/use-toast';
import { useCreateLesson, useUpdateLesson, useCreateLessonWithRecurring } from './useLessons';
import { useDialogState } from './useDialogState';

interface LessonFormData {
  lesson?: any;
  date?: Date;
  studentId?: string;
}

export function useLessonForm() {
  const { isOpen: showLessonForm, data: formData, open, close } = useDialogState<LessonFormData>();

  const { toast } = useToast();
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const createRecurringMutation = useCreateLessonWithRecurring();

  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now;
  };

  const handleOpenForm = (options?: LessonFormData) => {
    open(options || {});
  };

  const handleCloseForm = () => {
    close();
  };

  const handleSubmit = async (lessonData: any) => {
    try {
      // Clean up the data before submission
      const cleanedData = {
        ...lessonData,
        lessonLink: lessonData.lessonLink?.trim() || null,
        pricePerHour: Number(lessonData.pricePerHour),
        duration: Number(lessonData.duration),
      };

      // Remove fields that aren't part of the lesson schema
      const { isRecurring, frequency, endDate, ...lessonOnlyData } = cleanedData;

      if (formData?.lesson) {
        await updateLessonMutation.mutateAsync({
          id: formData.lesson.id,
          ...lessonOnlyData,
        });
        toast({
          title: "Success",
          description: "Lesson updated successfully",
        });
      } else {
        if (isRecurring) {
          await createRecurringMutation.mutateAsync(cleanedData);
          toast({
            title: "Success",
            description: "Recurring lessons created successfully",
          });
        } else {
          await createLessonMutation.mutateAsync(lessonOnlyData);
          toast({
            title: "Success",
            description: "Lesson created successfully",
          });
        }
      }
      handleCloseForm();
    } catch (error: any) {
      console.error("Lesson submission error:", error);
      toast({
        title: "Error",
        description: error?.message || (formData?.lesson ? "Failed to update lesson" : "Failed to create lesson"),
        variant: "destructive",
      });
    }
  };

  return {
    showLessonForm,
    selectedLesson: formData?.lesson || null,
    selectedDate: formData?.date || null,
    prefilledStudentId: formData?.studentId || null,
    getDefaultDateTime,
    handleOpenForm,
    handleCloseForm,
    handleSubmit,
  };
}