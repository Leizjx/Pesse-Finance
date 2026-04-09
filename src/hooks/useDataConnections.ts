import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDataConnections, deleteDataConnection, updateSelectedBanks } from "@/services/dataConnectionService";
import { useAuth } from "./useAuth";

export function useDataConnections() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["data_connections", user?.id],
    queryFn: () => fetchDataConnections(user!.id),
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDataConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data_connections", user?.id] });
    },
  });

  const updateBanksMutation = useMutation({
    mutationFn: ({ connectionId, selectedBanks }: { connectionId: string; selectedBanks: string[] }) =>
      updateSelectedBanks(connectionId, selectedBanks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data_connections", user?.id] });
    },
  });

  return {
    ...query,
    deleteConnection: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    updateBanks: updateBanksMutation.mutateAsync,
    isUpdatingBanks: updateBanksMutation.isPending,
  };
}
