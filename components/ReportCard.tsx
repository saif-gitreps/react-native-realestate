import { Pressable, StyleSheet, Text, View } from "react-native";
import { Report } from "@/types/report";
import { colors, radius, space } from "@/theme";
import { DateStub, ProjectPill } from "@/components/ui";

export function ReportCard({ report, onPress }: { report: Report; onPress: () => void }) {
  const shown = report.keyPoints.slice(0, 3);
  const extra = report.keyPoints.length - shown.length;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.top}>
        <DateStub iso={report.date} />
        <View style={styles.topText}>
          <ProjectPill name={report.projectName} />
          <Text style={styles.meta}>
            {report.keyPoints.length} key points, {report.details.length} details
          </Text>
        </View>
      </View>

      <View style={styles.points}>
        {shown.map((p, i) => (
          <View key={i} style={styles.pointRow}>
            <View style={styles.dot} />
            <Text style={styles.pointText} numberOfLines={2}>
              {p}
            </Text>
          </View>
        ))}
        {extra > 0 ? <Text style={styles.more}>and {extra} more</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.md,
  },
  top: { flexDirection: "row", gap: space.md, alignItems: "center" },
  topText: { flex: 1, gap: 6 },
  meta: { color: colors.textMuted, fontSize: 13 },
  points: { gap: 8 },
  pointRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 8,
  },
  pointText: { flex: 1, color: colors.text, fontSize: 14.5, lineHeight: 21 },
  more: { color: colors.textMuted, fontSize: 13, marginLeft: 16 },
});
