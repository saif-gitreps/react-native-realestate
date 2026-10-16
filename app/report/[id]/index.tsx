import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, space } from "@/theme";
import { Button, Content, ProjectPill, SectionHeading } from "@/components/ui";
import { getReport, toggleStar } from "@/lib/storage";
import { formatDate } from "@/lib/format";
import { Report } from "@/types/shared";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import * as Clipboard from "expo-clipboard";

export default function ReportDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | undefined>(undefined);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getReport(id ?? "").then((r) => {
        setReport(r);
        setLoading(false);
      });
    }, [id]),
  );

  if (loading) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Loading...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingTitle}>This report doesn't exist</Text>
        <Text style={styles.missingText}>It may have been deleted, or the link is wrong.</Text>
        <Button label="Back to reports" onPress={() => router.replace("/reports")} />
      </View>
    );
  }

  const handleStar = async () => {
    await toggleStar(report.id);
    const updated = await getReport(report.id);
    if (updated) setReport(updated);
  };

  const copyReport = async () => {
    const lines: string[] = [
      `Date: ${report.date}`,
      `Project: ${report.projectName.join(", ")}`,
      "",
      "Key Points:",
      ...report.keyPoints.map((p) => `  • ${p}`),
    ];
    if (report.details.length > 0) {
      lines.push("", "Details:");
      report.details.forEach((d) => lines.push(`  ${d}`));
    }
    await Clipboard.setStringAsync(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: space.lg, paddingBottom: 56 }}>
      <Stack.Screen options={{ title: formatDate(report.date) }} />
      <Content style={{ gap: space.lg }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={styles.dateStarRow}>
              <Text style={styles.dateText}>{formatDate(report.date)}</Text>
              <Pressable onPress={handleStar} hitSlop={8}>
                <Ionicons
                  name={report.isStarred ? "star" : "star-outline"}
                  size={20}
                  color={report.isStarred ? colors.accent : colors.textFaint}
                />
              </Pressable>
            </View>
            <ProjectPill name={report.projectName} />
          </View>
          <View style={styles.headerActions}>
            <Button
              label={copied ? "Copied!" : "Copy"}
              icon={copied ? "checkmark" : "copy-outline"}
              variant="secondary"
              onPress={copyReport}
            />
            <Button
              label="Edit"
              icon="create-outline"
              variant="secondary"
              onPress={() => router.push(`/report/${report.id}/edit`)}
            />
          </View>
        </View>

        {/* Key points */}
        <View style={{ gap: space.sm }}>
          <SectionHeading title="Key points" count={report.keyPoints.length} />
          <View style={styles.pointsBox}>
            {report.keyPoints.map((p, i) => (
              <View key={i} style={styles.pointRow}>
                <View style={styles.dot} />
                <Text style={styles.pointText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Details – collapsible */}
        {report.details.length > 0 && (
          <View style={{ gap: space.sm }}>
            <Pressable
              onPress={() => setDetailsOpen(!detailsOpen)}
              style={styles.detailToggle}
            >
              <SectionHeading title="Details" count={report.details.length} />
              <Ionicons
                name={detailsOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textMuted}
              />
            </Pressable>
            {detailsOpen &&
              report.details.map((d, i) => (
                <View key={i} style={styles.detail}>
                  <Text style={styles.detailText}>{d}</Text>
                </View>
              ))}
          </View>
        )}
      </Content>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", gap: space.md, flexWrap: "wrap" },
  dateStarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  dateText: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.2 },
  headerActions: { flexDirection: "row", gap: space.sm },
  pointsBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md + 2,
    gap: space.sm,
  },
  pointRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginTop: 7 },
  pointText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 22 },
  detailToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detail: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    padding: space.md,
  },
  detailText: { color: colors.text, fontSize: 13.5, lineHeight: 22 },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    padding: space.xl,
  },
  missingTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  missingText: { color: colors.textMuted, fontSize: 12, marginBottom: space.md },
});
