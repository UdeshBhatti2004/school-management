import { Users } from 'lucide-react';
import UsersManager from './UsersManager';

export default function Students() {
  return (
    <UsersManager
      role="student"
      title="Students"
      subtitle="Manage student records, class assignments, and guardian details."
      icon={Users}
    />
  );
}
