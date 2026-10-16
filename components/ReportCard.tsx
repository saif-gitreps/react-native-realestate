import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Report } from "@/types/shared";
import { colors, radius, space } from "@/theme";
import { ProjectPill } from "@/components/ui";
import { formatDate } from "@/lib/format";
import * as Clipboard from "expo-clipboard";

export function ReportCard({
   report,
   onPress,
   onToggleStar,
}: {
   report: Report;
   onPress?: () => void;
   onToggleStar?: () => void;
}) {
   const [detailsOpen, setDetailsOpen] = useState(false);
   const [copied, setCopied] = useState(false);

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
      <Pressable
         onPress={onPress}
         style={({ pressed }) => [styles.card, pressed && onPress && { opacity: 0.85 }]}
      >
         {/* Top row: single line simple date + star */}
         <View style={styles.topRow}>
            <Text style={styles.date}>{formatDate(report.date)}</Text>
            <Pressable onPress={onToggleStar} hitSlop={8}>
               <Ionicons
                  name={report.isStarred ? "star" : "star-outline"}
                  size={18}
                  color={report.isStarred ? colors.accent : colors.textFaint}
               />
            </Pressable>
         </View>

         {/* Project pills */}
         <ProjectPill name={report.projectName} />

         {/* Key points – view all */}
         <View style={styles.points}>
            {report.keyPoints.map((p, i) => (
               <View key={i} style={styles.pointRow}>
                  <View style={styles.dot} />
                  <Text style={styles.pointText}>{p}</Text>
               </View>
            ))}
         </View>

         {/* Details – hidable list */}
         {report.details.length > 0 && (
            <View>
               <Pressable
                  onPress={() => setDetailsOpen(!detailsOpen)}
                  style={styles.detailToggle}
               >
                  <Ionicons
                     name={detailsOpen ? "chevron-up" : "chevron-down"}
                     size={14}
                     color={colors.textMuted}
                  />
                  <Text style={styles.detailToggleText}>
                     {detailsOpen ? "Hide" : "Show"} details ({report.details.length})
                  </Text>
               </Pressable>
               {detailsOpen && (
                  <View style={styles.detailsList}>
                     {report.details.map((d, i) => (
                        <View key={i} style={styles.detailItem}>
                           <Text style={styles.detailText}>{d}</Text>
                        </View>
                     ))}
                  </View>
               )}
            </View>
         )}

         {/* Bottom row: meta + copy button */}
         <View style={styles.bottomRow}>
            <Text style={styles.meta}>
               {report.keyPoints.length} key points
               {report.details.length > 0 ? `, ${report.details.length} details` : ""}
            </Text>
            <Pressable onPress={copyReport} style={styles.copyBtn} hitSlop={6}>
               <Ionicons
                  name={copied ? "checkmark" : "copy-outline"}
                  size={14}
                  color={copied ? colors.accent : colors.textMuted}
               />
               <Text style={[styles.copyText, copied && { color: colors.accent }]}>
                  {copied ? "Copied" : "Copy"}
               </Text>
            </Pressable>
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
      padding: space.md + 2,
      gap: space.sm + 2,
   },
   topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
   },
   date: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
   },
   points: { gap: 6 },
   pointRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
   dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.accent,
      marginTop: 6,
   },
   pointText: { flex: 1, color: colors.text, fontSize: 12.5, lineHeight: 18 },
   detailToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 3,
   },
   detailToggleText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "500",
   },
   detailsList: { gap: space.xs + 2, marginTop: space.xs },
   detailItem: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      padding: space.sm,
   },
   detailText: { color: colors.text, fontSize: 12, lineHeight: 18 },
   bottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: space.xs + 2,
      marginTop: 2,
   },
   meta: { color: colors.textMuted, fontSize: 10.5 },
   copyBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 3,
      paddingHorizontal: 7,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
   },
   copyText: { color: colors.textMuted, fontSize: 10.5, fontWeight: "500" },
});
