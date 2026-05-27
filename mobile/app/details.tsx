import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getHuntById, getHuntClues } from "@store/huntStore";
import { usePlayerStore } from "@store/useStore";
import type { StoredHunt, Clue } from "@lib/types";

export default function DetailsScreen() {
  const router = useRouter();
  const { huntId } = useLocalSearchParams<{ huntId: string }>();
  const [hunt, setHunt] = useState<StoredHunt | null>(null);
  const [clues, setClues] = useState<Clue[]>([]);
  const { getCompletedClues } = usePlayerStore();

  const hId = Number(huntId);
  const completedClues = getCompletedClues(hId);
  const isComplete = clues.length > 0 && completedClues.size === clues.length;
  const progressPercent =
    clues.length > 0
      ? (`${(completedClues.size / clues.length) * 100}%` as `${number}%`)
      : "0%";

  useEffect(() => {
    Promise.all([getHuntById(hId), getHuntClues(hId)]).then(
      ([fetchedHunt, fetchedClues]) => {
        if (fetchedHunt) setHunt(fetchedHunt);
        setClues(fetchedClues);
      },
    );
  }, [hId]);

  const handleStart = () => router.push(`/nested?huntId=${hId}&clueIndex=0`);

  const handleResume = () => {
    const next = clues.findIndex((_, i) => !completedClues.has(i));
    router.push(`/nested?huntId=${hId}&clueIndex=${next >= 0 ? next : 0}`);
  };

  if (!hunt) return <View style={styles.container} />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{hunt.title}</Text>
        <Text style={styles.status}>{hunt.status}</Text>
      </View>

      <Text style={styles.description}>{hunt.description}</Text>

      {/* Metadata */}
      <View style={styles.metaRow}>
        {[
          { label: "Total Clues", value: String(clues.length) },
          { label: "Reward Type", value: hunt.rewardType },
        ].map(({ label, value }) => (
          <View key={label} style={styles.metaItem}>
            <Text style={styles.metaLabel}>{label}</Text>
            <Text style={styles.metaValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Progress */}
      {completedClues.size > 0 && (
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <Text style={styles.progressText}>
            {completedClues.size} of {clues.length} clues solved
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: progressPercent }]}
            />
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {isComplete ? (
          <View style={styles.completedBox}>
            <Text style={styles.completedText}>✓ Hunt Completed!</Text>
            <Pressable style={styles.secondaryButton} onPress={handleStart}>
              <Text style={styles.secondaryButtonText}>Replay Hunt</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.primaryButton}
            onPress={completedClues.size === 0 ? handleStart : handleResume}
          >
            <Text style={styles.primaryButtonText}>
              {completedClues.size === 0 ? "🎯 Start Hunt" : "▶ Resume Hunt"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Clues list */}
      <View style={styles.cluesSection}>
        <Text style={styles.sectionTitle}>
          Clues ({completedClues.size}/{clues.length})
        </Text>
        {clues.map((clue, index) => {
          const done = completedClues.has(index);
          return (
            <View
              key={clue.id}
              style={[styles.clueRow, done && styles.clueRowDone]}
            >
              <Text style={[styles.clueNum, done && styles.clueNumDone]}>
                {done ? "✓" : "○"} #{index + 1}
              </Text>
              <Text
                style={[styles.clueQuestion, done && styles.clueQuestionDone]}
                numberOfLines={2}
              >
                {clue.question}
              </Text>
              <Text style={styles.cluePoints}>{clue.points} pts</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 6, color: "#1a1a1a" },
  status: {
    fontSize: 12,
    color: "#17a2b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    padding: 16,
    paddingBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  metaItem: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  metaValue: { fontSize: 16, fontWeight: "600", color: "#333", marginTop: 4 },
  progressSection: {
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#e8f4f8",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#17a2b8",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  progressText: { fontSize: 13, color: "#555", fontWeight: "500" },
  progressBarBg: {
    height: 8,
    backgroundColor: "#d0e8ef",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: "#17a2b8" },
  actions: { paddingHorizontal: 16, paddingVertical: 12 },
  primaryButton: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  secondaryButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  completedBox: {
    backgroundColor: "#e8f5e9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4caf50",
    alignItems: "center",
  },
  completedText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 8,
  },
  cluesSection: { paddingHorizontal: 16, paddingVertical: 12 },
  clueRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 8,
  },
  clueRowDone: { backgroundColor: "#e8f5e9", borderColor: "#4caf50" },
  clueNum: { fontSize: 14, fontWeight: "600", color: "#666", minWidth: 35 },
  clueNumDone: { color: "#2e7d32" },
  clueQuestion: { flex: 1, fontSize: 13, color: "#555", lineHeight: 18 },
  clueQuestionDone: { color: "#2e7d32", textDecorationLine: "line-through" },
  cluePoints: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ff9800",
    backgroundColor: "#fff3e0",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  spacer: { height: 20 },
});
