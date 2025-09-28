import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Clock, User, DollarSign, Link as LinkIcon, Edit, Trash2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

interface LessonCardProps {
  lesson: {
    id: string;
    subject: string;
    dateTime: Date;
    studentName: string;
    duration: number;
    paymentStatus: 'pending' | 'paid' | 'overdue';
    pricePerHour: number;
    lessonLink?: string;
  };
  onEdit: (lessonId: string) => void;
  onDelete: (lessonId: string) => void;
  onJoinLesson?: (link: string) => void;
  onUpdatePaymentStatus?: (lessonId: string, status: 'pending' | 'paid' | 'overdue') => void;
}

export default function LessonCard({ lesson, onEdit, onDelete, onJoinLesson, onUpdatePaymentStatus }: LessonCardProps) {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-lesson-confirmed text-white';
      case 'pending': return 'bg-lesson-pending text-black'; 
      case 'overdue': return 'bg-lesson-cancelled text-white';
      default: return 'bg-secondary';
    }
  };

  const totalPrice = (lesson.pricePerHour * lesson.duration) / 60;

  return (
    <Card className="hover-elevate" data-testid={`lesson-card-${lesson.id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">{lesson.subject}</CardTitle>
        {onUpdatePaymentStatus ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`${getPaymentStatusColor(lesson.paymentStatus)} hover:opacity-80 px-3 py-1 h-auto text-xs font-medium`}
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
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge className={getPaymentStatusColor(lesson.paymentStatus)}>
            {lesson.paymentStatus}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{format(lesson.dateTime, 'PPp')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{lesson.studentName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{lesson.duration} minutes</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>£{lesson.pricePerHour}/hr (£{totalPrice.toFixed(2)} total)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {lesson.lessonLink && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onJoinLesson?.(lesson.lessonLink!)}
                data-testid={`button-join-lesson-${lesson.id}`}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Join Lesson
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(lesson.id)}
              data-testid={`button-edit-lesson-${lesson.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(lesson.id)}
              data-testid={`button-delete-lesson-${lesson.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}