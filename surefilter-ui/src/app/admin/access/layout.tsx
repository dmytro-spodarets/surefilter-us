import AccessShell from '@/components/admin/AccessShell';

export default function AccessLayout({ children }: { children: React.ReactNode }) {
  return <AccessShell>{children}</AccessShell>;
}
