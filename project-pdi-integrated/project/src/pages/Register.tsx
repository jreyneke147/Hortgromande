import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError('');
    const { error } = await signUp(data.email, data.password, data.fullName);
    if (error) {
      setServerError(error.message);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-brand-700 flex items-center justify-center">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Hortgro M&E</span>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-6">Join the Hortgro monitoring platform</p>

          {serverError && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{serverError}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label-text">Full name</label>
              <input {...register('fullName')} className="input-field" placeholder="Johan van der Merwe" />
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="label-text">Email address</label>
              <input {...register('email')} type="email" className="input-field" placeholder="you@hortgro.co.za" />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label-text">Confirm password</label>
              <input {...register('confirmPassword')} type="password" className="input-field" placeholder="Repeat your password" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-700 hover:text-brand-800 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
