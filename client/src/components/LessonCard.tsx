import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Clock, DollarSign, Trash2, Edit, ChevronDown, Link as LinkIcon, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

interface Comment {
  id: string;
  title: string;
  content: string;
  visibleToStudent: number;
  createdAt: string;
}

interface LessonCardProps {
  lesson: {
    id: string;
    subject: string;
    dateTime: Date;
    studentName: string;
    studentColor?: string;
    duration: number;
    paymentStatus: 'pending' | 'paid' | 'overdue' | 'unpaid';
    pricePerHour: number;
    lessonLink?: string;
  };
  comments?: Comment[];
  onEdit: (lessonId: string) => void;
  onDelete: (lessonId: string) => void;
  onJoinLesson?: (link: string) => void;
  onUpdatePaymentStatus?: (lessonId: string, status: 'pending' | 'paid' | 'overdue' | 'unpaid') => void;
  onAddComment?: (lessonId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  showCommentActions?: boolean;
  isStudentView?: boolean;
}

export default function LessonCard({ lesson, comments = [], onEdit, onDelete, onJoinLesson, onUpdatePaymentStatus, onAddComment, onDeleteComment, showCommentActions = true, isStudentView = false }: LessonCardProps) {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-lesson-confirmed text-white';
      case 'pending': return 'bg-lesson-pending text-black';
      case 'overdue': return 'bg-lesson-cancelled text-white';
      case 'unpaid': return 'bg-lesson-cancelled text-white';
      default: return 'bg-secondary';
    }
  };

  const totalPrice = (lesson.pricePerHour * lesson.duration) / 60;

  return (
    <Card className="hover-elevate border-l-4 border-l-primary/20" data-testid={`lesson-card-${lesson.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold truncate">{lesson.subject}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <div 
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: lesson.studentColor || '#3b82f6' }}
              />
              <span className="truncate">{lesson.studentName}</span>
            </div>
          </div>
          {onUpdatePaymentStatus ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${getPaymentStatusColor(lesson.paymentStatus)} hover:opacity-80 px-2 py-1 h-auto text-xs font-medium flex-shrink-0`}
                  data-testid={`dropdown-payment-status-${lesson.id}`}
                >
                  {lesson.paymentStatus}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onUpdatePaymentStatus(lesson.id, 'pending')}
                  className={lesson.paymentStatus === 'pending' ? 'bg-accent' : ''}
                  data-testid={`payment-option-pending-${lesson.id}`}
                >
                  <span className="w-3 h-3 rounded-full bg-lesson-pending mr-2"></span>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdatePaymentStatus(lesson.id, 'paid')}
                  className={lesson.paymentStatus === 'paid' ? 'bg-accent' : ''}
                  data-testid={`payment-option-paid-${lesson.id}`}
                >
                  <span className="w-3 h-3 rounded-full bg-lesson-confirmed mr-2"></span>
                  Paid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdatePaymentStatus(lesson.id, 'overdue')}
                  className={lesson.paymentStatus === 'overdue' ? 'bg-accent' : ''}
                  data-testid={`payment-option-overdue-${lesson.id}`}
                >
                  <span className="w-3 h-3 rounded-full bg-lesson-cancelled mr-2"></span>
                  Overdue
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdatePaymentStatus(lesson.id, 'unpaid')}
                  className={lesson.paymentStatus === 'unpaid' ? 'bg-accent' : ''}
                  data-testid={`payment-option-unpaid-${lesson.id}`}
                >
                  <span className="w-3 h-3 rounded-full bg-lesson-cancelled mr-2"></span>
                  Unpaid
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Badge className={`${getPaymentStatusColor(lesson.paymentStatus)} text-xs flex-shrink-0`}>
              {lesson.paymentStatus}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{format(lesson.dateTime, 'h:mm a')}</span>
            </div>
            <span className="text-muted-foreground text-xs">{lesson.duration}min</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span>£{lesson.pricePerHour}/hr</span>
            </div>
            <span className="font-semibold">£{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            {lesson.lessonLink && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onJoinLesson?.(lesson.lessonLink!)}
                data-testid={`button-join-lesson-${lesson.id}`}
                className="h-8 px-3 text-xs"
              >
                <LinkIcon className="h-3 w-3 mr-1" />
                Join
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isStudentView && showCommentActions && onAddComment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddComment(lesson.id)}
                data-testid={`button-add-comment-${lesson.id}`}
                className="h-8 w-8 p-0"
              >
                <MessageSquare className="h-3 w-3" />
              </Button>
            )}
            {!isStudentView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(lesson.id)}
                data-testid={`button-edit-lesson-${lesson.id}`}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {!isStudentView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(lesson.id)}
                data-testid={`button-delete-lesson-${lesson.id}`}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {comments.length > 0 && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Comments ({comments.length})
            </div>
            {comments.map((comment) => (
              <div key={comment.id} className="text-xs bg-muted/50 p-2 rounded space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium flex items-center gap-1">
                    {comment.title}
                    {comment.visibleToStudent === 1 ? (
                      <Eye className="h-3 w-3 text-muted-foreground" title="Visible to student" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" title="Not visible to student" />
                    )}
                  </div>
                  {showCommentActions && onDeleteComment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteComment(comment.id)}
                      className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                      data-testid={`button-delete-comment-${comment.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="text-muted-foreground">{comment.content}</div>
                <div className="text-[10px] text-muted-foreground">
                  {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}