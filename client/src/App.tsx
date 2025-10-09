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
} from "./hooks/useComments";
import CommentForm from "./components/CommentForm";
import { format } from "date-fns";
import NotFound from "@/pages/not-found";
import { useQueryClient } from "@tanstack/react-query";
import { Lesson } from "./types/Lesson";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  const [selectedLessonForComment, setSelectedLessonForComment] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: lessonsData = [], isLoading: lessonsLoading } = useLessons();
  const { data: studentsData = [] } = useStudents();
  const createLessonMutation = useCreateLesson();
  const createLessonWithRecurringMutation = useCreateLessonWithRecurring();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();
  const createCommentMutation = useCreateComment();

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
      studentColor: student?.defaultColor || '#3b82f6',
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

  const handleUpdatePaymentStatus = async (lessonId: string, status: 'pending' | 'paid' | 'unpaid') => {
    try {
      const lessonToUpdate = (lessonsData as any[]).find((l: any) => l.id === lessonId);
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

  const handleCommentSubmit = async (data: { title: string; content: string; visibleToStudent: boolean }) => {
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
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <CommentForm
            onSubmit={handleCommentSubmit}
            onCancel={() => {
              setShowCommentForm(false);
              setSelectedLessonForComment(null);
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
  const { toast } = useToast();

  const { data: studentsData = [], isLoading: studentsLoading } = useStudents();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();
  const createLessonMutation = useCreateLesson();

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
    setSelectedStudentForLesson(student);
    setShowLessonForm(true);
  };

  const handleViewLessons = (studentId: string) => {
    const student = (studentsData as any[]).find(
      (s: any) => s.id === studentId,
    );
    if (student?.studentId) {
      window.location.href = `/${student.studentId}/calendar`;
    }
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
  const [commentFormLessonId, setCommentFormLessonId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined);
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
        studentColor: student?.defaultColor || '#3b82f6',
        pricePerHour: parseFloat(lesson.pricePerHour),
      };
    })
    .filter((lesson: any) => lesson.dateTime >= lastWeek)
    .sort((a: any, b: any) => a.dateTime.getTime() - b.dateTime.getTime());

  // Group lessons by date
  const groupedLessons = displayLessons.reduce((groups: any, lesson: any) => {
    const dateKey = format(lesson.dateTime, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(lesson);
    return groups;
  }, {});

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowLessonForm(true);
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    setLessonToDelete(lesson);
    setDeleteAllFuture(false);
    setShowDeleteDialog(true);
  };

  const handleJoinLesson = (lesson: Lesson) => {
    if (lesson.lessonLink) {
      window.open(lesson.lessonLink, "_blank");
    }
  };

  const handleUpdatePaymentStatus = async (lessonId: string, status: 'pending' | 'paid' | 'unpaid' | 'free') => {
    try {
      const lessonToUpdate = (lessonsData as any[]).find((l: any) => l.id === lessonId);
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

  const handleCommentSubmit = async (data: { title: string; content: string; visibleToStudent: boolean }) => {
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  // Auto-scroll to today's section on mount
  useEffect(() => {
    const todayDateKey = format(new Date(), 'yyyy-MM-dd');
    const todayElement = document.querySelector(`[data-date-key="${todayDateKey}"]`);
    if (todayElement) {
      setTimeout(() => {
        todayElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // Mobile lesson card component matching calendar view style
  const MobileLessonCard = ({ lesson }: { lesson: Lesson & { studentName: string; studentColor?: string } }) => {
    const { data: comments = [] } = useCommentsByLesson(lesson.id);
    const hasComments = comments.length > 0;

    const getPaymentStatusColor = (status: string) => {
      switch (status) {
        case "paid":
          return "bg-lesson-confirmed text-white";
        case "pending":
          return "bg-lesson-pending text-black";
        case "unpaid":
          return "bg-lesson-cancelled text-white";
        case "free":
          return "bg-gray-400 text-white";
        default:
          return "bg-secondary";
      }
    };

    const lessonContent = (
      <div
        className="p-2 rounded text-xs hover-elevate group border-l-2"
        style={{
          backgroundColor: `${lesson.studentColor}15`,
          borderLeftColor: lesson.studentColor || "#3b82f6",
        }}
        data-testid={`lesson-${lesson.id}`}
      >
        <div
          className="cursor-pointer"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleEditLesson(lesson);
          }}
        >
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate text-xs font-medium">
              {format(lesson.dateTime, "HH:mm")}-
              {format(
                new Date(lesson.dateTime.getTime() + lesson.duration * 60000),
                "HH:mm",
              )}
            </span>
            {hasComments && (
              <div className="flex items-center gap-0.5 ml-auto">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{comments.length}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="truncate font-semibold text-sm leading-tight">{lesson.studentName}</div>
            <div className="truncate text-muted-foreground text-sm leading-tight">{lesson.subject}</div>
          </div>

          <div className="flex items-center gap-1 mt-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getPaymentStatusColor(lesson.paymentStatus)} hover:opacity-80 cursor-pointer mt-1`}
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`dropdown-payment-status-${lesson.id}`}
                >
                  {lesson.paymentStatus}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleUpdatePaymentStatus(lesson.id, "pending")}
                  className={
                    lesson.paymentStatus === "pending" ? "bg-accent" : ""
                  }
                >
                  <span className="w-3 h-3 rounded-full bg-lesson-pending mr-2"></span>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdatePaymentStatus(lesson.id, "paid")}
                  className={lesson.paymentStatus === "paid" ? "bg-accent" : ""}
                >
                  <span className="w-3 h-3 rounded-full bg-lesson-confirmed mr-2"></span>
                  Paid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdatePaymentStatus(lesson.id, "unpaid")}
                  className={
                    lesson.paymentStatus === "unpaid" ? "bg-accent" : ""
                  }
                >
                  <span className="w-3 h-3 rounded-full bg-lesson-cancelled mr-2"></span>
                  Unpaid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdatePaymentStatus(lesson.id, "free")}
                  className={lesson.paymentStatus === "free" ? "bg-accent" : ""}
                >
                  <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                  Free
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2">
          {lesson.lessonLink && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleJoinLesson(lesson);
              }}
              className="h-7 flex-1 text-xs px-2"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Join
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setCommentFormLessonId(lesson.id);
            }}
            className="h-7 w-7 p-0"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleDeleteLesson(lesson);
            }}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive border-destructive/50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );

    if (!hasComments) {
      return lessonContent;
    }

    return (
      <HoverCard openDelay={300}>
        <HoverCardTrigger asChild>
          <div>{lessonContent}</div>
        </HoverCardTrigger>
        <HoverCardContent
          className="w-80 bg-popover border-popover-border"
          style={{ zIndex: 99999 }}
          side="bottom"
          align="start"
          sideOffset={8}
        >
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Comments ({comments.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-l-2 border-primary/20 pl-2"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium">{comment.title}</p>
                    {comment.visibleToStudent === 1 && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        Visible
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {comment.content}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDate(new Date(comment.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

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
              {Object.entries(groupedLessons).map(([dateKey, lessons]: [string, any], index: number) => {
                const date = new Date(dateKey);
                const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                // Check if this is the first lesson of a new month
                const isFirstLessonOfMonth = index === 0 ||
                  format(date, 'yyyy-MM') !== format(new Date(Object.keys(groupedLessons)[index - 1]), 'yyyy-MM');

                return (
                  <div key={dateKey} className="space-y-3" data-date-key={dateKey}>
                    {isFirstLessonOfMonth && (
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                          {format(date, 'MMMM yyyy')}
                        </h2>
                        <div className="h-px bg-border"></div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <h3 className={`text-lg font-semibold ${isToday ? 'text-primary' : isPast ? 'text-muted-foreground' : ''}`}>
                        {isToday ? 'Today' : format(date, 'EEE d')}
                      </h3>
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-sm text-muted-foreground">
                        {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-3 pl-4">
                      {lessons.map((lesson) => (
                        isMobile ? (
                          <MobileLessonCard key={lesson.id} lesson={lesson} />
                        ) : (
                          <LessonCardWithComments
                            key={lesson.id}
                            lesson={lesson}
                            onEdit={handleEditLesson}
                            onDelete={handleDeleteLesson}
                            onJoinLesson={handleJoinLesson}
                            onUpdatePaymentStatus={handleUpdatePaymentStatus}
                            onAddComment={(lessonId) => setCommentFormLessonId(lessonId)}
                            onDeleteComment={handleDeleteComment}
                          />
                        )
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Schedule New Lesson"}</DialogTitle>
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
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <CommentForm
            onSubmit={handleCommentSubmit}
            onCancel={() => {
              setShowCommentForm(false);
              setCommentFormLessonId(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
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
    (s: any) => s.studentId === params.studentId
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
            <h2 className="text-2xl font-bold mb-2" data-testid="text-not-found-title">
              Student Not Found
            </h2>
            <p className="text-muted-foreground" data-testid="text-not-found-message">
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
      (s: any) => s.id === lesson.studentId
    );
    return {
      ...lesson,
      dateTime: new Date(lesson.dateTime),
      studentName: lessonStudent
        ? `${lessonStudent.firstName} ${lessonStudent.lastName || ""}`
        : "Unknown Student",
      studentColor: lessonStudent?.defaultColor || '#3b82f6',
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
          Calendar for {student.firstName} {student.lastName || ""} (ID: {student.studentId})
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={CalendarPage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/students" component={StudentsPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/:studentId/calendar" component={StudentCalendarPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [location] = useLocation();

  const { data: studentsData = [] } = useStudents();
  const { data: lessonsData = [] } = useLessons();
  const createLessonMutation = useCreateLesson();
  const createLessonWithRecurringMutation = useCreateLessonWithRecurring();
  const createStudentMutation = useCreateStudent();
  const { toast } = useToast();

  // Check if we're on a student calendar view
  const isStudentCalendarView = location.match(/^\/\d{6}\/calendar$/);
  const shouldShowNavigation = !isStudentCalendarView;

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

  // Allow access to student calendar view without authentication
  const isStudentCalendarView = location.match(/^\/\d{6}\/calendar$/);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Show login form if not authenticated and not on public route
  if (!isStudentCalendarView && !authData?.authenticated) {
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