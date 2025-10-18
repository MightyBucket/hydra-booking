import { useToast } from '@/hooks/use-toast';
import { useCreateLesson, useUpdateLesson, useCreateLessonWithRecurring } from './useLessons';
import { useDialogState } from './useDialogState';

/**
 * Interface for lesson form initial state
 * Can be opened with a specific lesson to edit, a date to create new, or a student pre-selected
 */
interface LessonFormData {
  lesson?: any;
  date?: Date;
  studentId?: string;
}

/**
 * Hook for managing lesson form state and operations
 * Handles creating and updating lessons with form dialog state
 */
export function useLessonForm() {
  // State and dialog management for the lesson form
  const { isOpen: showLessonForm, data: formData, open, close } = useDialogState<LessonFormData>();

  // Toast notification hook
  const { toast } = useToast();
  // Mutation hooks for lesson creation and updates
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const createRecurringMutation = useCreateLessonWithRecurring();

  /**
   * Returns a default date and time for a new lesson, set to 1 hour from now.
   * @returns {Date} The default date and time.
   */
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now;
  };

  /**
   * Opens the lesson form dialog, optionally pre-filling it with provided data.
   * @param {LessonFormData} [options] - Optional initial data for the form.
   */
  const handleOpenForm = (options?: LessonFormData) => {
    open(options || {});
  };

  /**
   * Closes the lesson form dialog.
   */
  const handleCloseForm = () => {
    close();
  };

  /**
   * Handles the submission of the lesson form.
   * It either updates an existing lesson, creates a new lesson, or creates recurring lessons.
   * @param {any} lessonData - The data submitted from the lesson form.
   */
  const handleSubmit = async (lessonData: any) => {
    try {
      // Destructure and clean up lesson data, preparing it for mutations
      const { isRecurring, frequency, endDate, ...cleanedData } = {
        ...lessonData,
        lessonLink: lessonData.lessonLink?.trim() || null, // Trim whitespace and set to null if empty
        pricePerHour: Number(lessonData.pricePerHour),     // Ensure pricePerHour is a number
        duration: Number(lessonData.duration),           // Ensure duration is a number
      };

      if (formData?.lesson) {
        // If editing an existing lesson, use the update mutation
        await updateLessonMutation.mutateAsync({ id: formData.lesson.id, ...cleanedData });
        toast({ title: "Success", description: "Lesson updated successfully" });
      } else if (isRecurring) {
        // If creating recurring lessons, use the createRecurring mutation
        await createRecurringMutation.mutateAsync({
          lesson: cleanedData,
          recurring: { frequency, endDate }
        });
        toast({ title: "Success", description: "Recurring lessons created successfully" });
      } else {
        // If creating a new single lesson, use the createLesson mutation
        await createLessonMutation.mutateAsync(cleanedData);
        toast({ title: "Success", description: "Lesson created successfully" });
      }
      // Close the form after successful submission
      handleCloseForm();
    } catch (error: any) {
      // Show an error toast if submission fails
      toast({
        title: "Error",
        description: error?.message || `Failed to ${formData?.lesson ? "update" : "create"} lesson`,
        variant: "destructive",
      });
    }
  };

  // Return values and functions to be used by components
  return {
    showLessonForm, // Boolean indicating if the form is open
    selectedLesson: formData?.lesson || null, // The lesson object if editing, otherwise null
    selectedDate: formData?.date || null,     // The initial date if creating a new lesson, otherwise null
    prefilledStudentId: formData?.studentId || null, // Student ID to prefill if provided
    getDefaultDateTime,                       // Function to get default date/time
    handleOpenForm,                           // Function to open the form
    handleCloseForm,                          // Function to close the form
    handleSubmit,                             // Function to handle form submission
  };
}