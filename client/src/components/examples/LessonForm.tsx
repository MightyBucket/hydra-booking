import LessonForm from '../LessonForm';

// todo: remove mock functionality
const mockStudents = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Johnson',
    defaultSubject: 'Mathematics',
    defaultRate: 75,
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Smith',
    defaultSubject: 'Physics',
    defaultRate: 60,
  },
  {
    id: '3',
    firstName: 'Carol',
    lastName: 'Brown',
    defaultSubject: 'Chemistry',
    defaultRate: 55,
  },
];

export default function LessonFormExample() {
  const handleSubmit = (lessonData: any) => {
    console.log('Lesson submitted:', lessonData);
  };

  const handleCancel = () => {
    console.log('Lesson form cancelled');
  };

  return (
    <LessonForm
      students={mockStudents}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}