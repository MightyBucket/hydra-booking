
import LessonCard from './LessonCard';
import { useCommentsByLesson } from '@/hooks/useComments';

interface LessonCardWithCommentsProps {
  lesson: any;
  onEdit: (lessonId: string) => void;
  onDelete: (lessonId: string) => void;
  onJoinLesson?: (link: string) => void;
  onUpdatePaymentStatus?: (lessonId: string, status: 'pending' | 'paid' | 'overdue' | 'unpaid') => void;
  onAddComment?: (lessonId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  showCommentActions?: boolean;
}

export default function LessonCardWithComments(props: LessonCardWithCommentsProps) {
  const { data: comments = [] } = useCommentsByLesson(props.lesson.id);

  return <LessonCard {...props} comments={comments} />;
}
