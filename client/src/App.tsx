import { useState } from "react";
import { Switch, Route, useParams, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/LoginForm";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import CalendarView from "./components/CalendarView";
import Navigation from "./components/Navigation";
import LessonForm from "./components/LessonForm";
import StudentForm from "./components/StudentForm";
import ThemeToggle from "./components/ThemeToggle";
import StudentCard from "./components/StudentCard";
import ScheduleCommentsDialog from "./components/ScheduleCommentsDialog";
import ScheduleView from "./components/ScheduleView";
import { useStudents, useDeleteStudent, useUpdateStudent } from "./hooks/useStudents";
import { useLessons } from "./hooks/useLessons";
import { useParents } from "./hooks/useParents";
// Updated imports to include delete and update payment hooks
import { usePayments, useCreatePayment, useDeletePayment, useUpdatePayment, usePaymentLessons, useStudentPayments, useStudentPaymentLessons } from "./hooks/usePayments";
import ParentForm from "./components/ParentForm";
import PaymentForm from "./components/PaymentForm";
import { useParentForm } from "./hooks/useParentForm";
import NoteForm from "./components/NoteForm";
import CommentFormDialog from "./components/CommentFormDialog";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "./hooks/useTags";
import DeleteLessonDialog from "./components/DeleteLessonDialog";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO, isBefore, isAfter, addDays } from 'date-fns';
import NotFound from "@/pages/not-found";
import { Lesson } from "./types/Lesson";
import { Button } from "@/components/ui/button";
import { linkifyText } from "@/lib/linkify";
import { useCommentHandlers } from "./hooks/useCommentHandlers";
import { useLessonDelete } from "./hooks/useLessonDelete";
import { usePaymentStatus } from "./hooks/usePaymentStatus";
import { useLessonForm } from "./hooks/useLessonForm";
import { useStudentForm } from "./hooks/useStudentForm";
import { useStudentNotes } from "./hooks/useStudentNotes";
import { useLessonData } from "./hooks/useLessonData";
import { useDialogState } from "./hooks/useDialogState";
import { Edit, Trash2, Plus, Filter } from "lucide-react";
import { useStudentByStudentId, useStudentLessonsByStudentId } from "@/hooks/useStudentData";
import { handleJoinLessonLink, calculateStudentStats } from "@/utils/lessonHelpers";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * CalendarPage: Main calendar view showing lessons in a month/week grid
 * Handles lesson creation, editing, deletion, and payment status updates
 */
function CalendarPage() {
  // Set page title
  useState(() => {
    document.title = "Hydra - Calendar";
  });

  // Fetch lesson and student data from the database
  const { lessonsData, studentsData, displayLessons, lessonsLoading } = useLessonData();

  // Handle lesson deletion with option to delete recurring lessons
  // Provides dialog state and handlers for confirming deletion
  const {
    showDeleteDialog,
    setShowDeleteDialog,
    deleteAllFuture,
    setDeleteAllFuture,
    handleDeleteLesson,
    confirmDeleteLesson,
  } = useLessonDelete(lessonsData as any[]);

  // Handle payment status updates (pending, paid, overdue, etc.)
  // Provides mutation handler for updating lesson payment status
  const { handleUpdatePaymentStatus } = usePaymentStatus(lessonsData as any[]);

  // Manage comment form state and handlers
  // Handles adding, editing, and submitting comments for lessons
  const {
    showCommentForm,
    setShowCommentForm,
    editingCommentId,
    editingCommentData,
    handleAddComment,
    handleCommentSubmit,
    handleStartEditComment,
    handleEditComment,
    resetCommentForm,
  } = useCommentHandlers();

  // Manage lesson form state and handlers
  // Controls lesson creation/editing dialog and form submission
  const {
    showLessonForm,
    selectedLesson,
    selectedDate,
    handleOpenForm: handleOpenLessonForm,
    handleCloseForm: handleCloseLessonForm,
    handleSubmit: handleLessonSubmit,
  } = useLessonForm();

  /**
   * Handle lesson click event
   * Finds the original lesson data and opens the edit form
   */
  const handleLessonClick = (lesson: any) => {
    const originalLesson = (lessonsData as any[]).find(
      (l: any) => l.id === lesson.id,
    );
    if (originalLesson) {
      handleOpenLessonForm({ lesson: originalLesson });
    }
  };

  /**
   * Handle date click event in calendar
   * Opens lesson form with the selected date pre-filled
   */
  const handleDateClick = (date: Date) => {
    handleOpenLessonForm({ date });
  };

  /**
   * Handle join lesson button click
   * Opens the lesson link in a new window
   */
  const handleJoinLesson = (lesson: any) => {
    handleJoinLessonLink(lesson.lessonLink);
  };

  // Show loading state while fetching lessons
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
        // The calendar navigation buttons (left/right arrows for month change)
        // should have their click handlers modified to prevent default form submission behavior.
        // This is assumed to be handled within the CalendarView component itself.
      />

      <Dialog open={showLessonForm} onOpenChange={handleCloseLessonForm}>
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
            onCancel={handleCloseLessonForm}
          />
        </DialogContent>
      </Dialog>

      <DeleteLessonDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        deleteAllFuture={deleteAllFuture}
        onDeleteAllFutureChange={setDeleteAllFuture}
        onConfirm={confirmDeleteLesson}
      />

      <CommentFormDialog
        open={showCommentForm}
        onOpenChange={setShowCommentForm}
        editingCommentData={editingCommentData}
        isEditing={!!editingCommentId}
        onSubmit={async (data) => {
          if (editingCommentId) {
            await handleEditComment(editingCommentId, {
              title: data.title,
              content: data.content,
              visibleToStudent: data.visibleToStudent ? 1 : 0,
              tagIds: data.tagIds,
            });
          } else {
            await handleCommentSubmit(data);
          }
        }}
        onCancel={resetCommentForm}
      />
    </>
  );
}

/**
 * StudentsPage: View and manage all students
 * Allows adding, editing, deleting students and viewing their lessons/notes
 */
