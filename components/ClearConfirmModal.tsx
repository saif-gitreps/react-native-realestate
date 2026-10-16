import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, space } from "@/theme";
import { Button, Field } from "@/components/ui";

interface MathProblem {
   question: string;
   answer: number;
}

function generateMathProblem(): MathProblem {
   const isAddition = Math.random() > 0.5;
   if (isAddition) {
      const a = Math.floor(Math.random() * 12) + 3; // 3 to 14
      const b = Math.floor(Math.random() * 12) + 2; // 2 to 13
      return { question: `${a} + ${b}`, answer: a + b };
   } else {
      const a = Math.floor(Math.random() * 15) + 10; // 10 to 24
      const b = Math.floor(Math.random() * 8) + 1; // 1 to 8
      return { question: `${a} - ${b}`, answer: a - b };
   }
}

export function ClearConfirmModal({
   visible,
   onClose,
   onConfirm,
}: {
   visible: boolean;
   onClose: () => void;
   onConfirm: () => void;
}) {
   const [problem, setProblem] = useState<MathProblem>({ question: "", answer: 0 });
   const [userAnswer, setUserAnswer] = useState("");
   const [error, setError] = useState(false);

   // Regenerate problem whenever modal becomes visible
   useEffect(() => {
      if (visible) {
         setProblem(generateMathProblem());
         setUserAnswer("");
         setError(false);
      }
   }, [visible]);

   const isCorrect = userAnswer.trim() !== "" && parseInt(userAnswer.trim(), 10) === problem.answer;

   const handleConfirm = () => {
      if (isCorrect) {
         onConfirm();
      } else {
         setError(true);
      }
   };

   return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
         <Pressable style={styles.backdrop} onPress={onClose}>
            <Pressable style={styles.sheet} onPress={() => {}}>
               <View style={styles.iconRow}>
                  <View style={styles.iconCircle}>
                     <Ionicons name="warning-outline" size={26} color={colors.danger} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                     <Text style={styles.title}>Delete all reports?</Text>
                     <Text style={styles.sub}>
                        This will permanently erase all reports from local storage. This action cannot be undone.
                     </Text>
                  </View>
               </View>

               <View style={styles.challengeBox}>
                  <Text style={styles.challengeLabel}>
                     To confirm, please solve this math problem:
                  </Text>
                  <View style={styles.mathRow}>
                     <Text style={styles.mathEquation}>{problem.question} =</Text>
                     <Field
                        placeholder="?"
                        value={userAnswer}
                        onChangeText={(v) => {
                           setUserAnswer(v);
                           setError(false);
                        }}
                        keyboardType="number-pad"
                        style={styles.mathInput}
                        autoFocus
                     />
                  </View>
                  {error && !isCorrect && (
                     <Text style={styles.errorText}>Incorrect answer. Please try again.</Text>
                  )}
               </View>

               <View style={styles.actions}>
                  <Button
                     label="Cancel"
                     variant="secondary"
                     onPress={onClose}
                     style={{ flex: 1 }}
                  />
                  <Button
                     label="Clear all reports"
                     icon="trash-outline"
                     disabled={!isCorrect}
                     onPress={handleConfirm}
                     style={[
                        { flex: 1.2 },
                        isCorrect && { backgroundColor: colors.danger },
                     ]}
                  />
               </View>
            </Pressable>
         </Pressable>
      </Modal>
   );
}

const styles = StyleSheet.create({
   backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      alignItems: "center",
      justifyContent: "center",
      padding: space.lg,
   },
   sheet: {
      width: "100%",
      maxWidth: 440,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: space.xl,
      gap: space.md,
   },
   iconRow: {
      flexDirection: "row",
      gap: space.md,
      alignItems: "flex-start",
   },
   iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(217, 105, 79, 0.15)",
      alignItems: "center",
      justifyContent: "center",
   },
   title: { color: colors.text, fontSize: 18, fontWeight: "700" },
   sub: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 2 },
   challengeBox: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: space.md,
      gap: space.xs + 2,
   },
   challengeLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
   },
   mathRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.sm,
   },
   mathEquation: {
      color: colors.accent,
      fontSize: 18,
      fontWeight: "800",
   },
   mathInput: {
      width: 70,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "700",
      paddingVertical: 6,
   },
   errorText: {
      color: colors.danger,
      fontSize: 11,
      fontWeight: "500",
   },
   actions: {
      flexDirection: "row",
      gap: space.md,
      marginTop: space.xs,
   },
});

