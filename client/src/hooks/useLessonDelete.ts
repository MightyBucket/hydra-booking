
import { useState } from 'react';
import { useDeleteLesson } from './useLessons';
import { useToast } from './use-toast';

export function useLessonDelete(lessonsData: any[]) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<any>(null);
  const [deleteAllFuture, setDeleteAllFuture] = useState(false);

  const { toast } = useToast();
  const deleteLessonMutation = useDeleteLesson();

  const handleDeleteLesson = (lesson: any) => {
    setLessonToDelete(lesson);
    setDeleteAllFuture(false);
    setShowDeleteDialog(true);
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;

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

        for (const lesson of futureRecurringLessons) {
          await deleteLessonMutation.mutateAsync(lesson.id);
        }

        toast({
          title: "Success",
          description: `Deleted ${futureRecurringLessons.length} lesson${futureRecurringLessons.length !== 1 ? "s" : ""} successfully`,
        });
      } else {
        await deleteLessonMutation.mutateAsync(lessonToDelete.id);
        toast({ title: "Success", description: "Lesson deleted successfully" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      });
    }

    setShowDeleteDialog(false);
    setLessonToDelete(null);
    setDeleteAllFuture(false);
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
