import { useState } from "react";
import { Switch, Route, useParams } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import { format } from "date-fns";
import NotFound from "@/pages/not-found";

function CalendarPage() {
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<any>(null);
  const [deleteAllFuture, setDeleteAllFuture] = useState(false);
  const { toast } = useToast();

  const { data: lessonsData = [], isLoading: lessonsLoading } = useLessons();
  const { data: studentsData = [] } = useStudents();
  const createLessonMutation = useCreateLesson();
  const createLessonWithRecurringMutation = useCreateLessonWithRecurring();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();

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

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;

    try {
      if (deleteAllFuture) {
        // Find all lessons with same day of week and time in the future
        const lessonDate = new Date(lessonToDelete.dateTime);
        const dayOfWeek = lessonDate.getDay();
        const timeString = lessonDate.toTimeString().substring(0, 8); // HH:MM:SS

        const futureRecurringLessons = (lessonsData as any[]).filter(
          (lesson: any) => {
            const lessonDateTime = new Date(lesson.dateTime);
            return (
              lessonDateTime >= lessonDate && // Same date or future
              lessonDateTime.getDay() === dayOfWeek && // Same day of week
              lessonDateTime.toTimeString().substring(0, 8) === timeString && // Same time
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
                ? {
                    dateTime: selectedDate,
                  }
                : undefined
            }
            onSubmit={handleLessonSubmit}
            onCancel={handleLessonCancel}
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
  const { toast } = useToast();

  const { data: lessonsData = [], isLoading: lessonsLoading } = useLessons();
  const { data: studentsData = [] } = useStudents();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();

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

  const handleEditLesson = (lessonId: string) => {
    const originalLesson = (lessonsData as any[]).find(
      (l: any) => l.id === lessonId,
    );
    if (originalLesson) {
      setSelectedLesson(originalLesson);
      setShowLessonForm(true);
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    const lesson = displayLessons.find((l: any) => l.id === lessonId);
    if (lesson) {
      setLessonToDelete(lesson);
      setDeleteAllFuture(false);
      setShowDeleteDialog(true);
    }
  };

  const handleJoinLesson = (link: string) => {
    window.open(link, "_blank");
  };

  const handleUpdatePaymentStatus = async (lessonId: string, status: 'pending' | 'paid' | 'overdue') => {
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

  const handleLessonSubmit = async (lessonData: any) => {
    try {
      const formattedData = {
        ...lessonData,
        dateTime: new Date(lessonData.dateTime).toISOString(),
        pricePerHour: lessonData.pricePerHour.toString(),
      };

      if (selectedLesson) {
        await updateLessonMutation.mutateAsync({
          id: selectedLesson.id,
          ...formattedData,
        });
        toast({ title: "Success", description: "Lesson updated successfully" });
      }

      setShowLessonForm(false);
      setSelectedLesson(null);
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
        const timeString = lessonDate.toTimeString().substring(0, 8);

        const futureRecurringLessons = (lessonsData as any[]).filter(
          (lesson: any) => {
            const lessonDateTime = new Date(lesson.dateTime);
            return (
              lessonDateTime >= lessonDate &&
              lessonDateTime.getDay() === dayOfWeek &&
              lessonDateTime.toTimeString().substring(0, 8) === timeString &&
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
              {Object.entries(groupedLessons).map(([dateKey, lessons]: [string, any], index: number) => {
                const date = new Date(dateKey);
                const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                // Check if this is the first lesson of a new month
                const isFirstLessonOfMonth = index === 0 || 
                  format(date, 'yyyy-MM') !== format(new Date(Object.keys(groupedLessons)[index - 1]), 'yyyy-MM');

                return (
                  <div key={dateKey} className="space-y-3">
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
                      {lessons.map((lesson: any) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={{
                            ...lesson,
                            studentColor: lesson.studentColor
                          }}
                          onEdit={handleEditLesson}
                          onDelete={handleDeleteLesson}
                          onJoinLesson={lesson.lessonLink ? handleJoinLesson : undefined}
                          onUpdatePaymentStatus={handleUpdatePaymentStatus}
                        />
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
            <DialogTitle>Edit Lesson</DialogTitle>
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
            onCancel={() => {
              setShowLessonForm(false);
              setSelectedLesson(null);
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

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold" data-testid="student-name">
          Calendar for {student.firstName} {student.lastName || ""} (ID: {student.studentId})
        </h1>
      </div>
      <CalendarView
        lessons={displayLessons}
        onLessonClick={() => {}}
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

  const { data: studentsData = [] } = useStudents();
  const { data: lessonsData = [] } = useLessons();
  const createLessonMutation = useCreateLesson();
  const createLessonWithRecurringMutation = useCreateLessonWithRecurring();
  const createStudentMutation = useCreateStudent();
  const { toast } = useToast();

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
      <Navigation
        onAddLesson={handleAddLesson}
        onAddStudent={handleAddStudent}
        lessonCount={(lessonsData as any[]).length}
        studentCount={(studentsData as any[]).length}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex-1" />
          <ThemeToggle />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;