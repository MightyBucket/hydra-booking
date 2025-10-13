import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Plus, 
  GraduationCap,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react';

interface NavigationProps {
  onAddLesson: () => void;
  onAddStudent: () => void;
  lessonCount?: number;
  studentCount?: number;
  isStudentView?: boolean;
  studentId?: string;
}

export default function Navigation({ 
  onAddLesson, 
  onAddStudent, 
  lessonCount = 0, 
  studentCount = 0,
  isStudentView = false,
  studentId
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  // Student view navigation items
  const studentNavItems = studentId ? [
    {
      path: `/${studentId}/calendar`,
      label: 'Calendar',
      icon: Calendar,
    },
    {
      path: `/${studentId}/schedule`,
      label: 'Schedule',
      icon: GraduationCap,
    },
  ] : [];

  // Regular navigation items
  const regularNavItems = [
    {
      path: '/',
      label: 'Calendar',
      icon: Calendar,
      badge: lessonCount > 0 ? lessonCount.toString() : undefined,
    },
    {
      path: '/schedule',
      label: 'Schedule',
      icon: GraduationCap,
      badge: lessonCount > 0 ? lessonCount.toString() : undefined,
    },
    {
      path: '/students',
      label: 'Students',
      icon: Users,
      badge: studentCount > 0 ? studentCount.toString() : undefined,
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const navItems = isStudentView ? studentNavItems : regularNavItems;

  const isActiveRoute = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-mobile-menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <Card 
        className={`
          fixed md:static top-0 left-0 h-full w-64 z-40 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
        `}
        data-testid="navigation-sidebar"
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">LessonBook</h1>
              <p className="text-sm text-muted-foreground">Manage your lessons</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {!isStudentView && (
          <div className="p-4 border-b space-y-2">
            <Button
              className="w-full justify-start"
              onClick={() => {
                onAddLesson();
                setIsOpen(false);
              }}
              data-testid="button-add-lesson"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Lesson
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                onAddStudent();
                setIsOpen(false);
              }}
              data-testid="button-add-student"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <li key={item.path}>
                  <Link href={item.path}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className="w-full justify-start gap-2"
                      onClick={() => setIsOpen(false)}
                      data-testid={`nav-link-${item.label.toLowerCase()}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="text-sm text-muted-foreground text-center">
            <p>© 2024 LessonBook</p>
            <p>Lesson Management Made Easy</p>
          </div>
        </div>
      </Card>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}