import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDeleteLesson } from "./useLessons";
import { useDialogState } from "./useDialogState";

export function useLessonDelete(lessonsData: any[]) {
  const { isOpen: showDeleteDialog, data: lessonToDelete, open: openDeleteDialog, close: closeDeleteDialog, setIsOpen: setShowDeleteDialog } = useDialogState<any>();
  const [deleteAllFuture, setDeleteAllFuture] = useState(false);
  const { toast } = useToast();
  const deleteLessonMutation = useDeleteLesson();

  const findLesson = (lessonOrId: string | any) => 
    typeof lessonOrId === 'string' 
      ? lessonsData.find((l: any) => l.id === lessonOrId)
      : lessonOrId;

  const handleDeleteLesson = (lessonOrId: string | any) => {
    const lesson = findLesson(lessonOrId);
    if (!lesson) {
      toast({ title: "Error", description: "Lesson not found", variant: "destructive" });
      return;
    }
    openDeleteDialog(lesson);
    setDeleteAllFuture(false);
  };

  const getFutureRecurringLessons = (baseLesson: any) => {
    const lessonDate = new Date(baseLesson.dateTime);
    const dayOfWeek = lessonDate.getDay();
    const timeString = lessonDate.toISOString().slice(11, 19);

    return lessonsData.filter((lesson: any) => {
      const lessonDateTime = new Date(lesson.dateTime);
      return (
        lessonDateTime >= lessonDate &&
        lessonDateTime.getDay() === dayOfWeek &&
        lessonDateTime.toISOString().slice(11, 19) === timeString &&
        lesson.studentId === baseLesson.studentId
      );
    });
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) {
      toast({ title: "Error", description: "No lesson selected for deletion", variant: "destructive" });
      closeDeleteDialog();
      return;
    }

    try {
      if (deleteAllFuture) {
        const lessonsToDelete = getFutureRecurringLessons(lessonToDelete);
        for (const lesson of lessonsToDelete) {
          await deleteLessonMutation.mutateAsync(lesson.id);
        }
        toast({
          title: "Success",
          description: `Deleted ${lessonsToDelete.length} lesson${lessonsToDelete.length !== 1 ? "s" : ""}`,
        });
      } else {
        await deleteLessonMutation.mutateAsync(lessonToDelete.id);
        toast({ title: "Success", description: "Lesson deleted successfully" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete lesson",
        variant: "destructive",
      });
    } finally {
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