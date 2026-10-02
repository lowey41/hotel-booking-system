'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export function ProfileForm({ user }: { user: any }) {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => api.put('/users/profile', data),
    onSuccess: (res) => {
      setUser({ ...user, ...res.data.data });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  return (
    <div>
      <h3 className="text-lg font-semibold mb-6">Profile Information</h3>
      <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" className="mt-1" {...register('name')} />
          {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="mt-1" {...register('phone')} />
          {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input id="avatar" type="url" placeholder="https://..." className="mt-1" {...register('avatar')} />
          {errors.avatar && <p className="text-destructive text-sm mt-1">{errors.avatar.message}</p>}
        </div>

        <div>
          <Label>Email</Label>
          <Input value={user.email} disabled className="mt-1 bg-muted" />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Save Changes
        </Button>
      </form>
    </div>
  );
}
