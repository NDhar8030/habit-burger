import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { Header } from '@/components/Header';
import { HabitTracker } from '@/components/habit/HabitTracker';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6">
        <HabitTracker />
      </main>
    </div>
  );
};

export default Index;
