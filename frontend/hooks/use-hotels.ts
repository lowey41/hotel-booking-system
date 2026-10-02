import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HotelFilters {
  search?: string;
  city?: string;
  country?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  amenities?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export const useHotels = (filters: HotelFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.append(k, String(v));
  });

  return useQuery({
    queryKey: ['hotels', filters],
    queryFn: async () => {
      const res = await api.get(`/hotels?${params.toString()}`);
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useHotel = (id: string) => {
  return useQuery({
    queryKey: ['hotel', id],
    queryFn: async () => {
      const res = await api.get(`/hotels/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};

export const useHotelAvailability = (hotelId: string, checkIn: string, checkOut: string) => {
  return useQuery({
    queryKey: ['availability', hotelId, checkIn, checkOut],
    queryFn: async () => {
      const res = await api.get(`/hotels/availability?hotelId=${hotelId}&checkIn=${checkIn}&checkOut=${checkOut}`);
      return res.data.data;
    },
    enabled: !!hotelId && !!checkIn && !!checkOut,
  });
};

export const useAiRecommendations = () => {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const res = await api.get('/hotels/recommendations');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateHotel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/hotels', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['owner-hotels'] });
    },
  });
};

export const useUpdateHotel = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.put(`/hotels/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel', id] });
      queryClient.invalidateQueries({ queryKey: ['owner-hotels'] });
    },
  });
};

export const useOwnerHotels = () => {
  return useQuery({
    queryKey: ['owner-hotels'],
    queryFn: async () => {
      const res = await api.get('/hotels/owner/my-hotels');
      return res.data.data;
    },
  });
};
