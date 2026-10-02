import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

export const useWishlist = (hotelId?: string) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/users/wishlist');
      return res.data.data;
    },
    enabled: !!user,
  });

  const isInWishlist = hotelId ? wishlist.some((w: any) => w.hotelId === hotelId) : false;

  const { mutate: toggleWishlist } = useMutation({
    mutationFn: async () => {
      if (!hotelId) return;
      const res = await api.post(`/users/wishlist/${hotelId}`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(data?.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist');
    },
    onError: () => {
      toast.error('Please login to save hotels');
    },
  });

  return { wishlist, isInWishlist, toggleWishlist };
};
