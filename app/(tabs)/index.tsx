import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, space } from "@/theme";
import { Button, Chip, Content, Field, Toast } from "@/components/ui";
import { projectNames } from "@/lib/dummyReports";
import { isValidISO, shiftDays, todayISO } from "@/lib/format";

export default function AddReport() {
  const [date, setDate] = useState(todayISO());
  const [project, setProject] = useState("");
  const [text, setText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const valid = isValidISO(date) && project.trim().length > 0 && text.trim().length > 0;

  const save = () => {
    setToast("Report saved");
    setText("");
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingVertical: space.xl }}
        >
          <Content style={{ gap: space.xl }}>
            <View style={{ gap: 4 }}>
              <Text style={styles.heading}>What did you work on?</Text>
              <Text style={styles.sub}>
                Write it the way it comes to mind. Key points and details are sorted out when you save.
              </Text>
            </View>

            <View style={{ gap: space.sm }}>
              <Field
                label="Date"
                icon="calendar-outline"
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                autoCapitalize="none"
              />
              <View style={styles.chipRow}>
                <Chip label="Today" active={date === todayISO()} onPress={() => setDate(todayISO())} />
                <Chip
                  label="Yesterday"
                  active={date === shiftDays(-1)}
                  onPress={() => setDate(shiftDays(-1))}
                />
              </View>
              {date.length === 10 && !isValidISO(date) ? (
                <Text style={styles.error}>That date doesn't exist. Use the format YYYY-MM-DD.</Text>
              ) : null}
            </View>

            <View style={{ gap: space.sm }}>
              <Field
                label="Project"
                icon="folder-outline"
                value={project}
                onChangeText={setProject}
                placeholder="Which project was this for?"
              />
              <View style={styles.chipRow}>
                {projectNames.map((p) => (
                  <Chip key={p} label={p} active={project === p} onPress={() => setProject(p)} />
                ))}
              </View>
            </View>

            <View style={{ gap: space.sm }}>
              <Field
                label="Today's work"
                multiline
                value={text}
                onChangeText={setText}
                placeholder="Fixed the rounding bug in checkout, reviewed two pull requests, and started the user table migration..."
              />
              <Text style={styles.count}>{text.length} characters</Text>
            </View>

            <View style={styles.preview}>
              <Text style={styles.previewTitle}>Preview</Text>
              <Text style={styles.previewText}>
                Once you start writing, the key points and details we find will show up here before
                you save.
              </Text>
            </View>

            <View style={styles.actions}>
              <Button
                label="Clear"
                variant="secondary"
                disabled={!text && !project}
                onPress={() => {
                  setText("");
                  setProject("");
                }}
              />
              <Button label="Save report" icon="checkmark" disabled={!valid} onPress={save} style={{ flex: 1 }} />
            </View>
          </Content>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast message={toast} />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.text, fontSize: 26, fontWeight: "800", letterSpacing: -0.3 },
  sub: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  error: { color: colors.danger, fontSize: 13 },
  count: { color: colors.textFaint, fontSize: 12.5, alignSelf: "flex-end" },
  preview: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: 6,
  },
  previewTitle: { color: colors.textMuted, fontSize: 14, fontWeight: "700" },
  previewText: { color: colors.textFaint, fontSize: 14, lineHeight: 21 },
  actions: { flexDirection: "row", gap: space.md },
});
