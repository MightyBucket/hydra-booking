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
      if (formData?.lesson) {
        await updateLessonMutation.mutateAsync({
          id: formData.lesson.id,
          ...lessonData,
        });
        toast({
          title: "Success",
          description: "Lesson updated successfully",
        });
      } else {
        if (lessonData.isRecurring) {
          await createRecurringMutation.mutateAsync(lessonData);
          toast({
            title: "Success",
            description: "Recurring lessons created successfully",
          });
        } else {
          await createLessonMutation.mutateAsync(lessonData);
          toast({
            title: "Success",
            description: "Lesson created successfully",
          });
        }
      }
      handleCloseForm();
    } catch (error) {
      toast({
        title: "Error",
        description: formData?.lesson ? "Failed to update lesson" : "Failed to create lesson",
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