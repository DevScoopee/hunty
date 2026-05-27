import React, { useState } from "react";
import { StyleSheet, View, ScrollView, TextInput, Alert } from "react-native";
import { ThemedView, ThemedCustomText, ThemedButton } from "@components/themed";
import { useHaptics } from "@/hooks/useHaptics";
import { usePlayerStore } from "@store/useStore";
import { useTheme } from "@providers/ThemeProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClueData {
  question: string;
  hint: string;
  answer: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HUNT_NAMES: Record<number, string> = {
  1: "City Secrets",
  2: "Campus Quest",
  3: "Cyberpunk Odyssey",
};

const CLUES_BY_HUNT: Record<number, ClueData[]> = {
  1: [
    {
      question:
        "Find the historical blue mural painted on the brick wall beside the old clock tower.",
      hint: "Look near the city square fountain.",
      answer: "clocktower",
    },
    {
      question:
        "Locate the bronze statue of the town founder near the library.",
      hint: "He is holding an open book.",
      answer: "founder",
    },
    {
      question:
        "Find the hidden micro-brewery courtyard with the neon hop sign.",
      hint: "It's inside an alleyway off 5th Avenue.",
      answer: "hops",
    },
  ],
  2: [
    {
      question: "Go to the oldest oak tree on the main campus lawn.",
      hint: "Near the science building.",
      answer: "oaktree",
    },
    {
      question:
        "Decipher the inscription on the stone sundial near the observatory.",
      hint: 'It mentions "Time Flies".',
      answer: "sundial",
    },
  ],
  3: [
    {
      question:
        "Scan the cybernetic terminal code near the tech-district archway.",
      hint: "Under the blinking purple light.",
      answer: "terminal",
    },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({
  colors,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View
      style={[styles.emptyContainer, { backgroundColor: colors.background }]}
    >
      <ThemedCustomText
        variant="h2"
        color="primary"
        weight="800"
        style={styles.centered}
      >
        Play Interface
      </ThemedCustomText>
      <ThemedCustomText
        variant="body"
        color="text"
        style={[styles.centered, styles.emptyBody]}
      >
        No active hunt session found. Visit the Hunts tab to join an active
        arcade game!
      </ThemedCustomText>
    </View>
  );
}

function VictoryState({
  huntName,
  onClear,
  colors,
  haptics,
}: {
  huntName: string;
  onClear: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
  haptics: ReturnType<typeof useHaptics>;
}) {
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.centerContent}
    >
      <View
        style={[
          styles.victoryCard,
          {
            backgroundColor: colors.success + "15",
            borderColor: colors.success,
          },
        ]}
      >
        <ThemedCustomText
          variant="h1"
          color="success"
          weight="800"
          style={[styles.centered, styles.victoryTitle]}
        >
          VICTORY! 🏆
        </ThemedCustomText>
        <ThemedCustomText variant="body" color="text" style={styles.centered}>
          You successfully completed the "{huntName}" hunt!
        </ThemedCustomText>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ThemedCustomText
          variant="caption"
          color="text"
          style={{ opacity: 0.6 }}
        >
          Rewards Dispatched:
        </ThemedCustomText>
        <ThemedCustomText
          variant="h2"
          color="secondary"
          weight="700"
          style={styles.centered}
        >
          ✓ 150 XLM Transferred
        </ThemedCustomText>
        <ThemedCustomText
          variant="h3"
          color="primary"
          weight="600"
          style={styles.centered}
        >
          ✓ Stellar NFT Minted
        </ThemedCustomText>
      </View>
      <ThemedButton
        text="Back to Arcade"
        variant="primary"
        size="lg"
        fullWidth
        onPress={() => {
          haptics.triggerImpact("medium");
          onClear();
        }}
      />
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PlayScreen() {
  const { colors } = useTheme();
  const haptics = useHaptics();
  const { currentProgress, updateClueIndex, markCompleted, clearProgress } =
    usePlayerStore();

  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [solving, setSolving] = useState(false);
  const [answerInput, setAnswerInput] = useState("");
  const [showHint, setShowHint] = useState(false);

  const activeHuntId = currentProgress?.hunt_id;
  const clues = activeHuntId ? (CLUES_BY_HUNT[activeHuntId] ?? []) : [];
  const currentClueIndex = currentProgress?.current_clue_index ?? 0;
  const currentClue = clues[currentClueIndex];
  const isCompleted = currentProgress?.completed;

  const resetClueState = () => {
    setAnswerInput("");
    setScanned(false);
    setShowHint(false);
  };

  const handleScanBeacon = () => {
    if (scanning) return;
    haptics.scanSubtle();
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      haptics.scanSuccess();
      Alert.alert(
        "Beacon Connected! 📡",
        "Your device detected the checkpoint signal. You can now submit your answer.",
        [{ text: "Great" }],
      );
    }, 1500);
  };

  const handleSubmitAnswer = () => {
    if (!answerInput.trim()) {
      haptics.triggerNotification("error");
      Alert.alert("Error", "Please enter your answer.");
      return;
    }
    setSolving(true);
    setTimeout(() => {
      setSolving(false);
      const isCorrect =
        answerInput.trim().toLowerCase() === currentClue.answer.toLowerCase();
      if (!isCorrect) {
        haptics.triggerNotification("warning");
        Alert.alert(
          "Incorrect Answer ❌",
          "That answer does not match. Check your hint or try again!",
          [{ text: "Try Again" }],
        );
        return;
      }

      resetClueState();
      const isLastClue = currentClueIndex === clues.length - 1;

      if (isLastClue) {
        markCompleted();
        haptics.taskSuccess();
        setTimeout(() => haptics.rewardHeavy(), 300);
        Alert.alert(
          "Congratulations! 🏆",
          "You solved the final clue! Your rewards are being dispatched.",
          [{ text: "Claim Reward!" }],
        );
      } else {
        updateClueIndex(currentClueIndex + 1);
        haptics.taskSuccess();
        Alert.alert(
          "Correct Answer! 🎉",
          "Checkpoint solved. Proceed to the next coordinate!",
          [{ text: "Next Clue" }],
        );
      }
    }, 1000);
  };

  const handleAbandon = () => {
    haptics.triggerNotification("warning");
    Alert.alert(
      "Abandon Hunt?",
      "Your current session progress will be cleared.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Abandon",
          style: "destructive",
          onPress: () => {
            clearProgress();
            resetClueState();
            haptics.triggerImpact("light");
          },
        },
      ],
    );
  };

  if (!activeHuntId) return <EmptyState colors={colors} />;

  if (isCompleted) {
    return (
      <VictoryState
        huntName={HUNT_NAMES[activeHuntId]}
        onClear={clearProgress}
        colors={colors}
        haptics={haptics}
      />
    );
  }

  const progressPercent = `${(currentClueIndex / clues.length) * 100}%`;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View>
              <ThemedCustomText variant="caption" color="primary" weight="700">
                ACTIVE SESSION
              </ThemedCustomText>
              <ThemedCustomText variant="h2" color="text" weight="800">
                {HUNT_NAMES[activeHuntId]}
              </ThemedCustomText>
            </View>
            <ThemedButton
              text="Abandon"
              variant="ghost"
              size="sm"
              onPress={handleAbandon}
            />
          </View>
          <View style={styles.progressTracker}>
            <ThemedCustomText variant="label" color="text" weight="600">
              Progress: Clue {currentClueIndex + 1} of {clues.length}
            </ThemedCustomText>
            <View
              style={[styles.progressBarBg, { backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: colors.primary,
                    width: progressPercent as `${number}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Clue Card */}
        <View
          style={[
            styles.clueCard,
            {
              backgroundColor: colors.border + "25",
              borderColor: colors.border,
            },
          ]}
        >
          <ThemedCustomText variant="h3" color="primary" weight="700">
            📍 Checkpoint Clue
          </ThemedCustomText>
          <ThemedCustomText
            variant="body"
            color="text"
            style={styles.clueQuestion}
          >
            {currentClue?.question}
          </ThemedCustomText>
          {showHint ? (
            <View
              style={[
                styles.hintBox,
                {
                  backgroundColor: colors.warning + "15",
                  borderColor: colors.warning,
                },
              ]}
            >
              <ThemedCustomText variant="caption" color="warning" weight="700">
                💡 HINT:
              </ThemedCustomText>
              <ThemedCustomText variant="label" color="text">
                {currentClue?.hint}
              </ThemedCustomText>
            </View>
          ) : (
            <ThemedButton
              text="Reveal Hint (No Cost)"
              variant="ghost"
              size="sm"
              onPress={() => {
                haptics.triggerSelection();
                setShowHint(true);
              }}
            />
          )}
        </View>

        {/* Action Area */}
        {!scanned ? (
          <View style={styles.actionSection}>
            <ThemedCustomText
              variant="body"
              color="text"
              style={styles.actionGuide}
            >
              Scan the physical location beacon or QR code to verify your
              presence before submitting.
            </ThemedCustomText>
            <ThemedButton
              text={
                scanning
                  ? "Connecting to Beacon..."
                  : "Scan Checkpoint QR / Beacon"
              }
              variant="primary"
              size="lg"
              fullWidth
              loading={scanning}
              onPress={handleScanBeacon}
            />
          </View>
        ) : (
          <View style={styles.actionSection}>
            <ThemedCustomText
              variant="label"
              color="success"
              weight="700"
              style={styles.centered}
            >
              ✓ Beacon Verified! Enter your answer below:
            </ThemedCustomText>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.border + "10",
                },
              ]}
              placeholder="Enter clue answer..."
              placeholderTextColor="#9ca3af"
              value={answerInput}
              onChangeText={setAnswerInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.solveButtonRow}>
              <ThemedButton
                text="Re-Scan"
                variant="ghost"
                size="md"
                onPress={() => {
                  haptics.triggerImpact("light");
                  setScanned(false);
                }}
              />
              <View style={styles.flex}>
                <ThemedButton
                  text={solving ? "Submitting..." : "Submit Solution"}
                  variant="success"
                  size="md"
                  fullWidth
                  loading={solving}
                  disabled={solving}
                  onPress={handleSubmitAnswer}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  centered: { textAlign: "center" },
  contentContainer: { padding: 20, paddingBottom: 40, gap: 24 },
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  emptyBody: { opacity: 0.8, fontSize: 16, lineHeight: 24 },
  header: { gap: 16 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTracker: { gap: 6 },
  progressBarBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 4 },
  clueCard: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 16 },
  clueQuestion: { fontSize: 16, lineHeight: 24 },
  hintBox: { padding: 12, borderRadius: 8, borderWidth: 1, gap: 4 },
  actionSection: { gap: 16 },
  actionGuide: {
    textAlign: "center",
    opacity: 0.7,
    fontSize: 14,
    lineHeight: 20,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  solveButtonRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  victoryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 30,
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  victoryTitle: { fontSize: 32 },
  divider: { width: "80%", height: 1, marginVertical: 8 },
});
