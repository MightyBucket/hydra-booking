import { useState } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import CalendarView from "./components/CalendarView";
import Navigation from "./components/Navigation";
import LessonForm from "./components/LessonForm";
import StudentForm from "./components/StudentForm";
import ThemeToggle from "./components/ThemeToggle";
import StudentCard from "./components/StudentCard";
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from './hooks/useStudents';
import { useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from './hooks/useLessons';
import { format } from 'date-fns';
import NotFound from "@/pages/not-found";


function CalendarPage() {
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const { toast } = useToast();
  
  const { data: lessonsData = [], isLoading: lessonsLoading } = useLessons();
  const { data: studentsData = [] } = useStudents();
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();

  // Transform lessons data for calendar display
  const displayLessons = (lessonsData as any[]).map((lesson: any) => {
    const student = (studentsData as any[]).find((s: any) => s.id === lesson.studentId);
    return {
      ...lesson,
      dateTime: new Date(lesson.dateTime),
      studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
      pricePerHour: parseFloat(lesson.pricePerHour),
    };
  });

  const handleLessonClick = (lesson: any) => {
    const originalLesson = (lessonsData as any[]).find((l: any) => l.id === lesson.id);
    if (originalLesson) {
      setSelectedLesson(originalLesson);
      setShowLessonForm(true);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowLessonForm(true);
  };

  const handleLessonSubmit = async (lessonData: any) => {
    try {
      const formattedData = {
        ...lessonData,
        dateTime: new Date(lessonData.dateTime).toISOString(),
        pricePerHour: lessonData.pricePerHour.toString(),
      };

      if (selectedLesson) {
        await updateLessonMutation.mutateAsync({ id: selectedLesson.id, ...formattedData });
        toast({ title: "Success", description: "Lesson updated successfully" });
      } else {
        await createLessonMutation.mutateAsync(formattedData);
        toast({ title: "Success", description: "Lesson scheduled successfully" });
      }
      
      setShowLessonForm(false);
      setSelectedLesson(null);
      setSelectedDate(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save lesson", variant: "destructive" });
    }
  };

  const handleLessonCancel = () => {
    setShowLessonForm(false);
    setSelectedLesson(null);
    setSelectedDate(null);
  };

  if (lessonsLoading) {
    return <div className="flex items-center justify-center h-64">Loading lessons...</div>;
  }

  return (
    <>
      <CalendarView
        lessons={displayLessons}
        onLessonClick={handleLessonClick}
        onDateClick={handleDateClick}
      />
      
      <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedLesson ? 'Edit Lesson' : 'Schedule New Lesson'}</DialogTitle>
          </DialogHeader>
          <LessonForm
            students={studentsData as any[]}
            initialData={selectedLesson ? {
              ...selectedLesson,
              dateTime: new Date(selectedLesson.dateTime),
              pricePerHour: parseFloat(selectedLesson.pricePerHour),
            } : selectedDate ? {
              dateTime: selectedDate
            } : undefined}
            onSubmit={handleLessonSubmit}
            onCancel={handleLessonCancel}
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
  const [selectedStudentForLesson, setSelectedStudentForLesson] = useState<any>(null);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const { toast } = useToast();
  
  const { data: studentsData = [], isLoading: studentsLoading } = useStudents();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();
  const createLessonMutation = useCreateLesson();

  const handleEditStudent = (studentId: string) => {
    const student = (studentsData as any[]).find((s: any) => s.id === studentId);
    setSelectedStudent(student);
    setShowStudentForm(true);
  };

  const handleScheduleLesson = (studentId: string) => {
    const student = (studentsData as any[]).find((s: any) => s.id === studentId);
    setSelectedStudentForLesson(student);
    setShowLessonForm(true);
  };

  const handleViewLessons = (studentId: string) => {
    // TODO: This would navigate to calendar filtered by student
    console.log('View lessons for student:', studentId);
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = (studentsData as any[]).find((s: any) => s.id === studentId);
    setStudentToDelete(student);
    setShowDeleteDialog(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      await deleteStudentMutation.mutateAsync(studentToDelete.id);
      toast({ 
        title: "Success", 
        description: `Student ${studentToDelete.firstName} ${studentToDelete.lastName || ''} and all associated lessons have been deleted.` 
      });
      setShowDeleteDialog(false);
      setStudentToDelete(null);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to delete student", 
        variant: "destructive" 
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
        defaultRate: studentData.defaultRate ? studentData.defaultRate.toString() : null,
      };
      
      if (selectedStudent) {
        await updateStudentMutation.mutateAsync({ id: selectedStudent.id, ...formattedData });
        toast({ title: "Success", description: "Student updated successfully" });
      } else {
        await createStudentMutation.mutateAsync(formattedData);
        toast({ title: "Success", description: "Student added successfully" });
      }
      
      setShowStudentForm(false);
      setSelectedStudent(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save student", variant: "destructive" });
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
      toast({ title: "Error", description: "Failed to schedule lesson", variant: "destructive" });
    }
  };

  const handleLessonCancel = () => {
    setShowLessonForm(false);
    setSelectedStudentForLesson(null);
  };

  if (studentsLoading) {
    return <div className="flex items-center justify-center h-64">Loading students...</div>;
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
                    defaultRate: student.defaultRate ? parseFloat(student.defaultRate) : undefined,
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
            <DialogTitle>{selectedStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          </DialogHeader>
          <StudentForm
            initialData={selectedStudent ? {
              ...selectedStudent,
              defaultRate: selectedStudent.defaultRate ? parseFloat(selectedStudent.defaultRate) : undefined,
            } : undefined}
            onSubmit={handleStudentSubmit}
            onCancel={handleStudentCancel}
          />
        </DialogContent>
      </Dialog>
      
      {/* Lesson Form Modal for Students Page */}
      <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Lesson for {selectedStudentForLesson?.firstName} {selectedStudentForLesson?.lastName}</DialogTitle>
          </DialogHeader>
          <LessonForm
            students={studentsData as any[]}
            initialData={selectedStudentForLesson ? {
              studentId: selectedStudentForLesson.id,
              subject: selectedStudentForLesson.defaultSubject,
              pricePerHour: selectedStudentForLesson.defaultRate ? parseFloat(selectedStudentForLesson.defaultRate) : 50,
              lessonLink: selectedStudentForLesson.defaultLink,
            } : undefined}
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
              Are you sure you want to delete <strong>{studentToDelete?.firstName} {studentToDelete?.lastName}</strong>?
              <br /><br />
              <span className="text-destructive font-medium">
                Warning: This will also permanently delete all lessons associated with this student.
              </span>
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteStudent}>Cancel</AlertDialogCancel>
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

function AnalyticsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={CalendarPage} />
      <Route path="/students" component={StudentsPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/settings" component={SettingsPage} />
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
  const createStudentMutation = useCreateStudent();
  const { toast } = useToast();

  const handleAddLesson = () => {
    setShowLessonForm(true);
  };

  const handleAddStudent = () => {
    setShowStudentForm(true);
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
    } catch (error) {
      toast({ title: "Error", description: "Failed to schedule lesson", variant: "destructive" });
    }
  };

  const handleStudentSubmit = async (studentData: any) => {
    try {
      const formattedData = {
        ...studentData,
        defaultRate: studentData.defaultRate ? studentData.defaultRate.toString() : null,
      };
      
      await createStudentMutation.mutateAsync(formattedData);
      toast({ title: "Success", description: "Student added successfully" });
      setShowStudentForm(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to add student", variant: "destructive" });
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
