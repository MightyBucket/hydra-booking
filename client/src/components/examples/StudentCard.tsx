import StudentCard from '../StudentCard';

// todo: remove mock functionality
const mockStudent = {
  id: '1',
  firstName: 'Alice',
  lastName: 'Johnson',
  email: 'alice.johnson@email.com',
  phoneNumber: '+1 (555) 123-4567',
  defaultSubject: 'Mathematics',
  defaultRate: 75,
  lessonCount: 12,
  lastLessonDate: new Date('2024-01-10'),
};

export default function StudentCardExample() {
  const handleEdit = (studentId: string) => {
    console.log('Edit student:', studentId);
  };

  const handleScheduleLesson = (studentId: string) => {
    console.log('Schedule lesson for student:', studentId);
  };

  const handleViewLessons = (studentId: string) => {
    console.log('View lessons for student:', studentId);
  };

  return (
    <div className="max-w-md">
      <StudentCard
        student={mockStudent}
        onEdit={handleEdit}
        onScheduleLesson={handleScheduleLesson}
        onViewLessons={handleViewLessons}
      />
    </div>
  );
}