import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDeleteLesson } from "./useLessons";
import { useDialogState } from "./useDialogState";

export function useLessonDelete(lessonsData: any[]) {
  const { isOpen: showDeleteDialog, data: lessonToDelete, open: openDeleteDialog, close: closeDeleteDialog, setIsOpen: setShowDeleteDialog } = useDialogState<any>();
  const [deleteAllFuture, setDeleteAllFuture] = useState(false);
  const { toast } = useToast();
  const deleteLessonMutation = useDeleteLesson();

  const handleDeleteLesson = (lessonId: string) => {
    const lesson = lessonsData.find((l: any) => l.id === lessonId);
    openDeleteDialog(lesson);
    setDeleteAllFuture(false);
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) {
      console.error("No lesson to delete");
      return;
    }

    try {
      if (deleteAllFuture) {
        const lessonDate = new Date(lessonToDelete.dateTime);
        const dayOfWeek = lessonDate.getDay();
        const timeString = lessonToDelete.dateTime.slice(11, 19);

        const futureRecurringLessons = lessonsData.filter((lesson: any) => {
          const lessonDateTime = new Date(lesson.dateTime);
          return (
            lessonDateTime >= lessonDate &&
            lessonDateTime.getDay() === dayOfWeek &&
            lessonDateTime.toISOString().slice(11, 19) === timeString &&
            lesson.studentId === lessonToDelete.studentId
          );
        });

        // Delete lessons sequentially
        for (const lesson of futureRecurringLessons) {
          await deleteLessonMutation.mutateAsync(lesson.id);
        }

        toast({
          title: "Success",
          description: `Deleted ${futureRecurringLessons.length} lesson${futureRecurringLessons.length !== 1 ? "s" : ""} successfully`,
        });
      } else {
        // Delete single lesson
        await deleteLessonMutation.mutateAsync(lessonToDelete.id);
        toast({ title: "Success", description: "Lesson deleted successfully" });
      }
    } catch (error) {
      console.error("Delete lesson error:", error);
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      });
    } finally {
      // Always close dialog and reset state
      closeDeleteDialog();
      setDeleteAllFuture(false);
    }
  };

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