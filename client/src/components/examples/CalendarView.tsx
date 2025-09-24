import CalendarView from '../CalendarView';
import { addDays, addHours } from 'date-fns';

// todo: remove mock functionality
const mockLessons = [
  {
    id: '1',
    subject: 'Mathematics',
    dateTime: new Date(),
    studentName: 'Alice Johnson',
    duration: 60,
    paymentStatus: 'paid' as const,
    pricePerHour: 50,
  },
  {
    id: '2',
    subject: 'Physics',
    dateTime: addHours(new Date(), 2),
    studentName: 'Bob Smith',
    duration: 90,
    paymentStatus: 'pending' as const,
    pricePerHour: 60,
  },
  {
    id: '3',
    subject: 'Chemistry',
    dateTime: addDays(new Date(), 1),
    studentName: 'Carol Brown',
    duration: 60,
    paymentStatus: 'overdue' as const,
    pricePerHour: 55,
  },
  {
    id: '4',
    subject: 'Biology',
    dateTime: addDays(new Date(), 3),
    studentName: 'David Wilson',
    duration: 75,
    paymentStatus: 'paid' as const,
    pricePerHour: 45,
  },
];

export default function CalendarViewExample() {
  const handleLessonClick = (lesson: any) => {
    console.log('Lesson clicked:', lesson);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
  };

  return (
    <CalendarView 
      lessons={mockLessons}
      onLessonClick={handleLessonClick}
      onDateClick={handleDateClick}
    />
  );
}