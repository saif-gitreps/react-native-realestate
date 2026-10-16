import { ExportFormat, ExportModal } from "@/components/ExportModal";
import { ReportCard } from "@/components/ReportCard";
import { Content, IconButton, Toast } from "@/components/ui";
import { getAllReports, toggleStar } from "@/lib/storage";
import { colors, radius, space } from "@/theme";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Report } from "../../types/shared";

export default function Starred() {
   const router = useRouter();
   const { width } = useWindowDimensions();
   const listRef = useRef<FlatList<Report>>(null);

   const [reports, setReports] = useState<Report[]>([]);
   const [exportOpen, setExportOpen] = useState(false);
   const [toast, setToast] = useState<string | null>(null);

   useFocusEffect(
      useCallback(() => {
         getAllReports().then(setReports);
      }, []),
   );

   const showToast = (msg: string) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2600);
   };

   const cols = width >= 1000 ? 3 : width >= 640 ? 2 : 1;

   // Only starred reports, sorted by date (newest first)
   const starred = useMemo(
      () =>
         reports
            .filter((r) => r.isStarred)
            .sort((a, b) => b.date.localeCompare(a.date)),
      [reports],
   );

   const open = (id: string) => router.push(`/report/${id}`);

   const handleToggleStar = async (id: string) => {
      await toggleStar(id);
      const updated = await getAllReports();
      setReports(updated);
   };

   const itemStyle = { width: `${100 / cols}%` as `${number}%`, padding: 10 };

   return (
      <View style={{ flex: 1 }}>
         <Content fill style={{ paddingTop: space.md }}>
            <View style={styles.header}>
               <View style={{ flex: 1 }}>
                  <Text style={styles.title}>Starred</Text>
                  <Text style={styles.sub}>
                     {starred.length} {starred.length === 1 ? "report" : "reports"}
                  </Text>
               </View>
               <IconButton
                  icon="download-outline"
                  disabled={starred.length === 0}
                  onPress={() => setExportOpen(true)}
               />
            </View>

            <FlatList
               ref={listRef}
               key={`starred-${cols}`}
               data={starred}
               keyExtractor={(r) => r.id}
               numColumns={cols}
               keyboardShouldPersistTaps="handled"
               showsVerticalScrollIndicator={false}
               style={{ marginHorizontal: -10 }}
               contentContainerStyle={{ paddingBottom: 90 }}
               renderItem={({ item }) => (
                  <View style={itemStyle}>
                     <ReportCard
                        report={item}
                        onPress={() => open(item.id)}
                        onToggleStar={() => handleToggleStar(item.id)}
                     />
                  </View>
               )}
               ListEmptyComponent={
                  <View style={styles.empty}>
                     <Text style={styles.emptyTitle}>No starred reports</Text>
                     <Text style={styles.emptyText}>
                        Tap the star icon on any report to add it here.
                     </Text>
                  </View>
               }
            />
         </Content>

         {/* Floating Add button at the bottom */}
         <Pressable
            style={styles.fab}
            onPress={() => router.push("/")}
            accessibilityLabel="Add report"
         >
            <Ionicons name="add" size={26} color={colors.onAccent} />
         </Pressable>

         <ExportModal
            visible={exportOpen}
            onClose={() => setExportOpen(false)}
            reports={starred}
            onExport={(format: ExportFormat, from, to, count) => {
               setExportOpen(false);
               showToast(
                  `Download preview: ${count} starred reports from ${from} to ${to} as ${
                     format === "docx" ? "Word" : "Markdown"
                  }`,
               );
            }}
         />
         <Toast message={toast} />
      </View>
   );
}

const styles = StyleSheet.create({
   header: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.md,
      marginBottom: space.md,
   },
   title: { color: colors.text, fontSize: 24, fontWeight: "800", letterSpacing: -0.3 },
   sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
   empty: {
      alignItems: "center",
      gap: space.sm,
      padding: space.xxl,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      borderRadius: radius.lg,
      margin: 10,
   },
   emptyTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "700",
      textAlign: "center",
   },
   emptyText: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: "center",
   },
   fab: {
      position: "absolute",
      right: 20,
      bottom: 24,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 6,
   },
});
