import ThemeToggle from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <div className="flex items-center justify-center h-32 gap-4">
      <p className="text-sm text-muted-foreground">Click to toggle theme:</p>
      <ThemeToggle />
    </div>
  );
}