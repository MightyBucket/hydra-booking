
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DeleteLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleteAllFuture: boolean;
  onDeleteAllFutureChange: (checked: boolean) => void;
  onConfirm: () => void;
  testIdPrefix?: string;
}

export default function DeleteLessonDialog({
  open,
  onOpenChange,
  deleteAllFuture,
  onDeleteAllFutureChange,
  onConfirm,
  testIdPrefix = "",
}: DeleteLessonDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this lesson? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`delete-all-future${testIdPrefix ? `-${testIdPrefix}` : ""}`}
              checked={deleteAllFuture}
              onCheckedChange={(checked) => onDeleteAllFutureChange(!!checked)}
              data-testid={`checkbox-delete-all-future${testIdPrefix ? `-${testIdPrefix}` : ""}`}
            />
            <Label htmlFor={`delete-all-future${testIdPrefix ? `-${testIdPrefix}` : ""}`} className="text-sm">
              Delete all future lessons on the same day and time
            </Label>
          </div>
          {deleteAllFuture && (
            <p className="text-sm text-muted-foreground">
              This will delete all future lessons for the same student that
              occur on the same day of the week at the same time.
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel data-testid={`button-cancel-delete${testIdPrefix ? `-${testIdPrefix}` : ""}`}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid={`button-confirm-delete${testIdPrefix ? `-${testIdPrefix}` : ""}`}
          >
            Delete {deleteAllFuture ? "All Future Lessons" : "Lesson"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
