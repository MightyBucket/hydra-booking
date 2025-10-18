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
      const { isRecurring, frequency, endDate, ...cleanedData } = {
        ...lessonData,
        lessonLink: lessonData.lessonLink?.trim() || null,
        pricePerHour: Number(lessonData.pricePerHour),
        duration: Number(lessonData.duration),
      };

      if (formData?.lesson) {
        await updateLessonMutation.mutateAsync({ id: formData.lesson.id, ...cleanedData });
        toast({ title: "Success", description: "Lesson updated successfully" });
      } else if (isRecurring) {
        await createRecurringMutation.mutateAsync({
          lesson: cleanedData,
          recurring: { frequency, endDate }
        });
        toast({ title: "Success", description: "Recurring lessons created successfully" });
      } else {
        await createLessonMutation.mutateAsync(cleanedData);
        toast({ title: "Success", description: "Lesson created successfully" });
      }
      handleCloseForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || `Failed to ${formData?.lesson ? "update" : "create"} lesson`,
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