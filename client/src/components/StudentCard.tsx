import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  BookOpen,
  DollarSign,
  Edit,
  Trash2,
  NotebookText,
  CalendarPlus,
  PencilLine,
} from "lucide-react";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  defaultSubject?: string;
  defaultRate?: number;
  defaultColor?: string;
  lessonCount?: number;
  lastLessonDate?: Date;
}

interface StudentCardProps {
  student: Student;
  onEdit: (studentId: string) => void;
  onScheduleLesson: (studentId: string) => void;
  onViewLessons: (studentId: string) => void;
  onViewNotes: (studentId: string) => void;
  onDelete: (studentId: string) => void;
}

export default function StudentCard({
  student,
  onEdit,
  onScheduleLesson,
  onViewLessons,
  onViewNotes,
  onDelete,
}: StudentCardProps) {

  return (
    <Card className="hover-elevate" data-testid={`student-card-${student.id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: student.defaultColor || "#3b82f6" }}
            title="Student color"
          />
          <div>
            <CardTitle className="text-lg font-semibold">
              {student.firstName} {student.lastName || ""}
            </CardTitle>
            <div className="text-xs text-muted-foreground mt-0.5">
              ID: {student.studentId}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {student.phoneNumber && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{student.phoneNumber}</span>
            </div>
          )}

          {student.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{student.email}</span>
            </div>
          )}

          {student.defaultSubject && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{student.defaultSubject}</span>
            </div>
          )}

          {student.defaultRate && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>£{student.defaultRate}/hour</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {student.lessonCount !== undefined && (
              <Badge variant="secondary">{student.lessonCount} lessons</Badge>
            )}
            {student.lastLessonDate && (
              <span className="text-xs text-muted-foreground">
                Last: {student.lastLessonDate.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onScheduleLesson(student.id)}
              data-testid={`button-schedule-lesson-${student.id}`}
            >
              <CalendarPlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(student.id)}
              data-testid={`button-edit-student-${student.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(student.id)}
              data-testid={`button-delete-student-${student.id}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/${student.studentId}/schedule`, '_blank')}
              data-testid={`button-view-lessons-${student.id}`}
            >
              <NotebookText />
              Schedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewNotes(student.id)}
              data-testid={`button-view-notes-${student.id}`}
            >
              <PencilLine />
              Notes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}