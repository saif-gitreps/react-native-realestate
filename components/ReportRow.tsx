import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Report } from "@/types/shared";
import { colors, radius, space } from "@/theme";
import { DateStub } from "@/components/ui";

export function ReportRow({ report, onPress }: { report: Report; onPress: () => void }) {
  const projectLabel = Array.isArray(report.projectName)
    ? report.projectName.join(", ")
    : (report.projectName as unknown as string);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
    >
      <DateStub iso={report.date} size="sm" />
      <View style={styles.text}>
        <Text style={styles.project} numberOfLines={1}>
          {projectLabel}
        </Text>
        <Text style={styles.summary} numberOfLines={1}>
          {report.keyPoints[0]}
        </Text>
      </View>
      <Text style={styles.count}>{report.keyPoints.length}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
  },
  text: { flex: 1, gap: 2 },
  project: { color: colors.text, fontSize: 15, fontWeight: "600" },
  summary: { color: colors.textMuted, fontSize: 13.5 },
  count: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
});
