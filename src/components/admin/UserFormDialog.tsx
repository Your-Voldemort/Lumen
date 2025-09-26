import { memo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { UserManagementForm } from "./UserManagementForm";

interface UserFormDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  formData: {
    name: string;
    email: string;
    role: "student" | "faculty" | "admin";
    department: string;
    year: string;
    studentId: string;
  };
  onChange: (field: string, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitText: string;
}

export const UserFormDialog = memo(({
  isOpen,
  title,
  description,
  formData,
  onChange,
  onCancel,
  onSubmit,
  submitText
}: UserFormDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onCancel}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      
      <UserManagementForm 
        formData={formData} 
        onChange={onChange}
      />
      
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {submitText}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
));

UserFormDialog.displayName = 'UserFormDialog';