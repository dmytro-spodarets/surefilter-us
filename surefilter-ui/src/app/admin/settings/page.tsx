import { redirect } from 'next/navigation';

export default function SettingsPage() {
  // Redirect to the first tab by default
  redirect('/admin/settings/site');
}
