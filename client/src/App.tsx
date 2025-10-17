import { useState, useEffect } from "react";
import { Switch, Route, useParams, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/LoginForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import CalendarView from "./components/CalendarView";
import Navigation from "./components/Navigation";
import LessonForm from "./components/LessonForm";
import StudentForm from "./components/StudentForm";
import ThemeToggle from "./components/ThemeToggle";
import StudentCard from "./components/StudentCard";
import LessonCard from "./components/LessonCard";
import LessonCardWithComments from "./components/LessonCardWithComments";
import LessonWithComments from "./components/LessonWithComments";
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from "./hooks/useStudents";
import {
  useLessons,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useCreateLessonWithRecurring,
} from "./hooks/useLessons";
import {
  useCommentsByLesson,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "./hooks/useComments";
import {
  useNotesByStudent,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from "./hooks/useNotes";
import NoteForm from "./components/NoteForm";
import CommentForm from "./components/CommentForm";
import { format } from "date-fns";
import NotFound from "@/pages/not-found";
import { useQueryClient } from "@tanstack/react-query";
import { Lesson } from "./types/Lesson";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  Edit,
  ChevronDown,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

function CalendarPage() {
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<any>(null);
  const [deleteAllFuture, setDeleteAllFuture] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [selectedLessonForComment, setSelectedLessonForComment] = useState<
    string | null
  >(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentData, setEditingCommentData] = useState<{
    title: string;
    content: string;
    visibleToStudent: number;
  } | null>(null);
  const { toast } = useToast();

  const { data: lessonsData = [], isLoading: lessonsLoading } = useLessons();
  const { data: studentsData = [] } = useStudents();
  const createLessonMutation = useCreateLesson();
  const createLessonWithRecurringMutation = useCreateLessonWithRecurring();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();

  // Transform lessons data for calendar display
  const displayLessons = (lessonsData as any[]).map((lesson: any) => {
    const student = (studentsData as any[]).find(
      (s: any) => s.id === lesson.studentId,
    );
    return {
      ...lesson,
      dateTime: new Date(lesson.dateTime),
      studentName: student
        ? `${student.firstName} ${student.lastName || ""}`
        : "Unknown Student",
      studentColor: student?.defaultColor || "#3b82f6",
      pricePerHour: parseFloat(lesson.pricePerHour),
    };
  });

  const handleLessonClick = (lesson: any) => {
    // Find the original lesson data from lessonsData
    const originalLesson = (lessonsData as any[]).find(
      (l: any) => l.id === lesson.id,
    );

    if (originalLesson) {
      setSelectedLesson(originalLesson);
      setShowLessonForm(true);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedLesson(null);
    setShowLessonForm(true);
  };

  const getDefaultDateTime = () => {
    const now = new Date();
    // Set to next hour
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now;
  };

  const handleLessonSubmit = async (lessonData: any) => {
    try {
      const formattedData = {
        ...lessonData,
        dateTime: new Date(lessonData.dateTime).toISOString(),
        pricePerHour: lessonData.pricePerHour.toString(),
      };

      // Remove recurring fields from lesson data
      const { isRecurring, frequency, endDate, ...lessonOnlyData } =
        formattedData;

      if (selectedLesson) {
        // Update existing lesson (no recurring for updates)
        await updateLessonMutation.mutateAsync({
          id: selectedLesson.id,
          ...lessonOnlyData,
        });
        toast({ title: "Success", description: "Lesson updated successfully" });
      } else {
        // Create new lesson
        if (isRecurring && endDate && endDate.trim() !== "") {
          // Create lesson with recurring
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
          // Create single lesson
          await createLessonMutation.mutateAsync(lessonOnlyData);
          toast({
            title: "Success",
            description: "Lesson scheduled successfully",
          });
        }
      }

      setShowLessonForm(false);
      setSelectedLesson(null);
      setSelectedDate(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lesson",
        variant: "destructive",
      });
    }
  };

  const handleLessonCancel = () => {
    setShowLessonForm(false);
    setSelectedLesson(null);
    setSelectedDate(null);
  };

  const handleJoinLesson = (lesson: any) => {
    if (lesson.lessonLink) {
      window.open(lesson.lessonLink, "_blank");
    }
  };

  const handleDeleteLesson = (lesson: any) => {
    setLessonToDelete(lesson);
    setDeleteAllFuture(false);
    setShowDeleteDialog(true);
  };

  const handleUpdatePaymentStatus = async (
    lessonId: string,
    status: "pending" | "paid" | "unpaid",
  ) => {
    try {
      const lessonToUpdate = (lessonsData as any[]).find(
        (l: any) => l.id === lessonId,
      );
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

  const handleAddComment = (lessonId: string) => {
    setSelectedLessonForComment(lessonId);
    setShowCommentForm(true);
  };

  const handleCommentSubmit = async (data: {
    title: string;
    content: string;
    visibleToStudent: boolean;
  }) => {
    if (!selectedLessonForComment) return;

    try {
      await createCommentMutation.mutateAsync({
        lessonId: selectedLessonForComment,
        title: data.title,
        content: data.content,
        visibleToStudent: data.visibleToStudent ? 1 : 0,
      });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      setShowCommentForm(false);
      setSelectedLessonForComment(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleStartEditComment = (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number },
  ) => {
    setEditingCommentId(commentId);
    setEditingCommentData(data);
    setShowCommentForm(true);
  };

  const handleEditComment = async (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number },
  ) => {
    try {
      await updateCommentMutation.mutateAsync({ id: commentId, ...data });
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
      setEditingCommentId(null);
      setEditingCommentData(null);
      setShowCommentForm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;

    try {
      if (deleteAllFuture) {
        // Find all lessons with same day of week and time in the future
        const lessonDate = new Date(lessonToDelete.dateTime);
        const dayOfWeek = lessonDate.getDay();
        const timeString = lessonToDelete.dateTime.slice(11, 19); // HH:MM:SS

        const futureRecurringLessons = (lessonsData as any[]).filter(
          (lesson: any) => {
            const lessonDateTime = new Date(lesson.dateTime);
            return (
              lessonDateTime >= lessonDate && // Same date or future
              lessonDateTime.getDay() === dayOfWeek && // Same day of week
              lessonDateTime.toISOString().slice(11, 19) === timeString && // Same time
              lesson.studentId === lessonToDelete.studentId // Same student
            );
          },
        );

        // Delete all future recurring lessons
        for (const lesson of futureRecurringLessons) {
          await deleteLessonMutation.mutateAsync(lesson.id);
        }

        toast({
          title: "Success",
          description: `Deleted ${futureRecurringLessons.length} lesson${futureRecurringLessons.length !== 1 ? "s" : ""} successfully`,
        });
      } else {
        // Delete only this lesson
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

  if (lessonsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading lessons...
      </div>
    );
  }

  return (
    <>
      <CalendarView
        lessons={displayLessons}
        onLessonClick={handleLessonClick}
        onDateClick={handleDateClick}
        onJoinLesson={handleJoinLesson}
        onDeleteLesson={handleDeleteLesson}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
        onAddComment={handleAddComment}
        onEditComment={handleStartEditComment}
      />

      <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLesson ? "Edit Lesson" : "Schedule New Lesson"}
            </DialogTitle>
          </DialogHeader>
          <LessonForm
            students={studentsData as any[]}
            initialData={
              selectedLesson
                ? {
                    ...selectedLesson,
                    dateTime: new Date(selectedLesson.dateTime),
                    pricePerHour: parseFloat(selectedLesson.pricePerHour),
                  }
                : selectedDate
                  ? { dateTime: selectedDate }
                  : undefined
            }
            onSubmit={handleLessonSubmit}
            onCancel={() => {
              setShowLessonForm(false);
              setSelectedLesson(null);
              setSelectedDate(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-all-future"
                checked={deleteAllFuture}
                onCheckedChange={(checked) => setDeleteAllFuture(!!checked)}
                data-testid="checkbox-delete-all-future"
              />
              <Label htmlFor="delete-all-future" className="text-sm">
                Delete all future lessons on the same day and time
              </Label>
            </div>
            {deleteAllFuture && (
              <p className="text-sm text-muted-foreground">
                This will delete all future lessons for the same student that
                occur on the same day of the week at the same time.
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLesson}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete {deleteAllFuture ? "All Future Lessons" : "Lesson"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showCommentForm} onOpenChange={setShowCommentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCommentId ? "Edit Comment" : "Add Comment"}
            </DialogTitle>
          </DialogHeader>
          <CommentForm
            initialData={
              editingCommentData
                ? {
                    title: editingCommentData.title,
                    content: editingCommentData.content,
                    visibleToStudent: editingCommentData.visibleToStudent === 1,
                  }
                : undefined
            }
            isEditing={!!editingCommentId}
            onSubmit={async (data) => {
              if (editingCommentId) {
                await handleEditComment(editingCommentId, {
                  title: data.title,
                  content: data.content,
                  visibleToStudent: data.visibleToStudent ? 1 : 0,
                });
              } else {
                await handleCommentSubmit(data);
              }
            }}
            onCancel={() => {
              setShowCommentForm(false);
              setSelectedLessonForComment(null);
              setEditingCommentId(null);
              setEditingCommentData(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function StudentsPage() {
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedStudentForLesson, setSelectedStudentForLesson] =
    useState<any>(null);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [selectedStudentForNotes, setSelectedStudentForNotes] = useState<
    string | null
  >(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const { toast } = useToast();

  const { data: studentsData = [], isLoading: studentsLoading } = useStudents();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();
  const createLessonMutation = useCreateLesson();
  const { data: notesData = [] } = useNotesByStudent(
    selectedStudentForNotes || "",
  );
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const handleEditStudent = (studentId: string) => {
    const student = (studentsData as any[]).find(
      (s: any) => s.id === studentId,
    );
    setSelectedStudent(student);
    setShowStudentForm(true);
  };

  const getDefaultDateTime = () => {
    const now = new Date();
    // Set to next hour
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now;
  };

  const handleScheduleLesson = (studentId: string) => {
    const student = (studentsData as any[]).find(
      (s: any) => s.id === studentId,
    );
    if (student) {
      setSelectedStudentForLesson(student);
      setShowLessonForm(true);
    }
  };

  const handleViewLessons = (studentId: string) => {
    const student = (studentsData as any[]).find(
      (s: any) => s.id === studentId,
    );
    if (student?.studentId) {
      window.location.href = `/${student.studentId}/calendar`;
    }
  };

  const handleViewNotes = (studentId: string) => {
    setSelectedStudentForNotes(studentId);
    setShowNotesDialog(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = (studentsData as any[]).find(
      (s: any) => s.id === studentId,
    );
    setStudentToDelete(student);
    setShowDeleteDialog(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      await deleteStudentMutation.mutateAsync(studentToDelete.id);
      toast({
        title: "Success",
        description: `Student ${studentToDelete.firstName} ${studentToDelete.lastName || ""} and all associated lessons have been deleted.`,
      });
      setShowDeleteDialog(false);
      setStudentToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  const cancelDeleteStudent = () => {
    setShowDeleteDialog(false);
    setStudentToDelete(null);
  };

  const handleStudentSubmit = async (studentData: any) => {
    try {
      const formattedData = {
        ...studentData,
        defaultRate: studentData.defaultRate
          ? studentData.defaultRate.toString()
          : null,
      };

      if (selectedStudent) {
        await updateStudentMutation.mutateAsync({
          id: selectedStudent.id,
          ...formattedData,
        });
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        await createStudentMutation.mutateAsync(formattedData);
        toast({ title: "Success", description: "Student added successfully" });
      }

      setShowStudentForm(false);
      setSelectedStudent(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save student",
        variant: "destructive",
      });
    }
  };

  const handleStudentCancel = () => {
    setShowStudentForm(false);
    setSelectedStudent(null);
  };

  const handleLessonSubmit = async (lessonData: any) => {
    try {
      const formattedData = {
        ...lessonData,
        dateTime: new Date(lessonData.dateTime).toISOString(),
        pricePerHour: lessonData.pricePerHour.toString(),
      };

      await createLessonMutation.mutateAsync(formattedData);
      toast({ title: "Success", description: "Lesson scheduled successfully" });
      setShowLessonForm(false);
      setSelectedStudentForLesson(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule lesson",
        variant: "destructive",
      });
    }
  };

  const handleLessonCancel = () => {
    setShowLessonForm(false);
    setSelectedStudentForLesson(null);
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setShowNoteForm(true);
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleNoteSubmit = async (data: { title: string; content: string }) => {
    if (!selectedStudentForNotes) return;

    try {
      if (editingNote) {
        await updateNoteMutation.mutateAsync({
          id: editingNote.id,
          studentId: selectedStudentForNotes,
          title: data.title,
          content: data.content,
        });
        toast({
          title: "Success",
          description: "Note updated successfully",
        });
      } else {
        await createNoteMutation.mutateAsync({
          studentId: selectedStudentForNotes,
          title: data.title,
          content: data.content,
        });
        toast({
          title: "Success",
          description: "Note added successfully",
        });
      }
      setShowNoteForm(false);
      setEditingNote(null);
    } catch (error) {
      toast({
        title: "Error",
        description: editingNote
          ? "Failed to update note"
          : "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedStudentForNotes) return;

    try {
      await deleteNoteMutation.mutateAsync({
        id: noteId,
        studentId: selectedStudentForNotes,
      });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading students...
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Students ({(studentsData as any[]).length})</CardTitle>
        </CardHeader>
        <CardContent>
          {(studentsData as any[]).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No students added yet.</p>
              <p>Click "Add Student" in the sidebar to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(studentsData as any[]).map((student: any) => (
                <StudentCard
                  key={student.id}
                  student={{
                    ...student,
                    defaultRate: student.defaultRate
                      ? parseFloat(student.defaultRate)
                      : undefined,
                  }}
                  onEdit={handleEditStudent}
                  onScheduleLesson={handleScheduleLesson}
                  onViewLessons={handleViewLessons}
                  onViewNotes={handleViewNotes}
                  onDelete={handleDeleteStudent}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showStudentForm} onOpenChange={setShowStudentForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <StudentForm
            initialData={
              selectedStudent
                ? {
                    ...selectedStudent,
                    defaultRate: selectedStudent.defaultRate
                      ? parseFloat(selectedStudent.defaultRate)
                      : undefined,
                  }
                : undefined
            }
            onSubmit={handleStudentSubmit}
            onCancel={handleStudentCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Lesson Form Modal for Students Page */}
      <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Schedule Lesson for {selectedStudentForLesson?.firstName}{" "}
              {selectedStudentForLesson?.lastName || ""}
            </DialogTitle>
          </DialogHeader>
          <LessonForm
            students={studentsData as any[]}
            initialData={
              selectedStudentForLesson
                ? {
                    studentId: selectedStudentForLesson.id,
                    subject: selectedStudentForLesson.defaultSubject,
                    pricePerHour: selectedStudentForLesson.defaultRate
                      ? parseFloat(selectedStudentForLesson.defaultRate)
                      : 50,
                    lessonLink: selectedStudentForLesson.defaultLink,
                    dateTime: getDefaultDateTime(),
                  }
                : undefined
            }
            onSubmit={handleLessonSubmit}
            onCancel={handleLessonCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {studentToDelete?.firstName} {studentToDelete?.lastName || ""}
              </strong>
              ?
              <br />
              <br />
              <span className="text-destructive font-medium">
                Warning: This will also permanently delete all lessons
                associated with this student.
              </span>
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteStudent}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStudent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Notes for{" "}
              {
                (studentsData as any[]).find(
                  (s) => s.id === selectedStudentForNotes,
                )?.firstName
              }{" "}
              {(studentsData as any[]).find(
                (s) => s.id === selectedStudentForNotes,
              )?.lastName || ""}
            </DialogTitle>
          </DialogHeader>

          {showNoteForm ? (
            <NoteForm
              initialData={
                editingNote
                  ? {
                      id: editingNote.id,
                      title: editingNote.title,
                      content: editingNote.content,
                    }
                  : undefined
              }
              onSubmit={handleNoteSubmit}
              onCancel={() => {
                setShowNoteForm(false);
                setEditingNote(null);
              }}
            />
          ) : (
            <>
              <div className="space-y-4">
                {notesData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No notes yet. Click "Add Note" to create one.
                  </p>
                ) : (
                  notesData.map((note: any) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {note.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                            {note.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(
                              new Date(note.createdAt),
                              "MMM d, yyyy h:mm a",
                            )}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleAddNote}>Add Note</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SchedulePage() {
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<any>(null);
  const [deleteAllFuture, setDeleteAllFuture] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentFormLessonId, setCommentFormLessonId] = useState<string | null>(
    null,
  );
  const [viewCommentsLessonId, setViewCommentsLessonId] = useState<
    string | null
  >(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentData, setEditingCommentData] = useState<{
    title: string;
    content: string;
    visibleToStudent: number;
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(
    undefined,
  );
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);

  const { data: lessonsData = [], isLoading: lessonsLoading } = useLessons();
  const { data: studentsData = [] } = useStudents();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();

  // Transform and filter lessons starting from last week
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(0, 0, 0, 0);

  const displayLessons = (lessonsData as any[])
    .map((lesson: any) => {
      const student = (studentsData as any[]).find(
        (s: any) => s.id === lesson.studentId,
      );
      return {
        ...lesson,
        dateTime: new Date(lesson.dateTime),
        studentName: student
          ? `${student.firstName} ${student.lastName || ""}`
          : "Unknown Student",
        studentColor: student?.defaultColor || "#3b82f6",
        pricePerHour: parseFloat(lesson.pricePerHour),
      };
    })
    .filter((lesson: any) => lesson.dateTime >= lastWeek)
    .sort((a: any, b: any) => a.dateTime.getTime() - b.dateTime.getTime());

  // Group lessons by date
  const groupedLessons = displayLessons.reduce((groups: any, lesson: any) => {
    const dateKey = format(lesson.dateTime, "yyyy-MM-dd");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(lesson);
    return groups;
  }, {});

  const handleEditLesson = (lessonIdOrLesson: string | Lesson) => {
    const lesson =
      typeof lessonIdOrLesson === "string"
        ? (lessonsData as any[]).find((l: any) => l.id === lessonIdOrLesson)
        : lessonIdOrLesson;

    if (lesson) {
      setEditingLesson(lesson);
      setShowLessonForm(true);
    }
  };

  const handleDeleteLesson = (lessonIdOrLesson: string | Lesson) => {
    const lesson =
      typeof lessonIdOrLesson === "string"
        ? (lessonsData as any[]).find((l: any) => l.id === lessonIdOrLesson)
        : lessonIdOrLesson;

    if (lesson) {
      setLessonToDelete(lesson);
      setDeleteAllFuture(false);
      setShowDeleteDialog(true);
    }
  };

  const handleJoinLesson = (lesson: Lesson) => {
    if (lesson.lessonLink) {
      window.open(lesson.lessonLink, "_blank");
    }
  };

  const handleUpdatePaymentStatus = async (
    lessonId: string,
    status: "pending" | "paid" | "unpaid" | "free",
  ) => {
    try {
      const lessonToUpdate = (lessonsData as any[]).find(
        (l: any) => l.id === lessonId,
      );
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

  const handleAddComment = (lessonId: string) => {
    setCommentFormLessonId(lessonId);
    setShowCommentForm(true);
  };

  const handleAddCommentFromLesson = (lessonId: string) => {
    setCommentFormLessonId(lessonId);
    setShowCommentForm(true);
  };

  const handleCommentSubmit = async (data: {
    title: string;
    content: string;
    visibleToStudent: boolean;
  }) => {
    if (!commentFormLessonId) return;

    try {
      await createCommentMutation.mutateAsync({
        lessonId: commentFormLessonId,
        title: data.title,
        content: data.content,
        visibleToStudent: data.visibleToStudent ? 1 : 0,
      });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      setShowCommentForm(false);
      setCommentFormLessonId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const updateCommentMutation = useUpdateComment();

  const handleEditComment = async (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number },
  ) => {
    try {
      await updateCommentMutation.mutateAsync({ id: commentId, ...data });
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
      setEditingCommentId(null);
      setEditingCommentData(null);
      setShowCommentForm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const handleStartEditComment = (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number },
  ) => {
    setEditingCommentId(commentId);
    setEditingCommentData(data);
    setViewCommentsLessonId(null); // Close the comments dialog
    setShowCommentForm(true);
  };

  // Auto-scroll to today's section on mount
  useEffect(() => {
    const todayDateKey = format(new Date(), "yyyy-MM-dd");
    const todayElement = document.querySelector(
      `[data-date-key="${todayDateKey}"]`,
    );
    if (todayElement) {
      setTimeout(() => {
        todayElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [lessonsLoading]);

  const handleLessonSubmit = async (lessonData: any) => {
    try {
      const formattedData = {
        ...lessonData,
        dateTime: new Date(lessonData.dateTime).toISOString(),
        pricePerHour: lessonData.pricePerHour.toString(),
      };

      if (editingLesson) {
        await updateLessonMutation.mutateAsync({
          id: editingLesson.id,
          ...formattedData,
        });
        toast({ title: "Success", description: "Lesson updated successfully" });
      }

      setShowLessonForm(false);
      setEditingLesson(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lesson",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;

    try {
      if (deleteAllFuture) {
        const lessonDate = new Date(lessonToDelete.dateTime);
        const dayOfWeek = lessonDate.getDay();
        const timeString = lessonToDelete.dateTime.slice(11, 19);

        const futureRecurringLessons = (lessonsData as any[]).filter(
          (lesson: any) => {
            const lessonDateTime = new Date(lesson.dateTime);
            return (
              lessonDateTime >= lessonDate &&
              lessonDateTime.getDay() === dayOfWeek &&
              lessonDateTime.toISOString().slice(11, 19) === timeString &&
              lesson.studentId === lessonToDelete.studentId
            );
          },
        );

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

  if (lessonsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading lessons...
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Schedule ({displayLessons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {displayLessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No lessons scheduled from last week onwards.</p>
              <p>Click "Schedule Lesson" in the sidebar to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLessons).map(
                ([dateKey, lessons]: [string, any], index: number) => {
                  const date = new Date(dateKey);
                  const isToday = format(new Date(), "yyyy-MM-dd") === dateKey;
                  const isPast =
                    date < new Date(new Date().setHours(0, 0, 0, 0));

                  // Check if this is the first lesson of a new month
                  const isFirstLessonOfMonth =
                    index === 0 ||
                    format(date, "yyyy-MM") !==
                      format(
                        new Date(Object.keys(groupedLessons)[index - 1]),
                        "yyyy-MM",
                      );

                  return (
                    <div
                      key={dateKey}
                      className="space-y-3"
                      data-date-key={dateKey}
                    >
                      {isFirstLessonOfMonth && (
                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-foreground mb-2">
                            {format(date, "MMMM yyyy")}
                          </h2>
                          <div className="h-px bg-border"></div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <h3
                          className={`text-lg font-semibold ${isToday ? "text-primary" : isPast ? "text-muted-foreground" : ""}`}
                        >
                          {isToday ? "Today" : format(date, "EEE d")}
                        </h3>
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-sm text-muted-foreground">
                          {lessons.length} lesson
                          {lessons.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="space-y-3 pl-4">
                        {lessons.map((lesson) =>
                          isMobile ? (
                            <LessonWithComments
                              key={lesson.id}
                              lesson={lesson}
                              onEdit={() => handleEditLesson(lesson.id)}
                              onDelete={() => handleDeleteLesson(lesson.id)}
                              onJoinLesson={
                                lesson.lessonLink
                                  ? () => handleJoinLesson(lesson)
                                  : undefined
                              }
                              onUpdatePaymentStatus={handleUpdatePaymentStatus}
                              onAddComment={() =>
                                handleAddCommentFromLesson(lesson.id)
                              }
                              onViewComments={setViewCommentsLessonId}
                              onEditComment={handleStartEditComment}
                              onDeleteComment={handleDeleteComment}
                            />
                          ) : (
                            <LessonCardWithComments
                              key={lesson.id}
                              lesson={lesson}
                              onEdit={handleEditLesson}
                              onDelete={handleDeleteLesson}
                              onJoinLesson={
                                lesson.lessonLink
                                  ? () => handleJoinLesson(lesson)
                                  : undefined
                              }
                              onUpdatePaymentStatus={handleUpdatePaymentStatus}
                              onAddComment={(lessonId) =>
                                handleAddCommentFromLesson(lesson.id)
                              }
                              onDeleteComment={handleDeleteComment}
                              onEditComment={handleStartEditComment}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Edit Lesson" : "Schedule New Lesson"}
            </DialogTitle>
          </DialogHeader>
          <LessonForm
            students={studentsData as any[]}
            initialData={
              editingLesson
                ? {
                    ...editingLesson,
                    dateTime: new Date(editingLesson.dateTime),
                    pricePerHour: parseFloat(editingLesson.pricePerHour),
                  }
                : selectedDate
                  ? { dateTime: selectedDate }
                  : undefined
            }
            onSubmit={handleLessonSubmit}
            onCancel={() => {
              setShowLessonForm(false);
              setEditingLesson(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-all-future-schedule"
                checked={deleteAllFuture}
                onCheckedChange={(checked) => setDeleteAllFuture(!!checked)}
              />
              <Label htmlFor="delete-all-future-schedule" className="text-sm">
                Delete all future lessons on the same day and time
              </Label>
            </div>
            {deleteAllFuture && (
              <p className="text-sm text-muted-foreground">
                This will delete all future lessons for the same student that
                occur on the same day of the week at the same time.
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLesson}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {deleteAllFuture ? "All Future Lessons" : "Lesson"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showCommentForm} onOpenChange={setShowCommentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCommentId ? "Edit Comment" : "Add Comment"}
            </DialogTitle>
          </DialogHeader>
          <CommentForm
            initialData={
              editingCommentData
                ? {
                    title: editingCommentData.title,
                    content: editingCommentData.content,
                    visibleToStudent: editingCommentData.visibleToStudent === 1,
                  }
                : undefined
            }
            isEditing={!!editingCommentId}
            onSubmit={async (data) => {
              if (editingCommentId) {
                await handleEditComment(editingCommentId, {
                  title: data.title,
                  content: data.content,
                  visibleToStudent: data.visibleToStudent ? 1 : 0,
                });
              } else {
                await handleCommentSubmit(data);
              }
            }}
            onCancel={() => {
              setShowCommentForm(false);
              setCommentFormLessonId(null);
              setEditingCommentId(null);
              setEditingCommentData(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <ScheduleCommentsDialog
        lessonId={viewCommentsLessonId}
        onClose={() => setViewCommentsLessonId(null)}
        onDeleteComment={handleDeleteComment}
        onEditComment={handleStartEditComment}
      />
    </>
  );
}

// Helper function to detect and linkify URLs
const linkifyText = (text: string): JSX.Element => {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, index) => {
        // Check if the part matches a URL
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
};

function ScheduleCommentsDialog({
  lessonId,
  onClose,
  onDeleteComment,
  onEditComment,
  isStudentView = false,
}: {
  lessonId: string | null;
  onClose: () => void;
  onDeleteComment: (commentId: string) => void;
  onEditComment?: (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number },
  ) => void;
  isStudentView?: boolean;
}) {
  const { data: comments = [] } = useCommentsByLesson(lessonId || "");

  return (
    <Dialog open={!!lessonId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        {comments.length > 0 ? (
          <div className="grid gap-4 py-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-l-2 border-primary/20 pl-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium">{comment.title}</p>
                        {!isStudentView && comment.visibleToStudent ? (
                          <Eye
                            className="h-3 w-3 text-muted-foreground"
                            title="Visible to student"
                          />
                        ) : (
                          <EyeOff
                            className="h-3 w-3 text-muted-foreground"
                            title="Not visible to student"
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {linkifyText(comment.content)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                        {comment.lastEdited && (
                          <span className="ml-2 italic">
                            (edited{" "}
                            {format(
                              new Date(comment.lastEdited),
                              "MMM d, h:mm a",
                            )}
                            )
                          </span>
                        )}
                      </p>
                    </div>
                    {!isStudentView && (
                      <div className="flex gap-1">
                        {onEditComment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onEditComment(comment.id, {
                                title: comment.title,
                                content: comment.content,
                                visibleToStudent: comment.visibleToStudent,
                              });
                              onClose();
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onDeleteComment(comment.id);
                            if (comments.length === 1) {
                              onClose();
                            }
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No comments available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AnalyticsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Analytics dashboard coming soon...
        </p>
      </CardContent>
    </Card>
  );
}

function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Settings panel coming soon...</p>
      </CardContent>
    </Card>
  );
}

function StudentCalendarPage() {
  const params = useParams<{ studentId: string }>();
  const { data: lessonsData = [], isLoading: lessonsLoading } = useLessons();
  const { data: studentsData = [], isLoading: studentsLoading } = useStudents();

  // Find the student by their 6-digit studentId
  const student = (studentsData as any[]).find(
    (s: any) => s.studentId === params.studentId,
  );

  if (lessonsLoading || studentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading calendar...
      </div>
    );
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center" data-testid="student-not-found">
            <h2
              className="text-2xl font-bold mb-2"
              data-testid="text-not-found-title"
            >
              Student Not Found
            </h2>
            <p
              className="text-muted-foreground"
              data-testid="text-not-found-message"
            >
              No student found with ID: {params.studentId}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform lessons data for calendar display
  const displayLessons = (lessonsData as any[]).map((lesson: any) => {
    const lessonStudent = (studentsData as any[]).find(
      (s: any) => s.id === lesson.studentId,
    );
    return {
      ...lesson,
      dateTime: new Date(lesson.dateTime),
      studentName: lessonStudent
        ? `${lessonStudent.firstName} ${lessonStudent.lastName || ""}`
        : "Unknown Student",
      studentColor: lessonStudent?.defaultColor || "#3b82f6",
      studentId: lesson.studentId,
      pricePerHour: parseFloat(lesson.pricePerHour),
    };
  });

  const handleLessonClick = (lesson: any) => {
    // Only open link for this student's lessons
    if (lesson.studentId === student.id && lesson.lessonLink) {
      window.open(lesson.lessonLink, "_blank");
    }
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold" data-testid="student-name">
          Calendar for {student.firstName} {student.lastName || ""} (ID:{" "}
          {student.studentId})
        </h1>
      </div>
      <CalendarView
        lessons={displayLessons}
        onLessonClick={handleLessonClick}
        onDateClick={() => {}}
        onUpdatePaymentStatus={() => {}}
        focusedStudentId={student.id}
      />
    </>
  );
}

function StudentSchedulePage() {
  const params = useParams<{ studentId: string }>();
  const { data: lessonsData = [], isLoading: lessonsLoading } = useLessons();
  const { data: studentsData = [], isLoading: studentsLoading } = useStudents();
  const [viewCommentsLessonId, setViewCommentsLessonId] = useState<
    string | null
  >(null);
  const isMobile = useIsMobile();

  // Find the student by their 6-digit studentId
  const student = (studentsData as any[]).find(
    (s: any) => s.studentId === params.studentId,
  );

  if (lessonsLoading || studentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading schedule...
      </div>
    );
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center" data-testid="student-not-found">
            <h2
              className="text-2xl font-bold mb-2"
              data-testid="text-not-found-title"
            >
              Student Not Found
            </h2>
            <p
              className="text-muted-foreground"
              data-testid="text-not-found-message"
            >
              No student found with ID: {params.studentId}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter lessons for only this student, starting from last week
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(0, 0, 0, 0);

  const displayLessons = (lessonsData as any[])
    .filter((lesson: any) => lesson.studentId === student.id)
    .map((lesson: any) => {
      return {
        ...lesson,
        dateTime: new Date(lesson.dateTime),
        studentName: `${student.firstName} ${student.lastName || ""}`,
        studentColor: student.defaultColor || "#3b82f6",
        pricePerHour: parseFloat(lesson.pricePerHour),
      };
    })
    .filter((lesson: any) => lesson.dateTime >= lastWeek)
    .sort((a: any, b: any) => a.dateTime.getTime() - b.dateTime.getTime());

  // Group lessons by date
  const groupedLessons = displayLessons.reduce((groups: any, lesson: any) => {
    const dateKey = format(lesson.dateTime, "yyyy-MM-dd");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(lesson);
    return groups;
  }, {});

  const handleJoinLesson = (lesson: Lesson) => {
    if (lesson.lessonLink) {
      window.open(lesson.lessonLink, "_blank");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            Schedule for {student.firstName} {student.lastName || ""} (
            {displayLessons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayLessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No lessons scheduled from last week onwards.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLessons).map(
                ([dateKey, lessons]: [string, any], index: number) => {
                  const date = new Date(dateKey);
                  const isToday = format(new Date(), "yyyy-MM-dd") === dateKey;
                  const isPast =
                    date < new Date(new Date().setHours(0, 0, 0, 0));

                  // Check if this is the first lesson of a new month
                  const isFirstLessonOfMonth =
                    index === 0 ||
                    format(date, "yyyy-MM") !==
                      format(
                        new Date(Object.keys(groupedLessons)[index - 1]),
                        "yyyy-MM",
                      );

                  return (
                    <div
                      key={dateKey}
                      className="space-y-3"
                      data-date-key={dateKey}
                    >
                      {isFirstLessonOfMonth && (
                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-foreground mb-2">
                            {format(date, "MMMM yyyy")}
                          </h2>
                          <div className="h-px bg-border"></div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <h3
                          className={`text-lg font-semibold ${isToday ? "text-primary" : isPast ? "text-muted-foreground" : ""}`}
                        >
                          {isToday ? "Today" : format(date, "EEE d")}
                        </h3>
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-sm text-muted-foreground">
                          {lessons.length} lesson
                          {lessons.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="space-y-3 pl-4">
                        {lessons.map((lesson) =>
                          isMobile ? (
                            <LessonWithComments
                              key={lesson.id}
                              lesson={lesson}
                              onEdit={() => {}}
                              onDelete={() => {}}
                              onJoinLesson={
                                lesson.lessonLink
                                  ? () => handleJoinLesson(lesson)
                                  : undefined
                              }
                              onUpdatePaymentStatus={() => {}}
                              onViewComments={setViewCommentsLessonId}
                              isStudentView={true}
                            />
                          ) : (
                            <LessonCardWithComments
                              key={lesson.id}
                              lesson={lesson}
                              onEdit={() => {}}
                              onDelete={() => {}}
                              onJoinLesson={handleJoinLesson}
                              showCommentActions={false}
                              isStudentView={true}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ScheduleCommentsDialog
        lessonId={viewCommentsLessonId}
        onClose={() => setViewCommentsLessonId(null)}
        onDeleteComment={() => {}}
        isStudentView={true}
      />
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={CalendarPage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/students" component={StudentsPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/:studentId/calendar" component={StudentCalendarPage} />
      <Route path="/:studentId/schedule" component={StudentSchedulePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [location, setLocation] = useLocation();

  const { data: studentsData = [] } = useStudents();
  const { data: lessonsData = [] } = useLessons();
  const createLessonMutation = useCreateLesson();
  const createLessonWithRecurringMutation = useCreateLessonWithRecurring();
  const createStudentMutation = useCreateStudent();
  const { toast } = useToast();

  // Check if we're on a student calendar or schedule view
  const studentViewMatch = location.match(/^\/(\d{6})\/(calendar|schedule)$/);
  const isStudentView = !!studentViewMatch;
  const studentId = studentViewMatch?.[1];
  const shouldShowNavigation = true; // Always show navigation now

  const getDefaultDateTime = () => {
    const now = new Date();
    // Set to next hour
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now;
  };

  const handleAddLesson = () => {
    setShowLessonForm(true);
  };

  const handleAddStudent = () => {
    setShowStudentForm(true);
  };

  const handleLessonSubmit = async (lessonData: any) => {
    try {
      if (lessonData.isRecurring && lessonData.endDate) {
        // Handle recurring lesson creation
        const recurringData = {
          lesson: {
            subject: lessonData.subject,
            dateTime: new Date(lessonData.dateTime),
            studentId: lessonData.studentId,
            lessonLink: lessonData.lessonLink,
            pricePerHour: lessonData.pricePerHour.toString(),
            duration: lessonData.duration,
            paymentStatus: lessonData.paymentStatus || "pending",
          },
          recurring: {
            frequency: lessonData.frequency,
            endDate: lessonData.endDate,
          },
        };

        await createLessonWithRecurringMutation.mutateAsync(recurringData);
        toast({
          title: "Success",
          description: "Recurring lessons scheduled successfully",
        });
      } else {
        // Handle single lesson creation
        const formattedData = {
          subject: lessonData.subject,
          dateTime: new Date(lessonData.dateTime),
          studentId: lessonData.studentId,
          lessonLink: lessonData.lessonLink,
          pricePerHour: lessonData.pricePerHour.toString(),
          duration: lessonData.duration,
          paymentStatus: lessonData.paymentStatus || "pending",
        };

        await createLessonMutation.mutateAsync(formattedData);
        toast({
          title: "Success",
          description: "Lesson scheduled successfully",
        });
      }

      setShowLessonForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule lesson",
        variant: "destructive",
      });
    }
  };

  const handleStudentSubmit = async (studentData: any) => {
    try {
      const formattedData = {
        ...studentData,
        defaultRate: studentData.defaultRate
          ? studentData.defaultRate.toString()
          : null,
      };

      await createStudentMutation.mutateAsync(formattedData);
      toast({ title: "Success", description: "Student added successfully" });
      setShowStudentForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {shouldShowNavigation && (
        <Navigation
          onAddLesson={handleAddLesson}
          onAddStudent={handleAddStudent}
          lessonCount={(lessonsData as any[]).length}
          studentCount={(studentsData as any[]).length}
          isStudentView={isStudentView}
          studentId={studentId}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Router />
        </main>
      </div>

      {/* Global Lesson Form Modal */}
      <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Lesson</DialogTitle>
          </DialogHeader>
          <LessonForm
            students={studentsData as any[]}
            onSubmit={handleLessonSubmit}
            onCancel={() => setShowLessonForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Global Student Form Modal */}
      <Dialog open={showStudentForm} onOpenChange={setShowStudentForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <StudentForm
            onSubmit={handleStudentSubmit}
            onCancel={() => setShowStudentForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AuthenticatedApp() {
  const [location] = useLocation();
  const { data: authData, isLoading } = useAuth();

  // Allow access to student calendar and schedule views without authentication
  const isStudentCalendarView = location.match(/^\/\d{6}\/calendar$/);
  const isStudentScheduleView = location.match(/^\/\d{6}\/schedule$/);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Show login form if not authenticated and not on public route
  if (
    !isStudentCalendarView &&
    !isStudentScheduleView &&
    !authData?.authenticated
  ) {
    return <LoginForm />;
  }

  return <AppContent />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthenticatedApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
