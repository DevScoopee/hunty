import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getHuntById, getHuntClues } from "@store/huntStore";
import { usePlayerStore } from "@store/useStore";
import type { StoredHunt, Clue } from "@lib/types";

export default function DetailsScreen() {
  const router = useRouter();
  const { huntId } = useLocalSearchParams<{ huntId: string }>();
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedCustomText, ThemedView } from '@components/themed';
import { useTheme } from '@providers/ThemeProvider';
import { getHuntById, getHuntClues } from '@store/huntStore';
import { usePlayerStore } from '@store/useStore';
import type { Clue, StoredHunt } from '@lib/types';

export default function DetailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { huntId } = useLocalSearchParams<{ huntId?: string }>();
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
  const progressPercent = useMemo(() => {
    if (clues.length === 0) return 0;
    return Math.round((completedClues.size / clues.length) * 100);
  }, [completedClues.size, clues.length]);
  const registeredPlayers = useMemo(() => Math.max(12, clues.length * 5 + hId), [clues.length, hId]);
  const prizePool = useMemo(() => {
    const xlm = Math.max(10, clues.length * 3);
    const nftCount = hunt?.rewardType === 'NFT' || hunt?.rewardType === 'Both' ? Math.max(1, Math.floor(clues.length / 3)) : 0;
    return { xlm, nftCount };
  }, [clues.length, hunt?.rewardType]);
  const creatorAddress = useMemo(() => {
    if (hunt?.creatorEmail) {
      const username = hunt.creatorEmail.split('@')[0] || 'creator';
      return `G${username.toUpperCase().slice(0, 5)}...${String(hId).padStart(4, '0')}`;
    }
    return `GHUNT...${String(hId).padStart(4, '0')}`;
  }, [hunt?.creatorEmail, hId]);

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
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: colors.primary + '12', borderBottomColor: colors.border }]}>
        <ThemedCustomText variant="h2" weight="800" style={styles.title}>{hunt.title}</ThemedCustomText>
        <ThemedCustomText variant="caption" color="primary" weight="700" style={styles.status}>{hunt.status}</ThemedCustomText>
      </View>

      <ThemedCustomText variant="body" style={styles.description}>{hunt.description}</ThemedCustomText>

      <View style={[styles.loreCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
        <ThemedCustomText variant="label" weight="700" style={styles.sectionTitle}>Hunt Lore</ThemedCustomText>
        <ThemedCustomText variant="body" style={styles.loreText}>
          {hunt.description} Follow the trail, unlock each clue, and race to claim the final reward before rival hunters do.
        </ThemedCustomText>
      </View>

      <View style={styles.metaContainer}>
        <View style={[styles.metaItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <ThemedCustomText variant="caption" style={styles.metaLabel}>Total Clues</ThemedCustomText>
          <ThemedCustomText variant="h3" color="primary" weight="700">{clues.length}</ThemedCustomText>
        </View>
        <View style={[styles.metaItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <ThemedCustomText variant="caption" style={styles.metaLabel}>Reward Type</ThemedCustomText>
          <ThemedCustomText variant="h3" color="primary" weight="700">{hunt.rewardType}</ThemedCustomText>
        </View>
        <View style={[styles.metaItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <ThemedCustomText variant="caption" style={styles.metaLabel}>Players</ThemedCustomText>
          <ThemedCustomText variant="h3" color="primary" weight="700">{registeredPlayers}</ThemedCustomText>
        </View>
        <View style={[styles.metaItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <ThemedCustomText variant="caption" style={styles.metaLabel}>Creator</ThemedCustomText>
          <ThemedCustomText variant="label" weight="700">{creatorAddress}</ThemedCustomText>
        </View>
      </View>

      <View style={[styles.prizeCard, { borderColor: colors.warning, backgroundColor: colors.warning + '12' }]}>
        <ThemedCustomText variant="label" weight="700" style={styles.sectionTitle}>Prize Breakdown</ThemedCustomText>
        <View style={styles.prizeRow}>
          <ThemedCustomText variant="body">XLM Pool</ThemedCustomText>
          <ThemedCustomText variant="label" weight="700" color="warning">{prizePool.xlm} XLM</ThemedCustomText>
        </View>
        <View style={styles.prizeRow}>
          <ThemedCustomText variant="body">NFT Rewards</ThemedCustomText>
          <ThemedCustomText variant="label" weight="700" color="warning">{prizePool.nftCount}</ThemedCustomText>
        </View>
      </View>

      {clues.length > 0 && (
        <View style={[styles.progressSection, { backgroundColor: colors.info + '12', borderLeftColor: colors.info }]}> 
          <ThemedCustomText variant="label" weight="700" style={styles.sectionTitle}>Your Progress</ThemedCustomText>
          <View style={styles.progressStats}>
            <ThemedCustomText variant="body" style={styles.progressText}>
              {completedClues.size} of {clues.length} clues solved ({progressPercent}%)
            </ThemedCustomText>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}> 
              <View
                style={[
                  styles.progressBar,
                  { width: `${progressPercent}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
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
      <View style={styles.actionButtonsContainer}>
        {completedClues.size === 0 ? (
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleStartHunt}
          >
            <ThemedCustomText variant="label" lightColor="#fff" darkColor="#fff" weight="700">Start Hunt</ThemedCustomText>
          </Pressable>
        ) : isComplete ? (
          <View style={[styles.completedContainer, { borderColor: colors.success, backgroundColor: colors.success + '12' }]}> 
            <ThemedCustomText variant="label" color="success" weight="700">Hunt Completed</ThemedCustomText>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: colors.primary }]}
              onPress={handleStartHunt}
            >
              <ThemedCustomText variant="label" lightColor="#fff" darkColor="#fff" weight="700">Replay Hunt</ThemedCustomText>
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
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleResume}
          >
            <ThemedCustomText variant="label" lightColor="#fff" darkColor="#fff" weight="700">Resume Hunt</ThemedCustomText>
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
      <View style={styles.cluesSection}>
        <ThemedCustomText variant="label" weight="700" style={styles.sectionTitle}>Clues ({completedClues.size}/{clues.length})</ThemedCustomText>
        <FlatList
          scrollEnabled={false}
          data={clues}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => {
            const isCompleted = completedClues.has(index);
            return (
              <View
                style={[
                  styles.clueOverview,
                  { borderColor: isCompleted ? colors.success : colors.border, backgroundColor: isCompleted ? colors.success + '10' : colors.background },
                ]}
              >
                <ThemedCustomText variant="label" style={[styles.clueOverviewNum, isCompleted && { color: colors.success }]}> 
                  {isCompleted ? '✓' : '○'} #{index + 1}
                </ThemedCustomText>
                <ThemedCustomText
                  variant="caption"
                  style={[
                    styles.clueOverviewQuestion,
                    isCompleted && { color: colors.success, textDecorationLine: 'line-through' },
                  ]}
                  numberOfLines={2}
                >
                  {item.question}
                </ThemedCustomText>
                <ThemedCustomText variant="caption" color="warning" style={styles.cluePoints}>{item.points} pts</ThemedCustomText>
              </View>
            );
          }}
        />
      </View>

      <View style={styles.spacer} />
    </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
  },
  title: {
    marginBottom: 6,
  },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 6, color: "#1a1a1a" },
  status: {
    fontSize: 12,
    color: "#17a2b8",
    fontWeight: "600",
    textTransform: "uppercase",
    textTransform: 'uppercase',
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
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
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
    width: '47%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  metaLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  loreCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  loreText: {
    lineHeight: 20,
  },
  prizeCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  prizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  sectionTitle: {
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
  progressStats: {
    gap: 8,
  },
  progressText: {
    opacity: 0.85,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  completedBox: {
    backgroundColor: "#e8f5e9",
  completedContainer: {
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
    alignItems: 'center',
  },
  cluesSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  clueOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
  },
  clueOverviewNum: {
    minWidth: 35,
  },
  clueOverviewQuestion: {
    flex: 1,
    lineHeight: 18,
  },
  cluePoints: {
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  spacer: { height: 20 },
  spacer: {
    height: 20,
  },
});
