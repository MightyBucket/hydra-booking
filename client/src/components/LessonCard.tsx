
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
    <Card className="hover-elevate border-l-4 border-l-primary/20" data-testid={`lesson-card-${lesson.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold truncate">{lesson.subject}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <User className="h-3 w-3 flex-shrink-0" />
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
              <span className="font-medium">{format(lesson.dateTime, 'MMM d, h:mm a')}</span>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(lesson.id)}
              data-testid={`button-edit-lesson-${lesson.id}`}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(lesson.id)}
              data-testid={`button-delete-lesson-${lesson.id}`}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
