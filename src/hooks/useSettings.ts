import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchIntegrations, updateIntegration, 
  fetchNotificationPrefs, updateNotificationPrefs, 
  exportUserData, deleteAccount 
} from '../lib/api/settings';

export function useSettings(userId: string | undefined) {
  const queryClient = useQueryClient();

  const integrationsQuery = useQuery({
    queryKey: ['integrations', userId],
    queryFn: () => fetchIntegrations(userId!),
    enabled: !!userId,
  });

  const prefsQuery = useQuery({
    queryKey: ['notificationPrefs', userId],
    queryFn: () => fetchNotificationPrefs(userId!),
    enabled: !!userId,
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: ({ provider, connected }: { provider: string; connected: boolean }) => 
      updateIntegration(userId!, provider, connected),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', userId] });
    },
  });

  const updatePrefsMutation = useMutation({
    mutationFn: (prefs: any) => updateNotificationPrefs(userId!, prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPrefs', userId] });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: () => exportUserData(),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteAccount(),
  });

  return {
    integrations: integrationsQuery.data || [],
    notificationPrefs: prefsQuery.data,
    toggleIntegration: toggleIntegrationMutation.mutate,
    updatePrefs: updatePrefsMutation.mutate,
    exportData: exportDataMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isLoading: integrationsQuery.isLoading || prefsQuery.isLoading,
    isExporting: exportDataMutation.isPending,
    isDeleting: deleteAccountMutation.isPending,
  };
}
