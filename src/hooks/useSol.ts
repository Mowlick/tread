import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMessages, sendMessage, insertUserMessage } from '../lib/api/sol';

export function useSol(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['solMessages', userId],
    queryFn: () => fetchMessages(userId!),
    enabled: !!userId,
    refetchInterval: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, context }: { message: string, context?: string }) => {
      // Optimistically add user message
      await insertUserMessage(userId!, message);
      queryClient.invalidateQueries({ queryKey: ['solMessages', userId] });
      
      return sendMessage(userId!, message, context);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solMessages', userId] });
    },
  });

  return {
    messages: query.data || [],
    isLoading: query.isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
}
