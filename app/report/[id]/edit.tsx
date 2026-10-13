import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, space } from "@/theme";
import { Button, Chip, Content, Field } from "@/components/ui";
import { StringListEditor } from "@/components/StringListEditor";
import { getReportById, projectNames } from "@/lib/dummyReports";
import { isValidISO } from "@/lib/format";

export default function EditReport() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const report = getReportById(id);

  const [date, setDate] = useState(report?.date ?? "");
  const [project, setProject] = useState(report?.projectName ?? "");
  const [keyPoints, setKeyPoints] = useState<string[]>(report?.keyPoints ?? []);
  const [details, setDetails] = useState<string[]>(report?.details ?? []);

  if (!report) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingTitle}>This report doesn't exist</Text>
        <Button label="Back to reports" onPress={() => router.replace("/reports")} />
      </View>
    );
  }

  const valid = isValidISO(date) && project.trim().length > 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingVertical: space.xl, paddingBottom: 56 }}
      >
        <Content style={{ gap: space.xl }}>
          <Field
            label="Date"
            icon="calendar-outline"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
          />

          <View style={{ gap: space.sm }}>
            <Field label="Project" icon="folder-outline" value={project} onChangeText={setProject} />
            <View style={styles.chipRow}>
              {projectNames.map((p) => (
                <Chip key={p} label={p} active={project === p} onPress={() => setProject(p)} />
              ))}
            </View>
          </View>

          <StringListEditor
            label="Key points"
            items={keyPoints}
            onChange={setKeyPoints}
            placeholder="One short line"
            addLabel="Add key point"
          />

          <StringListEditor
            label="Details"
            items={details}
            onChange={setDetails}
            placeholder="A longer note about what happened"
            multiline
            addLabel="Add detail"
          />

          <View style={styles.actions}>
            <Button label="Cancel" variant="secondary" onPress={() => router.back()} />
            <Button
              label="Save changes"
              icon="checkmark"
              disabled={!valid}
              onPress={() => router.back()}
              style={{ flex: 1 }}
            />
          </View>
        </Content>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  actions: { flexDirection: "row", gap: space.md },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.md, padding: space.xl },
  missingTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
});
