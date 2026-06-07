import { redirect } from 'next/navigation';

// /parvagues/live has no index of its own — send visitors to the main page.
export default function LiveIndex() {
  redirect('/parvagues');
}
