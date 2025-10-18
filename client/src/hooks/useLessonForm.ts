
import { useState } from 'react';
import { useCreateLesson, useUpdateLesson, useCreateLessonWithRecurring } from './useLessons';
import { useToast } from './use-toast';

export function useLessonForm() {
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [prefilledStudentId, setPrefilledStudentId] = useState<string | null>(null);
  const { toast } = useToast();
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const createLessonWithRecurringMutation = useCreateLessonWithRecurring();

  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now;
  };

  const handleOpenForm = (options?: {
    lesson?: any;
    date?: Date;
    studentId?: string;
  }) => {
    setSelectedLesson(options?.lesson || null);
    setSelectedDate(options?.date || null);
    setPrefilledStudentId(options?.studentId || null);
    setShowLessonForm(true);
  };

  const handleCloseForm = () => {
    setShowLessonForm(false);
    setSelectedLesson(null);
    setSelectedDate(null);
    setPrefilledStudentId(null);
  };

  const handleSubmit = async (lessonData: any) => {
    try {
      const formattedData = {
        ...lessonData,
        dateTime: new Date(lessonData.dateTime).toISOString(),
        pricePerHour: lessonData.pricePerHour.toString(),
      };

      const { isRecurring, frequency, endDate, ...lessonOnlyData } = formattedData;

      if (selectedLesson) {
        await updateLessonMutation.mutateAsync({
          id: selectedLesson.id,
          ...lessonOnlyData,
        });
        toast({ title: "Success", description: "Lesson updated successfully" });
      } else {
        if (isRecurring && endDate && endDate.trim() !== "") {
          await createLessonWithRecurringMutation.mutateAsync({
            lesson: lessonOnlyData,
            recurring: {
              frequency: frequency === "biweekly" ? "biweekly" : "weekly",
              endDate: endDate,
            },
          });
          toast({
            title: "Success",
            description: "Recurring lesson series created successfully",
          });
        } else {
          await createLessonMutation.mutateAsync(lessonOnlyData);
          toast({
            title: "Success",
            description: "Lesson scheduled successfully",
          });
        }
      }

      handleCloseForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lesson",
        variant: "destructive",
      });
    }
  };

  return {
    showLessonForm,
    selectedLesson,
    selectedDate,
    prefilledStudentId,
    getDefaultDateTime,
    handleOpenForm,
    handleCloseForm,
    handleSubmit,
  };
}
