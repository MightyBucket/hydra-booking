
import LessonCard from './LessonCard';
import { useCommentsByLesson } from '@/hooks/useComments';
import { useStudentLessonComments } from '@/hooks/useStudentData';
import { useParentLessonComments } from '@/hooks/useParentData';
import { useParams } from 'wouter';
import { PaymentStatus } from '@/lib/paymentStatus';

interface LessonCardWithCommentsProps {
  lesson: any;
  onEdit: (lessonId: string) => void;
  onDelete: (lessonId: string) => void;
  onJoinLesson?: (link: string) => void;
  onUpdatePaymentStatus?: (lessonId: string, status: PaymentStatus) => void;
  onAddComment?: (lessonId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onEditComment?: (commentId: string, data: { title: string; content: string; visibleToStudent: number; tagIds?: string[] }) => void;
  showCommentActions?: boolean;
  isStudentView?: boolean;
}

/**
 * Wrapper component that fetches and injects comments into LessonCard
 * Handles different comment fetching logic for student-specific views vs regular views
 */
export default function LessonCardWithComments(props: LessonCardWithCommentsProps) {
  const params = useParams<{ studentId?: string; parentId?: string }>();
  const isStudentSpecificView = !!params.studentId;
  const isParentSpecificView = !!params.parentId;
  
  // Fetch comments based on view type (student, parent, or all comments)
  const { data: studentComments = [] } = isStudentSpecificView ? useStudentLessonComments(params.studentId!, props.lesson.id) : { data: [] };
  const { data: parentComments = [] } = isParentSpecificView ? useParentLessonComments(params.parentId!, props.lesson.id) : { data: [] };
  const { data: regularComments = [] } = useCommentsByLesson(!isStudentSpecificView && !isParentSpecificView ? props.lesson.id : '');
  const comments = isStudentSpecificView ? studentComments : isParentSpecificView ? parentComments : regularComments;

  return <LessonCard {...props} comments={comments} onAddComment={props.onAddComment} />;
}