function StudentsPage() {
  // Set page title
  useState(() => {
    document.title = "Hydra - Students";
  });

  // Track delete confirmation input to ensure user confirms deletion
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  // Track which student's notes are being viewed
  const [selectedStudentForNotes, setSelectedStudentForNotes] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch students and lessons data from the database
  const { data: studentsData = [], isLoading: studentsLoading } = useStudents();
  const { data: lessonsData = [] } = useLessons();
  const deleteStudentMutation = useDeleteStudent();

  // Manage delete confirmation dialog state
  const { isOpen: showDeleteDialog, data: studentToDelete, open: openDeleteDialog, close: closeDeleteDialog } = useDialogState<any>();

  // Manage student form state (add/edit student)
  const {
    showStudentForm,
    selectedStudent,
    handleOpenForm: handleOpenStudentForm,
    handleCloseForm: handleCloseStudentForm,
    handleSubmit: handleStudentSubmit,
  } = useStudentForm();

  // Manage lesson form state for scheduling lessons for a student
  const {
    showLessonForm,
    prefilledStudentId,
    getDefaultDateTime,
    handleOpenForm: handleOpenLessonForm,
    handleCloseForm: handleCloseLessonForm,
    handleSubmit: handleLessonSubmit,
  } = useLessonForm();

  // Manage notes dialog and form state for viewing/editing student notes
  const {
    showNotesDialog,
    showNoteForm,
    editingNote,
    notesData,
    handleOpenNotes,
    handleCloseNotes,
    handleAddNote,
    handleEditNote,
    handleNoteSubmit,
    handleDeleteNote,
    setShowNoteForm,
    setEditingNote,
  } = useStudentNotes(selectedStudentForNotes);

  /**
   * Handle edit student button click
   * Opens the student form with the selected student's data
   */
  const handleEditStudent = (studentId: string) => {
    const student = (studentsData as any[]).find((s: any) => s.id === studentId);
    handleOpenStudentForm(student);
  };

  /**
   * Handle schedule lesson button click
   * Opens lesson form pre-filled with student data
   */
  const handleScheduleLesson = (studentId: string) => {
    const student = (studentsData as any[]).find((s: any) => s.id === studentId);
    if (student) {
      handleOpenLessonForm({ studentId: student.id });
    }
  };

  /**
   * Handle view lessons button click
   * Navigates to the student's calendar view
   */
  const handleViewLessons = (studentId: string) => {
    const student = (studentsData as any[]).find((s: any) => s.id === studentId);
    if (student?.studentId) {
      window.location.href = `/calendar/${student.studentId}`;
    }
  };

  /**
   * Handle view notes button click
   * Opens the notes dialog for the selected student
   */
  const handleViewNotes = (studentId: string) => {
    setSelectedStudentForNotes(studentId);
    handleOpenNotes();
  };

  /**
   * Handle delete student button click
   * Opens delete confirmation dialog
   */
  const handleDeleteStudent = (studentId: string) => {
    const student = (studentsData as any[]).find(
      (s: any) => s.id === studentId,
    );
    openDeleteDialog(student);
    setDeleteConfirmationText("");
  };

  /**
   * Confirm student deletion
   * Validates confirmation text and deletes student with all associated data
   */
  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    // Ensure user typed the student's first name to confirm
    if (deleteConfirmationText !== studentToDelete.firstName) {
      toast({
        title: "Error",
        description: "Please type the student's first name to confirm deletion",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete student and all associated lessons
      await deleteStudentMutation.mutateAsync(studentToDelete.id);
      toast({
        title: "Success",
        description: `Student ${studentToDelete.firstName} ${studentToDelete.lastName || ""} and all associated lessons have been deleted.`,
      });
      closeDeleteDialog();
      setDeleteConfirmationText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  /**
   * Cancel student deletion
   * Closes the dialog and resets confirmation text
   */
  const cancelDeleteStudent = () => {
    closeDeleteDialog();
    setDeleteConfirmationText("");
  };

  // Show loading state while fetching students
  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading students...
      </div>
    );
  }

  // Calculate lesson statistics (count, hours, earnings) for each student
  const studentsWithStats = (studentsData as any[]).map((student: any) =>
    calculateStudentStats(student, lessonsData as any[])
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Students ({studentsWithStats.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsWithStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No students added yet.</p>
              <p>Click "Add Student" in the sidebar to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentsWithStats.map((student: any) => (
                <StudentCard
                  key={student.id}
                  student={student}
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

      <Dialog open={showStudentForm} onOpenChange={handleCloseStudentForm}>
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
            onCancel={handleCloseStudentForm}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showLessonForm} onOpenChange={handleCloseLessonForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Lesson</DialogTitle>
          </DialogHeader>
          <LessonForm
            students={studentsData as any[]}
            initialData={
              prefilledStudentId
                ? (() => {
                    const student = (studentsData as any[]).find(
                      (s: any) => s.id === prefilledStudentId
                    );
                    return student
                      ? {
                          studentId: student.id,
                          subject: student.defaultSubject,
                          pricePerHour: student.defaultRate
                            ? parseFloat(student.defaultRate)
                            : 50,
                          lessonLink: student.defaultLink,
                          dateTime: getDefaultDateTime(),
                        }
                      : undefined;
                  })()
                : undefined
            }
            onSubmit={handleLessonSubmit}
            onCancel={handleCloseLessonForm}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={closeDeleteDialog}>
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
          <div className="py-4">
            <Label htmlFor="delete-confirmation" className="text-sm font-medium">
              Type <strong>{studentToDelete?.firstName}</strong> to confirm:
            </Label>
            <Input
              id="delete-confirmation"
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder={studentToDelete?.firstName}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteStudent}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStudent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteConfirmationText !== studentToDelete?.firstName}
            >
              Delete Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showNotesDialog} onOpenChange={handleCloseNotes}>
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
                            {linkifyText(note.content)}
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
  // Set page title
  useState(() => {
    document.title = "Hydra - Schedule";
  });

  const { lessonsData, studentsData, displayLessons, lessonsLoading } = useLessonData();

  const {
    showDeleteDialog,
    setShowDeleteDialog,
    deleteAllFuture,
    setDeleteAllFuture,
    handleDeleteLesson,
    confirmDeleteLesson,
  } = useLessonDelete(lessonsData as any[]);

  const { handleUpdatePaymentStatus } = usePaymentStatus(lessonsData as any[]);

  const {
    showCommentForm,
    setShowCommentForm,
    viewCommentsLessonId,
    setViewCommentsLessonId,
    editingCommentId,
    editingCommentData,
    handleAddComment,
    handleCommentSubmit,
    handleStartEditComment,
    handleEditComment,
    handleDeleteComment,
    resetCommentForm,
  } = useCommentHandlers();

  const {
    showLessonForm,
    selectedLesson,
    handleOpenForm: handleOpenLessonForm,
    handleCloseForm: handleCloseLessonForm,
    handleSubmit: handleLessonSubmit,
  } = useLessonForm();

  const handleEditLesson = (lessonIdOrLesson: string | Lesson) => {
    const lesson =
      typeof lessonIdOrLesson === "string"
        ? (lessonsData as any[]).find((l: any) => l.id === lessonIdOrLesson)
        : lessonIdOrLesson;

    if (lesson) {
      handleOpenLessonForm({ lesson });
    }
  };

  const handleJoinLesson = (lesson: Lesson) => {
    if (lesson.lessonLink) {
      window.open(lesson.lessonLink, "_blank");
    }
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
      <ScheduleView
        lessons={displayLessons}
        onEdit={handleEditLesson}
        onDelete={handleDeleteLesson}
        onJoinLesson={handleJoinLesson}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
        onAddComment={handleAddComment}
        onViewComments={setViewCommentsLessonId}
        onEditComment={handleStartEditComment}
        onDeleteComment={handleDeleteComment}
      />

      <Dialog open={showLessonForm} onOpenChange={handleCloseLessonForm}>
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
                : undefined
            }
            onSubmit={handleLessonSubmit}
            onCancel={handleCloseLessonForm}
          />
        </DialogContent>
      </Dialog>

      <DeleteLessonDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        deleteAllFuture={deleteAllFuture}
        onDeleteAllFutureChange={setDeleteAllFuture}
        onConfirm={confirmDeleteLesson}
        testIdPrefix="schedule"
      />

      <CommentFormDialog
        open={showCommentForm}
        onOpenChange={setShowCommentForm}
        editingCommentData={editingCommentData}
        isEditing={!!editingCommentId}
        onSubmit={async (data) => {
          if (editingCommentId) {
            await handleEditComment(editingCommentId, {
              title: data.title,
              content: data.content,
              visibleToStudent: data.visibleToStudent ? 1 : 0,
              tagIds: data.tagIds,
            });
          } else {
            await handleCommentSubmit(data);
          }
        }}
        onCancel={resetCommentForm}
      />

      <ScheduleCommentsDialog
        lessonId={viewCommentsLessonId}
        onClose={() => setViewCommentsLessonId(null)}
        onDeleteComment={handleDeleteComment}
        onEditComment={handleStartEditComment}
        isStudentView={false}
      />
    </>
  );
}

function PaymentsPage() {
  // Set page title
  useState(() => {
    document.title = "Hydra - Payments";
  });

  const { data: paymentsData = [], isLoading: paymentsLoading } = usePayments();
  const { data: studentsData = [] } = useStudents();
  const { data: parentsData = [] } = useParents();
  const { data: lessonsData = [] } = useLessons();
  const createPaymentMutation = useCreatePayment();
  // Assume these are now available due to updated imports
  const deletePaymentMutation = useDeletePayment();
  const updatePaymentMutation = useUpdatePayment();
  const { toast } = useToast();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any | null>(null);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  // Filter and grouping state
  const [selectedPayerIds, setSelectedPayerIds] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [groupBy, setGroupBy] = useState<'none' | 'month' | 'payer'>('month');


  const handleAddPayment = () => {
    setEditingPayment(null); // Ensure we're in create mode
    setShowPaymentForm(true);
  };

  const handleEditPayment = async (payment: any) => {
    setEditingPayment(payment);
    setShowPaymentForm(true);
  };

  const handleDeletePayment = (payment: any) => {
    setPaymentToDelete(payment);
    setShowDeleteDialog(true);
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    setEditingPayment(null); // Clear editing state
  };

  const handleConfirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    try {
      await deletePaymentMutation.mutateAsync(paymentToDelete.id);
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
      setShowDeleteDialog(false);
      setPaymentToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive",
      });
    }
  };

  const handleCancelDeletePayment = () => {
    setShowDeleteDialog(false);
    setPaymentToDelete(null);
  };

  const handlePaymentSubmit = async (data: any) => {
    try {
      if (editingPayment) {
        // Update existing payment
        const { id, lessonIds, ...paymentData } = data;
        await updatePaymentMutation.mutateAsync({
          id: editingPayment.id,
          data: {
            ...paymentData,
            lessonIds
          }
        });
        toast({
          title: "Success",
          description: "Payment updated successfully",
        });
      } else {
        // Create new payment
        await createPaymentMutation.mutateAsync(data);
        toast({
          title: "Success",
          description: "Payment added successfully",
        });
      }
      setShowPaymentForm(false);
      setEditingPayment(null);
    } catch (error) {
      toast({
        title: "Error",
        description: editingPayment ? "Failed to update payment" : "Failed to add payment",
        variant: "destructive",
      });
    }
  };

  if (paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading payments...
      </div>
    );
  }

  // Filter payments
  let filteredPayments = paymentsData;

  // Filter by payer
  if (selectedPayerIds.length > 0) {
    filteredPayments = filteredPayments.filter(payment => 
      selectedPayerIds.includes(payment.payerId)
    );
  }

  // Filter by date range
  if (dateFrom) {
    filteredPayments = filteredPayments.filter(payment => 
      new Date(payment.paymentDate) >= dateFrom
    );
  }
  if (dateTo) {
    filteredPayments = filteredPayments.filter(payment => 
      new Date(payment.paymentDate) <= dateTo
    );
  }

  // Group payments
  const groupedPayments: { [key: string]: any[] } = {};

  if (groupBy === 'month') {
    filteredPayments.forEach(payment => {
      const monthKey = format(new Date(payment.paymentDate), 'MMMM yyyy');
      if (!groupedPayments[monthKey]) {
        groupedPayments[monthKey] = [];
      }
      groupedPayments[monthKey].push(payment);
    });
  } else if (groupBy === 'payer') {
    filteredPayments.forEach(payment => {
      const payerName = payment.payerType === 'student'
        ? (() => {
            const student = studentsData.find(s => s.id === payment.payerId);
            return student ? `${student.firstName} ${student.lastName || ''}` : 'Unknown';
          })()
        : (() => {
            const parent = parentsData.find(p => p.id === payment.payerId);
            return parent ? parent.name : 'Unknown';
          })();

      if (!groupedPayments[payerName]) {
        groupedPayments[payerName] = [];
      }
      groupedPayments[payerName].push(payment);
    });
  } else {
    groupedPayments['All Payments'] = filteredPayments;
  }

  // Sort groups
  const sortedGroupKeys = Object.keys(groupedPayments).sort((a, b) => {
    if (groupBy === 'month') {
      // Sort months chronologically (most recent first)
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime();
    }
    return a.localeCompare(b);
  });

  // All available payers for filter
  const allPayers = [
    ...studentsData.map((s: any) => ({
      id: s.id,
      type: 'student' as const,
      name: `${s.firstName} ${s.lastName || ''}`,
    })),
    ...parentsData.map((p: any) => ({
      id: p.id,
      type: 'parent' as const,
      name: p.name,
    })),
  ];

  const togglePayerFilter = (payerId: string) => {
    setSelectedPayerIds(prev =>
      prev.includes(payerId)
        ? prev.filter(id => id !== payerId)
        : [...prev, payerId]
    );
  };

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payments ({filteredPayments.length})</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowFilterSidebar(true)}>
            <Filter className="h-4 w-4" />
          </Button>
          <Button onClick={handleAddPayment}>Add Payment</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Payments Table */}
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No payments found matching the current filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedGroupKeys.map(groupKey => {
              const groupPayments = groupedPayments[groupKey];
              const totalAmount = groupPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

              return (
                <div key={groupKey} className="space-y-3">
                  {groupBy !== 'none' && (
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{groupKey}</h3>
                      <div className="text-sm text-muted-foreground">
                        {groupPayments.length} payment{groupPayments.length !== 1 ? 's' : ''} • £{totalAmount.toFixed(2)}
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="hidden md:table-header-group">
                        <tr className="border-b">
                          <th className="text-left p-3">Date</th>
                          <th className="text-left p-3">Payer</th>
                          <th className="text-left p-3">Amount</th>
                          <th className="text-left p-3">Lessons</th>
                          <th className="text-left p-3">Notes</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupPayments.map((payment: any) => {
                  const payerName = payment.payerType === 'student'
                    ? (() => {
                        const student = studentsData.find(s => s.id === payment.payerId);
                        return student ? `${student.firstName} ${student.lastName || ''}` : 'Unknown';
                      })()
                    : (() => {
                        const parent = parentsData.find(p => p.id === payment.payerId);
                        return parent ? parent.name : 'Unknown';
                      })();

                  // Get student colors for the payer
                  const payerColors = payment.payerType === 'student'
                    ? (() => {
                        const student = studentsData.find(s => s.id === payment.payerId);
                        return student ? [student.defaultColor || '#3b82f6'] : [];
                      })()
                    : (() => {
                        const parent = parentsData.find(p => p.id === payment.payerId);
                        if (!parent) return [];
                        const parentStudents = studentsData.filter(s => s.parentId === parent.id);
                        return parentStudents.map(s => s.defaultColor || '#3b82f6');
                      })();

                  const amount = parseFloat(payment.amount);
                  const hasDecimals = amount % 1 !== 0;
                  const formattedAmount = hasDecimals ? `£${amount.toFixed(2)}` : `£${Math.floor(amount)}`;

                  return (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      {/* Desktop View */}
                      <td className="p-3 hidden md:table-cell">{format(new Date(payment.paymentDate), 'MMM d, yyyy')}</td>
                      <td className="p-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {payerColors.map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                style={{
                                  backgroundColor: color,
                                  marginLeft: index > 0 ? '-8px' : '0',
                                  zIndex: payerColors.length - index,
                                }}
                              />
                            ))}
                          </div>
                          <div>
                            <div>{payerName}</div>
                            <div className="text-xs text-muted-foreground capitalize">{payment.payerType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">£{parseFloat(payment.amount).toFixed(2)}</td>
                      <td className="p-3 hidden md:table-cell">
                        <PaymentLessonsCell paymentId={payment.id} lessonsData={lessonsData} isMobile={false} />
                      </td>
                      <td className="p-3 max-w-xs truncate hidden md:table-cell">{payment.notes || '-'}</td>
                      <td className="p-3 flex gap-2 hidden md:table-cell">
                        <Button variant="ghost" size="sm" onClick={() => handleEditPayment(payment)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePayment(payment)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>

                      {/* Mobile View - Compact */}
                      <td className="p-2 md:hidden text-sm">{format(new Date(payment.paymentDate), 'dd/MM')}</td>
                      <td className="p-2 md:hidden">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <button className="flex items-center">
                              {payerColors.map((color, index) => (
                                <div
                                  key={index}
                                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                  style={{
                                    backgroundColor: color,
                                    marginLeft: index > 0 ? '-10px' : '0',
                                    zIndex: payerColors.length - index,
                                  }}
                                />
                              ))}
                            </button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-auto">
                            <div className="space-y-1">
                              <p className="font-medium">{payerName}</p>
                              <p className="text-xs text-muted-foreground capitalize">{payment.payerType}</p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </td>
                      <td className="p-2 md:hidden text-sm font-medium">{formattedAmount}</td>
                      <td className="p-2 md:hidden text-xs text-muted-foreground">
                        <PaymentLessonsCell paymentId={payment.id} lessonsData={lessonsData} isMobile={true} />
                      </td>
                      <td className="p-2 md:hidden">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPayment(payment)} className="h-7 w-7 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePayment(payment)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={showPaymentForm} onOpenChange={handleClosePaymentForm}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPayment ? "Edit Payment" : "Add New Payment"}</DialogTitle>
        </DialogHeader>
        <PaymentForm
          students={studentsData as any[]}
          parents={parentsData as any[]}
          lessons={lessonsData as any[]}
          initialData={editingPayment} // Pass editingPayment for pre-filled form
          onSubmit={handlePaymentSubmit}
          onCancel={handleClosePaymentForm}
        />
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog for Payments */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment?
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDeletePayment}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeletePayment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filter Sidebar */}
      <Sheet open={showFilterSidebar} onOpenChange={setShowFilterSidebar}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filter & Group Payments</SheetTitle>
            <SheetDescription>
              Filter payments by payer, date range, or group them by different criteria.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Filter by Payer */}
            <div className="space-y-2">
              <Label>Filter by Payer</Label>
              <div className="border rounded-md p-2 bg-background max-h-64 overflow-y-auto space-y-1">
                {allPayers.map(payer => (
                  <div
                    key={payer.id}
                    className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                    onClick={() => togglePayerFilter(payer.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPayerIds.includes(payer.id)}
                      onChange={() => togglePayerFilter(payer.id)}
                      className="h-4 w-4 cursor-pointer"
                    />
                    <span className="text-sm">{payer.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">({payer.type})</span>
                  </div>
                ))}
              </div>
              {selectedPayerIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPayerIds([])}
                  className="w-full"
                >
                  Clear ({selectedPayerIds.length})
                </Button>
              )}
            </div>

            {/* Filter by Date Range */}
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={dateFrom ? format(dateFrom, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateFrom(e.target.value ? new Date(e.target.value) : undefined)}
              />
              <Label className="mt-4 block">Date To</Label>
              <Input
                type="date"
                value={dateTo ? format(dateTo, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateTo(e.target.value ? new Date(e.target.value) : undefined)}
              />
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom(undefined);
                    setDateTo(undefined);
                  }}
                  className="w-full mt-2"
                >
                  Clear Dates
                </Button>
              )}
            </div>

            {/* Group By */}
            <div className="space-y-2">
              <Label>Group By</Label>
              <div className="space-y-2">
                <Button
                  variant={groupBy === 'none' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('none')}
                  className="w-full"
                >
                  No Grouping
                </Button>
                <Button
                  variant={groupBy === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('month')}
                  className="w-full"
                >
                  By Month
                </Button>
                <Button
                  variant={groupBy === 'payer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('payer')}
                  className="w-full"
                >
                  By Payer
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function PaymentLessonsCell({ paymentId, lessonsData, isMobile = false, studentId }: { paymentId: string; lessonsData: any[]; isMobile?: boolean; studentId?: string }) {
  // Use student-specific hook if studentId is provided (for student view)
  const { data: lessonIds = [], isLoading } = studentId 
    ? useStudentPaymentLessons(studentId, paymentId)
    : usePaymentLessons(paymentId);

  if (isLoading) {
    return <span className="text-muted-foreground text-xs">Loading...</span>;
  }

  // Find lessons that match the IDs
  const lessons = lessonIds
    .map(id => lessonsData.find(l => l.id === id))
    .filter(Boolean);

  if (lessons.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (isMobile) {
    return (
      <div className="text-xs">
        {lessons.map((lesson: any, i: number) => (
          <span key={lesson.id}>
            {i > 0 && ', '}
            {format(new Date(lesson.dateTime), 'dd/MM')}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="text-sm space-y-1">
      {lessons.map((lesson: any) => (
        <div key={lesson.id}>
          {format(new Date(lesson.dateTime), 'MMM d')} - {lesson.subject}
        </div>
      ))}
    </div>
  );
}

function ParentsPage() {
  // Set page title
  useState(() => {
    document.title = "Hydra - Parents";
  });

  const { data: parentsData = [], isLoading: parentsLoading } = useParents();
  const { data: studentsData = [] } = useStudents();
  const updateStudentMutation = useUpdateStudent();
  const { toast } = useToast();

  const {
    showParentForm,
    selectedParent,
    handleOpenForm: handleOpenParentForm,
    handleCloseForm: handleCloseParentForm,
    handleSubmit: handleParentSubmit,
  } = useParentForm();

  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [showStudentSelectDialog, setShowStudentSelectDialog] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [showRemoveStudentDialog, setShowRemoveStudentDialog] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{ studentId: string; studentName: string; parentName: string } | null>(null);

  const handleAddStudentToParent = (parentId: string) => {
    setSelectedParentId(parentId);
    setSelectedStudentIds(new Set());
    setShowStudentSelectDialog(true);
  };

  const handleStudentSelectClose = () => {
    setShowStudentSelectDialog(false);
    setSelectedParentId(null);
    setSelectedStudentIds(new Set());
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleAssignStudents = async () => {
    if (!selectedParentId || selectedStudentIds.size === 0) return;

    try {
      // Update each selected student with the parent ID
      await Promise.all(
        Array.from(selectedStudentIds).map(studentId =>
          updateStudentMutation.mutateAsync({
            id: studentId,
            parentId: selectedParentId,
          })
        )
      );

      toast({
        title: "Success",
        description: `${selectedStudentIds.size} student(s) assigned successfully`,
      });

      handleStudentSelectClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign students",
        variant: "destructive",
      });
    }
  };

  const handleRemoveStudentClick = (studentId: string, studentName: string, parentName: string) => {
    setStudentToRemove({ studentId, studentName, parentName });
    setShowRemoveStudentDialog(true);
  };

  const handleConfirmRemoveStudent = async () => {
    if (!studentToRemove) return;

    try {
      await updateStudentMutation.mutateAsync({
        id: studentToRemove.studentId,
        parentId: null,
      });

      toast({
        title: "Success",
        description: `${studentToRemove.studentName} removed from parent`,
      });

      setShowRemoveStudentDialog(false);
      setStudentToRemove(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove student from parent",
        variant: "destructive",
      });
    }
  };

  const handleCancelRemoveStudent = () => {
    setShowRemoveStudentDialog(false);
    setStudentToRemove(null);
  };

  if (parentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading parents...
      </div>
    );
  }

  // Group students by parent
  const parentsWithStudents = (parentsData as any[]).map((parent: any) => ({
    ...parent,
    students: (studentsData as any[]).filter((s: any) => s.parentId === parent.id),
  }));

  // Get students without parents
  const studentsWithoutParents = (studentsData as any[]).filter((s: any) => !s.parentId);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Parents ({parentsWithStudents.length})</CardTitle>
          <Button onClick={() => handleOpenParentForm()}>Add Parent</Button>
        </CardHeader>
        <CardContent>
        {parentsWithStudents.length === 0 && studentsWithoutParents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No parents or students added yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {parentsWithStudents.map((parent: any) => (
              <div key={parent.id} className="border rounded-lg p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{parent.name}</h3>
                    {parent.email && (
                      <p className="text-sm text-muted-foreground">{parent.email}</p>
                    )}
                    {parent.phoneNumber && (
                      <p className="text-sm text-muted-foreground">{parent.phoneNumber}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddStudentToParent(parent.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Student
                  </Button>
                </div>

                {parent.students.length > 0 ? (
                  <div className="ml-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Students:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {parent.students.map((student: any) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-2 p-2 border rounded"
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: student.defaultColor }}
                          />
                          <span className="text-sm flex-1">
                            {student.firstName} {student.lastName || ''}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStudentClick(
                              student.id,
                              `${student.firstName} ${student.lastName || ''}`,
                              parent.name
                            )}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="ml-4 text-sm text-muted-foreground">No students assigned</p>
                )}
              </div>
            ))}

            {studentsWithoutParents.length > 0 && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="text-lg font-semibold mb-3">Students Without Parents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {studentsWithoutParents.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-2 p-2 border rounded bg-background"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: student.defaultColor }}
                      />
                      <span className="text-sm">
                        {student.firstName} {student.lastName || ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={showParentForm} onOpenChange={handleCloseParentForm}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedParent ? "Edit Parent" : "Add New Parent"}
          </DialogTitle>
        </DialogHeader>
        <ParentForm
          initialData={selectedParent || undefined}
          onSubmit={handleParentSubmit}
          onCancel={handleCloseParentForm}
        />
      </DialogContent>
    </Dialog>

    <Dialog open={showStudentSelectDialog} onOpenChange={handleStudentSelectClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Assign Students to {parentsWithStudents.find((p: any) => p.id === selectedParentId)?.name || 'Parent'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {studentsWithoutParents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No students without parents available.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Select students to assign to this parent:
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {studentsWithoutParents.map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 border rounded hover:bg-accent cursor-pointer"
                    onClick={() => handleToggleStudent(student.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.has(student.id)}
                      onChange={() => handleToggleStudent(student.id)}
                      className="h-4 w-4 cursor-pointer"
                    />
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: student.defaultColor }}
                    />
                    <div className="flex-1">
                      <span className="font-medium">
                        {student.firstName} {student.lastName || ''}
                      </span>
                      {student.email && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({student.email})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleStudentSelectClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignStudents}
              disabled={selectedStudentIds.size === 0}
            >
              Assign {selectedStudentIds.size > 0 ? `(${selectedStudentIds.size})` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showRemoveStudentDialog} onOpenChange={setShowRemoveStudentDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Student from Parent</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{studentToRemove?.studentName}</strong> from{" "}
            <strong>{studentToRemove?.parentName}</strong>?
            <br />
            <br />
            The student will not be deleted, only unlinked from this parent.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancelRemoveStudent}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmRemoveStudent}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove Student
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

function AnalyticsPage() {
  // Set page title
  useState(() => {
    document.title = "Hydra - Analytics";
  });

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
  // Set page title
  useState(() => {
    document.title = "Hydra - Settings";
  });

  const { data: tags = [] } = useTags();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();
  const { toast } = useToast();

  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTag, setEditingTag] = useState<any | null>(null);
  const [tagFormData, setTagFormData] = useState({ name: '', color: '#3b82f6' });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<any | null>(null);

  const handleAddTag = () => {
    setEditingTag(null);
    setTagFormData({ name: '', color: '#3b82f6' });
    setShowTagForm(true);
  };

  const handleEditTag = (tag: any) => {
    setEditingTag(tag);
    setTagFormData({ name: tag.name, color: tag.color });
    setShowTagForm(true);
  };

  const handleSubmitTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await updateTagMutation.mutateAsync({ id: editingTag.id, ...tagFormData });
        toast({ title: "Success", description: "Tag updated successfully" });
      } else {
        await createTagMutation.mutateAsync(tagFormData);
        toast({ title: "Success", description: "Tag created successfully" });
      }
      setShowTagForm(false);
      setTagFormData({ name: '', color: '#3b82f6' });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save tag", variant: "destructive" });
    }
  };

  const handleDeleteTag = (tag: any) => {
    setTagToDelete(tag);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTag = async () => {
    if (!tagToDelete) return;
    try {
      await deleteTagMutation.mutateAsync(tagToDelete.id);
      toast({ title: "Success", description: "Tag deleted successfully" });
      setShowDeleteDialog(false);
      setTagToDelete(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete tag", variant: "destructive" });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Comment Tags</h3>
              <Button onClick={handleAddTag}>Add Tag</Button>
            </div>
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags created yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: any) => (
                  <div key={tag.id} className="inline-flex items-center gap-1 p-2 border rounded">
                    <Badge variant="outline" style={{ borderColor: tag.color, color: tag.color }}>
                      {tag.name}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleEditTag(tag)} className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTag(tag)} className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showTagForm} onOpenChange={setShowTagForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTag} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                value={tagFormData.name}
                onChange={(e) => setTagFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Important, Follow-up"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="tag-color"
                  type="color"
                  value={tagFormData.color}
                  onChange={(e) => setTagFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-20"
                />
                <Input
                  type="text"
                  value={tagFormData.color}
                  onChange={(e) => setTagFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#3b82f6"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowTagForm(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingTag ? 'Update' : 'Create'} Tag</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tag "{tagToDelete?.name}"? This will remove it from all comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTag} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function StudentCalendarPage() {
  const params = useParams<{ studentId: string }>();

  const { data: student, isLoading: studentLoading } = useStudentByStudentId(params.studentId);

  // Set page title when student data is loaded
  useState(() => {
    if (student) {
      document.title = `Hydra - ${student.firstName}'s Calendar`;
    } else {
      document.title = "Hydra - Student Calendar";
    }
  });
  const { data: lessonsResponse, isLoading: lessonsLoading } = useStudentLessonsByStudentId(params.studentId);

  const lessonsData = lessonsResponse?.lessons || [];
  const blockedSlots = lessonsResponse?.blockedSlots || [];

  if (lessonsLoading || studentLoading) {
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

  // Transform student's lessons
  const studentLessons = (lessonsData as any[]).map((lesson: any) => ({
    ...lesson,
    dateTime: new Date(lesson.dateTime),
    studentName: `${student.firstName} ${student.lastName || ""}`,
    studentColor: student.defaultColor || "#3b82f6",
    studentId: lesson.studentId,
    pricePerHour: parseFloat(lesson.pricePerHour),
  }));

  // Transform blocked slots
  const blockedLessons = (blockedSlots as any[]).map((slot: any) => ({
    id: slot.id,
    dateTime: new Date(slot.dateTime),
    duration: slot.duration,
    isBlocked: true,
    studentName: "Occupied",
    studentColor: "#9ca3af",
    subject: "",
    paymentStatus: "pending",
    pricePerHour: 0,
  }));

  // Combine student lessons with blocked slots
  const displayLessons = [...studentLessons, ...blockedLessons];

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
        // The calendar navigation buttons (left/right arrows for month change)
        // should have their click handlers modified to prevent default form submission behavior.
        // This is assumed to be handled within the CalendarView component itself.
      />
    </>
  );
}

function StudentScheduleView() {
  const params = useParams<{ studentId: string }>();

  const { data: student, isLoading: studentLoading } = useStudentByStudentId(params.studentId);
  const { data: lessonsResponse, isLoading: lessonsLoading } = useStudentLessonsByStudentId(params.studentId);

  // Set page title when student data is loaded
  useState(() => {
    if (student) {
      document.title = `Hydra - ${student.firstName}'s Schedule`;
    } else {
      document.title = "Hydra - Student Schedule";
    }
  });

  // Use common hooks
  const {
    showCommentForm,
    setShowCommentForm,
    viewCommentsLessonId,
    setViewCommentsLessonId,
    editingCommentId,
    editingCommentData,
    handleStartEditComment,
    handleEditComment,
    handleDeleteComment,
    resetCommentForm,
  } = useCommentHandlers();

  const lessonsData = lessonsResponse?.lessons || [];

  if (lessonsLoading || studentLoading) {
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

  // Transform lessons
  const displayLessons = (lessonsData as any[]).map((lesson: any) => ({
    ...lesson,
    dateTime: new Date(lesson.dateTime),
    studentName: `${student.firstName} ${student.lastName || ""}`,
    studentColor: student.defaultColor || "#3b82f6",
    studentId: lesson.studentId,
    pricePerHour: parseFloat(lesson.pricePerHour),
  }));

  const handleJoinLesson = (lesson: Lesson) => {
    if (lesson.lessonLink) {
      window.open(lesson.lessonLink, "_blank");
    }
  };

  return (
    <>
      <ScheduleView
        lessons={displayLessons}
        onJoinLesson={handleJoinLesson}
        onViewComments={setViewCommentsLessonId}
        onEditComment={handleStartEditComment}
        onDeleteComment={handleDeleteComment}
        isStudentView={true}
        title={`Schedule for ${student.firstName} ${student.lastName || ""}`}
        showCommentActions={false}
      />

      <ScheduleCommentsDialog
        lessonId={viewCommentsLessonId}
        onClose={() => setViewCommentsLessonId(null)}
        onDeleteComment={handleDeleteComment}
        onEditComment={handleStartEditComment}
        isStudentView={true}
        studentId={params.studentId}
      />

      <CommentFormDialog
        open={showCommentForm}
        onOpenChange={setShowCommentForm}
        editingCommentData={editingCommentData}
        isEditing={true}
        onSubmit={async (data) => {
          if (editingCommentId) {
            await handleEditComment(editingCommentId, {
              title: data.title,
              content: data.content,
              visibleToStudent: data.visibleToStudent ? 1 : 0,
              tagIds: data.tagIds,
            });
          }
        }}
        onCancel={resetCommentForm}
      />
    </>
  );
}

function StudentPaymentsView() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId as string;

  const { data: student, isLoading: studentLoading } = useStudentByStudentId(studentId);
  const { data: paymentsData = [], isLoading: paymentsLoading } = useStudentPayments(studentId);
  const { data: lessonsResponse, isLoading: lessonsLoading } = useStudentLessonsByStudentId(studentId);
  
  // Extract lessons array from response
  const lessonsData = Array.isArray(lessonsResponse?.lessons) ? lessonsResponse.lessons : [];

  // State for grouping
  const [groupBy, setGroupBy] = useState<'none' | 'month'>('month');

  // Set page title when student data is loaded
  useState(() => {
    if (student) {
      document.title = `Hydra - ${student.firstName}'s Payments`;
    } else {
      document.title = "Hydra - Student Payments";
    }
  });

  if (studentLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading payments...
      </div>
    );
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
            <p className="text-muted-foreground">
              No student found with ID: {studentId}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter payments for this student or their parent
  let filteredPayments = paymentsData.filter(payment => {
    if (payment.payerType === 'student' && payment.payerId === student.id) {
      return true;
    }
    if (payment.payerType === 'parent' && student.parentId && payment.payerId === student.parentId) {
      return true;
    }
    return false;
  });

  // Sort payments by date (most recent first)
  filteredPayments = filteredPayments.sort((a, b) => 
    new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  // Group payments
  const groupedPayments: Record<string, any[]> = {};

  if (groupBy === 'none') {
    groupedPayments['All Payments'] = filteredPayments;
  } else if (groupBy === 'month') {
    filteredPayments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const monthKey = format(date, 'MMMM yyyy');
      if (!groupedPayments[monthKey]) {
        groupedPayments[monthKey] = [];
      }
      groupedPayments[monthKey].push(payment);
    });
  }

  // Sort groups
  const sortedGroupKeys = Object.keys(groupedPayments).sort((a, b) => {
    if (groupBy === 'month') {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime();
    }
    return a.localeCompare(b);
  });

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">
          Payments for {student.firstName} {student.lastName || ""} (ID: {student.studentId})
        </h1>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Payments ({filteredPayments.length})</CardTitle>
          <div className="flex gap-2 items-center">
            <Select value={groupBy} onValueChange={(value: 'none' | 'month') => setGroupBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No grouping</SelectItem>
                <SelectItem value="month">By month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No payments found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedGroupKeys.map(groupKey => {
                const groupPayments = groupedPayments[groupKey];
                const totalAmount = groupPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

                return (
                  <div key={groupKey} className="space-y-3">
                    {groupBy !== 'none' && (
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{groupKey}</h3>
                        <div className="text-sm text-muted-foreground">
                          {groupPayments.length} payment{groupPayments.length !== 1 ? 's' : ''} • £{totalAmount.toFixed(2)}
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="hidden md:table-header-group">
                          <tr className="border-b">
                            <th className="text-left p-3">Date</th>
                            <th className="text-left p-3">Amount</th>
                            <th className="text-left p-3">Lessons</th>
                            <th className="text-left p-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupPayments.map((payment: any) => {
                            const formattedDate = format(new Date(payment.paymentDate), 'MMM d, yyyy');
                            const formattedAmount = `£${parseFloat(payment.amount).toFixed(2)}`;

                            return (
                              <tr key={payment.id} className="border-b hover:bg-accent/50">
                                {/* Mobile view */}
                                <td className="p-2 md:hidden">
                                  <div className="space-y-1">
                                    <div className="font-medium">{formattedDate}</div>
                                    <div className="text-sm font-semibold">{formattedAmount}</div>
                                    <div className="text-xs text-muted-foreground">
                                      <PaymentLessonsCell paymentId={payment.id} lessonsData={lessonsData as any[]} isMobile={true} studentId={studentId} />
                                    </div>
                                    {payment.notes && (
                                      <div className="text-xs text-muted-foreground">{payment.notes}</div>
                                    )}
                                  </div>
                                </td>

                                {/* Desktop view */}
                                <td className="hidden md:table-cell p-3">{formattedDate}</td>
                                <td className="hidden md:table-cell p-3 font-semibold">{formattedAmount}</td>
                                <td className="hidden md:table-cell p-3">
                                  <PaymentLessonsCell paymentId={payment.id} lessonsData={lessonsData as any[]} isMobile={false} studentId={studentId} />
                                </td>
                                <td className="hidden md:table-cell p-3 text-sm text-muted-foreground max-w-xs truncate">
                                  {payment.notes || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={CalendarPage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/students" component={StudentsPage} />
      <Route path="/parents" component={ParentsPage} />
      <Route path="/payments" component={PaymentsPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/calendar/:studentId" component={StudentCalendarPage} />
      <Route path="/schedule/:studentId" component={StudentScheduleView} />
      <Route path="/payments/:studentId" component={StudentPaymentsView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location, setLocation] = useLocation();
  
  const studentViewMatch = location.match(/^\/(calendar|schedule|payments)\/([^/]+)$/);
  const isStudentView = !!studentViewMatch;
  const studentId = studentViewMatch?.[2];
  
  // Only fetch admin data when not in student view
  const { studentsData, lessonsData } = isStudentView 
    ? { studentsData: [], lessonsData: [] }
    : useLessonData();

  const {
    showStudentForm,
    handleOpenForm: handleOpenStudentForm,
    handleCloseForm: handleCloseStudentForm,
    handleSubmit: handleStudentSubmit,
  } = useStudentForm();

  const {
    showLessonForm,
    handleOpenForm: handleOpenLessonForm,
    handleCloseForm: handleCloseLessonForm,
    handleSubmit: handleLessonSubmit,
  } = useLessonForm();

  const shouldShowNavigation = true;

  const handleAddLesson = () => {
    handleOpenLessonForm();
  };

  const handleAddStudent = () => {
    handleOpenStudentForm();
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

      <Dialog open={showLessonForm} onOpenChange={handleCloseLessonForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Lesson</DialogTitle>
          </DialogHeader>
          <LessonForm
            students={studentsData as any[]}
            onSubmit={handleLessonSubmit}
            onCancel={handleCloseLessonForm}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showStudentForm} onOpenChange={handleCloseStudentForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <StudentForm
            onSubmit={handleStudentSubmit}
            onCancel={handleCloseStudentForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AuthenticatedApp() {
  const [location] = useLocation();
  const { data: authData, isLoading } = useAuth();

  // Allow access to student calendar, schedule, and payments views without authentication
  const isStudentCalendarView = location.match(/^\/calendar\/[^/]+$/);
  const isStudentScheduleView = location.match(/^\/schedule\/[^/]+$/);
  const isStudentPaymentsView = location.match(/^\/payments\/[^/]+$/);


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
    !isStudentPaymentsView &&
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