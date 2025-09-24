import LessonCard from '../LessonCard';

// todo: remove mock functionality
const mockLesson = {
  id: '1',
  subject: 'Advanced Mathematics',
  dateTime: new Date('2024-01-15T14:00:00'),
  studentName: 'Alice Johnson',
  duration: 90,
  paymentStatus: 'paid' as const,
  pricePerHour: 75,
  lessonLink: 'https://zoom.us/j/123456789',
};

export default function LessonCardExample() {
  const handleEdit = (lessonId: string) => {
    console.log('Edit lesson:', lessonId);
  };

  const handleDelete = (lessonId: string) => {
    console.log('Delete lesson:', lessonId);
  };

  const handleJoinLesson = (link: string) => {
    console.log('Join lesson:', link);
    window.open(link, '_blank');
  };

  return (
    <div className="max-w-md">
      <LessonCard
        lesson={mockLesson}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onJoinLesson={handleJoinLesson}
      />
    </div>
  );
}