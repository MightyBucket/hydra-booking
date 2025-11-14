import { useState } from "react";
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
import { useStudents, useDeleteStudent } from "./hooks/useStudents";
import { useLessons } from "./hooks/useLessons";
import { useParents } from "./hooks/useParents";
import ParentForm from "./components/ParentForm";
import { useParentForm } from "./hooks/useParentForm";
import NoteForm from "./components/NoteForm";
import CommentFormDialog from "./components/CommentFormDialog";
import DeleteLessonDialog from "./components/DeleteLessonDialog";
import { format } from "date-fns";
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
import { Edit, Trash2 } from "lucide-react";
import { useStudentByStudentId, useStudentLessonsByStudentId } from "@/hooks/useStudentData";
import { handleJoinLessonLink, calculateStudentStats } from "@/utils/lessonHelpers";

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
      window.location.href = `/${student.studentId}/calendar`;
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

function ParentsPage() {
  // Set page title
  useState(() => {
    document.title = "Hydra - Parents";
  });

  const { data: parentsData = [], isLoading: parentsLoading } = useParents();
  const { data: studentsData = [] } = useStudents();

  const {
    showParentForm,
    selectedParent,
    handleOpenForm: handleOpenParentForm,
    handleCloseForm: handleCloseParentForm,
    handleSubmit: handleParentSubmit,
  } = useParentForm();

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
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">{parent.name}</h3>
                  {parent.email && (
                    <p className="text-sm text-muted-foreground">{parent.email}</p>
                  )}
                  {parent.phoneNumber && (
                    <p className="text-sm text-muted-foreground">{parent.phoneNumber}</p>
                  )}
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
      />
    </>
  );
}

function StudentSchedulePage() {
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
            });
          }
        }}
        onCancel={resetCommentForm}
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
      <Route path="/parents" component={ParentsPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/:studentId/calendar" component={StudentCalendarPage} />
      <Route path="/:studentId/schedule" component={StudentSchedulePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location, setLocation] = useLocation();

  const { studentsData, lessonsData } = useLessonData();

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

  const studentViewMatch = location.match(/^\/(\d{6})\/(calendar|schedule)$/);
  const isStudentView = !!studentViewMatch;
  const studentId = studentViewMatch?.[1];
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