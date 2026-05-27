import { FlatList, View, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { HuntyRefreshControl } from "@/components/HuntyRefreshControl";
import { useRefreshByUser } from "@/hooks/useRefreshByUser";
import type { StoredHunt } from "@lib/types";

const fetchHunts = async (): Promise<StoredHunt[]> => [];

export default function HomeFeed() {
  const { data: hunts, refetch } = useQuery({
    queryKey: ["hunts"],
    queryFn: fetchHunts,
  });

  const { isRefreshing, onRefresh } = useRefreshByUser(refetch);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={hunts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#f1f5f9",
            }}
          >
            <Text style={{ color: "#0f172a", fontWeight: "600" }}>
              {item.title}
            </Text>
          </View>
        )}
        refreshControl={
          <HuntyRefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <Text style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
            No active hunts found.
          </Text>
        }
      />
    </View>
  );
}
