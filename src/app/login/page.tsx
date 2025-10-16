import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirect to the default user login page
  redirect('/user-login');
}
