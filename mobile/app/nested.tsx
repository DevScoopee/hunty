import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getHuntById, getHuntClues } from "@store/huntStore";
import { usePlayerStore } from "@store/useStore";
import { CluesList } from "@components/CluesList";
import type { StoredHunt, Clue } from "@lib/types";

export default function NestedScreen() {
  const router = useRouter();
  const { huntId, clueIndex } = useLocalSearchParams<{
    huntId: string;
    clueIndex?: string;
  }>();
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedCustomText, ThemedView } from '@components/themed';
import { useTheme } from '@providers/ThemeProvider';
import { getHuntById, getHuntClues } from '@store/huntStore';
import { usePlayerStore } from '@store/useStore';
import { CluesList } from '@components/CluesList';
import type { Clue, StoredHunt } from '@lib/types';

export default function NestedScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { huntId, clueIndex } = useLocalSearchParams<{ huntId?: string; clueIndex?: string }>();
  const [hunt, setHunt] = useState<StoredHunt | null>(null);
  const [clues, setClues] = useState<Clue[]>([]);
  const [answer, setAnswer] = useState("");
  const { markClueCompleted, getCompletedClues } = usePlayerStore();

  const hId = Number(huntId);
  const idx = Number(clueIndex) || 0;
  const clue = clues[idx];
  const isLast = idx === clues.length - 1;
  const completedClues = getCompletedClues(hId);

  useEffect(() => {
    Promise.all([getHuntById(hId), getHuntClues(hId)]).then(
      ([fetchedHunt, fetchedClues]) => {
        if (fetchedHunt) setHunt(fetchedHunt);
        setClues(fetchedClues);
      },
    );
  }, [hId]);

  useEffect(() => {
    setAnswer("");
  }, [idx]);

  const navigateToClue = (clueIdx: number) =>
    router.replace(`/nested?huntId=${hId}&clueIndex=${clueIdx}`);

  const handleSubmit = () => {
    if (!clue) return;
    if (answer.trim().toLowerCase() !== clue.answer.trim().toLowerCase()) {
      Alert.alert("Incorrect", "Try again");
      return;
    }
    markClueCompleted(hId, idx);
    if (isLast) {
      Alert.alert("Complete!", "You finished the hunt!");
      router.replace(`/details?huntId=${hId}`);
    } else {
      navigateToClue(idx + 1);
    }
  };

  const canGoPrev = idx > 0;
  const canGoNext = idx < clues.length - 1 && completedClues.has(idx);
  const progressWidth = `${((idx + 1) / clues.length) * 100}%` as `${number}%`;

  if (!clue) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hunt && <Text style={styles.huntTitle}>{hunt.title}</Text>}

        <Text style={styles.clueCount}>
          Clue {idx + 1} of {clues.length}
        </Text>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: progressWidth }]} />
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hunt && <ThemedCustomText variant="caption" style={styles.huntTitle}>{hunt.title}</ThemedCustomText>}
        <ThemedCustomText variant="label" style={styles.header}>
          Clue {idx + 1} of {clues.length}
        </ThemedCustomText>
        <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}> 
          <View
            style={[
              styles.progressBar,
              { width: `${((idx + 1) / clues.length) * 100}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>

        <ThemedCustomText variant="h3" weight="700" style={styles.question}>{clue.question}</ThemedCustomText>

        {clue.hint && (
          <View style={styles.hintBox}>
            <Text style={styles.hintLabel}>💡 Hint:</Text>
            <Text style={styles.hintText}>{clue.hint}</Text>
          <View style={[styles.hintContainer, { borderLeftColor: colors.warning, backgroundColor: colors.warning + '14' }]}> 
            <ThemedCustomText variant="caption" color="warning" weight="700">Hint</ThemedCustomText>
            <ThemedCustomText variant="caption" style={styles.hintText}>{clue.hint}</ThemedCustomText>
          </View>
        )}

        <TextInput
          placeholder="Your answer..."
          placeholderTextColor="#bbb"
          value={answer}
          onChangeText={setAnswer}
          autoCapitalize="none"
          autoCorrect={false}
          editable={true}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        />

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.navButton, !canGoPrev && styles.disabled]}
            onPress={() => navigateToClue(idx - 1)}
            disabled={!canGoPrev}
          >
            <Text style={styles.navButtonText}>← Prev</Text>
          </Pressable>

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {isLast ? "🏁 Finish" : "✓ Submit"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.navButton, !canGoNext && styles.disabled]}
            onPress={() => navigateToClue(idx + 1)}
            disabled={!canGoNext}
            style={[styles.navButton, { backgroundColor: colors.info }, idx === 0 && styles.disabledButton]}
            onPress={handlePreviousClue}
            disabled={idx === 0}
          >
            <ThemedCustomText variant="caption" lightColor="#fff" darkColor="#fff" weight="700">Previous</ThemedCustomText>
          </Pressable>

          <Pressable style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
            <ThemedCustomText variant="caption" lightColor="#fff" darkColor="#fff" weight="700">
              {isLast ? '🏁 Finish' : '✓ Submit'}
            </ThemedCustomText>
          </Pressable>

          <Pressable
            style={[
              styles.navButton,
              { backgroundColor: colors.info },
              (idx === clues.length - 1 || !completedClues.has(idx)) &&
                styles.disabledButton,
            ]}
            onPress={handleNextClue}
            disabled={idx === clues.length - 1 || !completedClues.has(idx)}
          >
            <ThemedCustomText variant="caption" lightColor="#fff" darkColor="#fff" weight="700">Next</ThemedCustomText>
          </Pressable>
        </View>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back to Hunt</Text>
        </Pressable>
      </ScrollView>

      {clues.length > 0 && (
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedCustomText variant="caption" color="primary" weight="700">Back to Hunt</ThemedCustomText>
        </Pressable>
      </ScrollView>

      {showCluesDropdown && clues.length > 0 && (
        <CluesList
          clues={clues}
          currentIndex={idx}
          completedIndices={completedClues}
          onSelectClue={navigateToClue}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 16 },
  huntTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  huntTitle: {
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  clueCount: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  header: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressBarFill: { height: "100%", backgroundColor: "#17a2b8" },
  question: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    color: "#1a1a1a",
    marginBottom: 20,
  },
  hintBox: {
    backgroundColor: "#fffbf0",
    borderLeftWidth: 4,
    borderLeftColor: "#ff9800",
  progressBar: {
    height: '100%',
  },
  question: {
    marginBottom: 20,
    lineHeight: 28,
  },
  hintContainer: {
    borderLeftWidth: 4,
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  hintLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ff9800",
    marginBottom: 4,
  },
  hintText: { fontSize: 13, color: "#666", lineHeight: 18 },
  input: {
    borderWidth: 2,
    borderColor: "#ddd",
  hintText: {
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#fafafa",
    color: "#333",
    backgroundColor: '#fafafa',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  buttonRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  navButton: {
    flex: 1,
    backgroundColor: "#6c757d",
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    flex: 1.2,
    backgroundColor: "#28a745",
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { backgroundColor: "#e0e0e0", opacity: 0.6 },
  navButtonText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  submitButtonText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  backButton: { paddingVertical: 10, alignItems: "center" },
  backButtonText: { fontSize: 13, color: "#17a2b8", fontWeight: "500" },
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
