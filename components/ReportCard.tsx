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
         {/* Top row: date + star */}
         <View style={styles.topRow}>
            <Text style={styles.date}>{formatDate(report.date)}</Text>
            <Pressable onPress={onToggleStar} hitSlop={8}>
               <Ionicons
                  name={report.isStarred ? "star" : "star-outline"}
                  size={20}
                  color={report.isStarred ? colors.accent : colors.textFaint}
               />
            </Pressable>
         </View>

         {/* Project pills */}
         <ProjectPill name={report.projectName} />

         {/* Key points – show all */}
         <View style={styles.points}>
            {report.keyPoints.map((p, i) => (
               <View key={i} style={styles.pointRow}>
                  <View style={styles.dot} />
                  <Text style={styles.pointText}>{p}</Text>
               </View>
            ))}
         </View>

         {/* Details – collapsible */}
         {report.details.length > 0 && (
            <View>
               <Pressable
                  onPress={() => setDetailsOpen(!detailsOpen)}
                  style={styles.detailToggle}
               >
                  <Ionicons
                     name={detailsOpen ? "chevron-up" : "chevron-down"}
                     size={16}
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

         {/* Bottom: meta + copy */}
         <View style={styles.bottomRow}>
            <Text style={styles.meta}>
               {report.keyPoints.length} key points
               {report.details.length > 0 ? `, ${report.details.length} details` : ""}
            </Text>
            <Pressable onPress={copyReport} style={styles.copyBtn} hitSlop={6}>
               <Ionicons
                  name={copied ? "checkmark" : "copy-outline"}
                  size={16}
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
      padding: space.lg,
      gap: space.md,
   },
   topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
   },
   date: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
   },
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
   detailToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
   },
   detailToggleText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "500",
   },
   detailsList: { gap: space.sm, marginTop: space.sm },
   detailItem: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      padding: space.md,
   },
   detailText: { color: colors.text, fontSize: 14, lineHeight: 22 },
   bottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: space.sm,
      marginTop: 2,
   },
   meta: { color: colors.textMuted, fontSize: 12.5 },
   copyBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
   },
   copyText: { color: colors.textMuted, fontSize: 12.5, fontWeight: "500" },
});
