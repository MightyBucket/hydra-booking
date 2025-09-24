import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save, X } from 'lucide-react';

interface StudentFormProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    defaultSubject?: string;
    defaultRate?: number;
    defaultLink?: string;
  };
  onSubmit: (studentData: any) => void;
  onCancel: () => void;
}

export default function StudentForm({ initialData, onSubmit, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phoneNumber: initialData?.phoneNumber || '',
    defaultSubject: initialData?.defaultSubject || '',
    defaultRate: initialData?.defaultRate || 50,
    defaultLink: initialData?.defaultLink || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl" data-testid="student-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {initialData ? 'Edit Student' : 'Add New Student'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                required
                data-testid="input-first-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                data-testid="input-last-name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="student@example.com"
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="+1 (555) 123-4567"
              data-testid="input-phone"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultSubject">Default Subject *</Label>
              <Input
                id="defaultSubject"
                value={formData.defaultSubject}
                onChange={(e) => handleInputChange('defaultSubject', e.target.value)}
                placeholder="e.g., Mathematics, Physics"
                required
                data-testid="input-default-subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultRate">Default Rate ($/hour) *</Label>
              <Input
                id="defaultRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.defaultRate}
                onChange={(e) => handleInputChange('defaultRate', parseFloat(e.target.value) || 0)}
                placeholder="50.00"
                required
                data-testid="input-default-rate"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultLink">Default Lesson Link *</Label>
            <Input
              id="defaultLink"
              type="url"
              value={formData.defaultLink}
              onChange={(e) => handleInputChange('defaultLink', e.target.value)}
              placeholder="https://zoom.us/j/your-room"
              required
              data-testid="input-default-link"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="button-cancel"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="button-save-student"
            >
              <Save className="h-4 w-4 mr-2" />
              {initialData ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}