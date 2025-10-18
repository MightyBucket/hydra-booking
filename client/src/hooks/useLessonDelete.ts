import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDeleteLesson, useDeleteRecurringLessons } from './useLessons';
import { useDialogState } from './useDialogState';

/**
 * Hook for managing lesson deletion
 * Handles both single lesson deletion and deleting all future recurring lessons
 */
export function useLessonDelete(lessons: any[]) {
  // State and dialog management for the delete confirmation dialog
  const { isOpen: showDeleteDialog, data: lessonToDelete, open: openDeleteDialog, close: closeDeleteDialog, setIsOpen: setShowDeleteDialog } = useDialogState<any>();
  // State to track if the user wants to delete all future recurring lessons
  const [deleteAllFuture, setDeleteAllFuture] = useState(false);
  // Toast hook for displaying messages to the user
  const { toast } = useToast();
  // Mutation hook for deleting a single lesson
  const deleteLessonMutation = useDeleteLesson();
  // Mutation hook for deleting recurring lessons
  const deleteRecurringMutation = useDeleteRecurringLessons();

  /**
   * Finds a lesson by its ID or returns the lesson object if provided directly.
   * @param lessonOrId - The lesson ID (string) or lesson object.
   * @returns The found lesson object or undefined.
   */
  const findLesson = (lessonOrId: string | any) =>
    typeof lessonOrId === 'string'
      ? lessons.find((l: any) => l.id === lessonOrId)
      : lessonOrId;

  /**
   * Handles the initial action of deleting a lesson.
   * Opens the delete confirmation dialog and sets the lesson to be deleted.
   * @param lessonOrId - The lesson ID (string) or lesson object to initiate deletion for.
   */
  const handleDeleteLesson = (lessonOrId: string | any) => {
    const lesson = findLesson(lessonOrId);
    if (!lesson) {
      toast({ title: "Error", description: "Lesson not found", variant: "destructive" });
      return;
    }
    openDeleteDialog(lesson);
    // Reset the deleteAllFuture state for each new deletion request
    setDeleteAllFuture(false);
  };

  /**
   * Finds all future recurring lessons that match the base lesson's day of week, time, and student.
   * @param baseLesson - The lesson object to find future recurrences for.
   * @returns An array of future recurring lesson objects.
   */
  const getFutureRecurringLessons = (baseLesson: any) => {
    const lessonDate = new Date(baseLesson.dateTime);
    const dayOfWeek = lessonDate.getDay(); // Day of the week (0 = Sunday, 6 = Saturday)
    const timeString = lessonDate.toISOString().slice(11, 19); // Time in HH:MM:SS format

    return lessons.filter((lesson: any) => {
      const lessonDateTime = new Date(lesson.dateTime);
      return (
        lessonDateTime >= lessonDate && // Must be on or after the base lesson's date
        lessonDateTime.getDay() === dayOfWeek && // Must be the same day of the week
        lessonDateTime.toISOString().slice(11, 19) === timeString && // Must be the same time
        lesson.studentId === baseLesson.studentId // Must be for the same student
      );
    });
  };

  /**
   * Confirms the deletion of the lesson, either as a single instance or all future recurring instances.
   */
  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) {
      toast({ title: "Error", description: "No lesson selected for deletion", variant: "destructive" });
      closeDeleteDialog();
      return;
    }

    try {
      if (deleteAllFuture) {
        // Get all future recurring lessons and delete them using the deleteRecurringMutation
        const lessonsToDelete = getFutureRecurringLessons(lessonToDelete);
        for (const lesson of lessonsToDelete) {
          await deleteRecurringMutation.mutateAsync(lesson.id);
        }
        toast({
          title: "Success",
          description: `Deleted ${lessonsToDelete.length} lesson${lessonsToDelete.length !== 1 ? "s" : ""}`,
        });
      } else {
        // Delete only the single selected lesson
        await deleteLessonMutation.mutateAsync(lessonToDelete.id);
        toast({ title: "Success", description: "Lesson deleted successfully" });
      }
    } catch (error: any) {
      // Handle any errors during the deletion process
      toast({
        title: "Error",
        description: error?.message || "Failed to delete lesson",
        variant: "destructive",
      });
    } finally {
      // Close the dialog and reset the deleteAllFuture state regardless of success or failure
      closeDeleteDialog();
      setDeleteAllFuture(false);
    }
  };

  // Return the state and handlers for use in components
  return {
    showDeleteDialog,
    setShowDeleteDialog,
    lessonToDelete,
    deleteAllFuture,
    setDeleteAllFuture,
    handleDeleteLesson,
    confirmDeleteLesson,
  };
}