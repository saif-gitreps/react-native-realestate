import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, space } from "@/theme";
import { Button, Content, DateStub, ProjectPill, SectionHeading } from "@/components/ui";
import { getReportById } from "@/lib/dummyReports";
import { formatDate } from "@/lib/format";

export default function ReportDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const report = getReportById(id);

  if (!report) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingTitle}>This report doesn't exist</Text>
        <Text style={styles.missingText}>It may have been deleted, or the link is wrong.</Text>
        <Button label="Back to reports" onPress={() => router.replace("/reports")} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: space.xl, paddingBottom: 56 }}>
      <Stack.Screen options={{ title: formatDate(report.date) }} />
      <Content style={{ gap: space.xl }}>
        <View style={styles.header}>
          <DateStub iso={report.date} size="lg" />
          <View style={{ flex: 1, gap: 8 }}>
            <ProjectPill name={report.projectName} />
            <Text style={styles.title}>{formatDate(report.date)}</Text>
          </View>
          <Button
            label="Edit"
            icon="create-outline"
            variant="secondary"
            onPress={() => router.push(`/report/${report.id}/edit`)}
          />
        </View>

        <View style={{ gap: space.md }}>
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

        <View style={{ gap: space.md }}>
          <SectionHeading title="Details" count={report.details.length} />
          {report.details.map((d, i) => (
            <View key={i} style={styles.detail}>
              <Text style={styles.detailText}>{d}</Text>
            </View>
          ))}
        </View>
      </Content>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: space.lg, flexWrap: "wrap" },
  title: { color: colors.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.2 },
  pointsBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.md,
  },
  pointRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent, marginTop: 9 },
  pointText: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 25 },
  detail: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    padding: space.lg,
  },
  detailText: { color: colors.text, fontSize: 15.5, lineHeight: 25 },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    padding: space.xl,
  },
  missingTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  missingText: { color: colors.textMuted, fontSize: 14, marginBottom: space.md },
});
