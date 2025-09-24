import { useState } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CalendarView from "./components/CalendarView";
import Navigation from "./components/Navigation";
import LessonForm from "./components/LessonForm";
import StudentForm from "./components/StudentForm";
import ThemeToggle from "./components/ThemeToggle";
import StudentCard from "./components/StudentCard";
import { addDays, addHours } from 'date-fns';
import NotFound from "@/pages/not-found";

// todo: remove mock functionality
const mockStudents = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@email.com',
    phoneNumber: '+1 (555) 123-4567',
    defaultSubject: 'Mathematics',
    defaultRate: 75,
    lessonCount: 12,
    lastLessonDate: new Date('2024-01-10'),
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@email.com',
    phoneNumber: '+1 (555) 234-5678',
    defaultSubject: 'Physics',
    defaultRate: 60,
    lessonCount: 8,
    lastLessonDate: new Date('2024-01-08'),
  },
  {
    id: '3',
    firstName: 'Carol',
    lastName: 'Brown',
    email: 'carol.brown@email.com',
    phoneNumber: '+1 (555) 345-6789',
    defaultSubject: 'Chemistry',
    defaultRate: 55,
    lessonCount: 15,
    lastLessonDate: new Date('2024-01-12'),
  },
];

// todo: remove mock functionality
const mockLessons = [
  {
    id: '1',
    subject: 'Advanced Mathematics',
    dateTime: new Date(),
    studentName: 'Alice Johnson',
    duration: 60,
    paymentStatus: 'paid' as const,
    pricePerHour: 75,
    lessonLink: 'https://zoom.us/j/123456789',
  },
  {
    id: '2',
    subject: 'Physics - Mechanics',
    dateTime: addHours(new Date(), 2),
    studentName: 'Bob Smith',
    duration: 90,
    paymentStatus: 'pending' as const,
    pricePerHour: 60,
    lessonLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: '3',
    subject: 'Organic Chemistry',
    dateTime: addDays(new Date(), 1),
    studentName: 'Carol Brown',
    duration: 60,
    paymentStatus: 'overdue' as const,
    pricePerHour: 55,
  },
  {
    id: '4',
    subject: 'Calculus II',
    dateTime: addDays(new Date(), 3),
    studentName: 'Alice Johnson',
    duration: 75,
    paymentStatus: 'paid' as const,
    pricePerHour: 75,
    lessonLink: 'https://zoom.us/j/987654321',
  },
];

function CalendarPage() {
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const handleLessonClick = (lesson: any) => {
    console.log('Lesson clicked:', lesson);
    setSelectedLesson(lesson);
    setShowLessonForm(true);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    setSelectedDate(date);
    setShowLessonForm(true);
  };

  const handleLessonSubmit = (lessonData: any) => {
    console.log('Lesson form submitted:', lessonData);
    setShowLessonForm(false);
    setSelectedLesson(null);
    setSelectedDate(null);
  };

  const handleLessonCancel = () => {
    setShowLessonForm(false);
    setSelectedLesson(null);
    setSelectedDate(null);
  };

  return (
    <>
      <CalendarView
        lessons={mockLessons}
        onLessonClick={handleLessonClick}
        onDateClick={handleDateClick}
      />
      
      <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedLesson ? 'Edit Lesson' : 'Schedule New Lesson'}</DialogTitle>
          </DialogHeader>
          <LessonForm
            students={mockStudents}
            initialData={selectedLesson ? {
              ...selectedLesson,
              studentId: mockStudents.find(s => 
                `${s.firstName} ${s.lastName}` === selectedLesson.studentName
              )?.id
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
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const handleEditStudent = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    setSelectedStudent(student);
    setShowStudentForm(true);
  };

  const handleScheduleLesson = (studentId: string) => {
    console.log('Schedule lesson for student:', studentId);
    // In a real app, this would navigate to lesson form with student pre-selected
  };

  const handleViewLessons = (studentId: string) => {
    console.log('View lessons for student:', studentId);
    // In a real app, this would filter calendar view by student
  };

  const handleStudentSubmit = (studentData: any) => {
    console.log('Student form submitted:', studentData);
    setShowStudentForm(false);
    setSelectedStudent(null);
  };

  const handleStudentCancel = () => {
    setShowStudentForm(false);
    setSelectedStudent(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockStudents.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                onEdit={handleEditStudent}
                onScheduleLesson={handleScheduleLesson}
                onViewLessons={handleViewLessons}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={showStudentForm} onOpenChange={setShowStudentForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          </DialogHeader>
          <StudentForm
            initialData={selectedStudent}
            onSubmit={handleStudentSubmit}
            onCancel={handleStudentCancel}
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

function App() {
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);

  const handleAddLesson = () => {
    setShowLessonForm(true);
  };

  const handleAddStudent = () => {
    setShowStudentForm(true);
  };

  const handleLessonSubmit = (lessonData: any) => {
    console.log('New lesson submitted:', lessonData);
    setShowLessonForm(false);
  };

  const handleStudentSubmit = (studentData: any) => {
    console.log('New student submitted:', studentData);
    setShowStudentForm(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-background">
          <Navigation
            onAddLesson={handleAddLesson}
            onAddStudent={handleAddStudent}
            lessonCount={mockLessons.length}
            studentCount={mockStudents.length}
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
        </div>
        
        {/* Global Lesson Form Modal */}
        <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Lesson</DialogTitle>
            </DialogHeader>
            <LessonForm
              students={mockStudents}
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
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
