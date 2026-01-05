import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
  password: z.string()
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const result = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (result.error) {
        if (result.error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (result.error.message.includes('User already registered')) {
          setError('An account with this email already exists');
        } else {
          setError(result.error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-emerald-500 opacity-40" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500 opacity-60" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500 opacity-80" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Habit Tracker
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin ? 'Welcome back' : 'Start building better habits'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>
            
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 font-medium"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-foreground font-medium">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-foreground font-medium">Sign in</span></>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
