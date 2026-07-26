import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirige la ruta raíz (/) hacia el panel de administración (/admin)
  redirect('/admin');
}
