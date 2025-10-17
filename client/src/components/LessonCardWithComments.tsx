
import LessonCard from './LessonCard';
import { useCommentsByLesson } from '@/hooks/useComments';
import { useParams } from 'wouter';

interface LessonCardWithCommentsProps {
  lesson: any;
  onEdit: (lessonId: string) => void;
  onDelete: (lessonId: string) => void;
  onJoinLesson?: (link: string) => void;
  onUpdatePaymentStatus?: (lessonId: string, status: 'pending' | 'paid' | 'overdue' | 'unpaid' | 'free') => void;
  onAddComment?: (lessonId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onEditComment?: (commentId: string, data: { title: string; content: string; visibleToStudent: number }) => void;
  showCommentActions?: boolean;
  isStudentView?: boolean;
}

export default function LessonCardWithComments(props: LessonCardWithCommentsProps) {
  const params = useParams<{ studentId?: string }>();
  const isStudentSpecificView = !!params.studentId;
  
  // Use student-specific comments hook if in student view
  const { useStudentLessonComments } = isStudentSpecificView 
    ? require('@/hooks/useStudentData') 
    : { useStudentLessonComments: null };
  
  const { data: studentComments = [] } = isStudentSpecificView && useStudentLessonComments
    ? useStudentLessonComments(params.studentId, props.lesson.id)
    : { data: [] };
  
  const { data: regularComments = [] } = useCommentsByLesson(
    isStudentSpecificView ? '' : props.lesson.id
  );
  
  const comments = isStudentSpecificView ? studentComments : regularComments;

  return (
    <LessonCard 
      {...props} 
      comments={comments}
      onAddComment={props.onAddComment}
    />
  );
}
