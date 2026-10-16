import { ExportFormat, ExportModal } from "@/components/ExportModal";
import { ReportCard } from "@/components/ReportCard";
import { Button, Chip, Content, Field, Toast } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getAllReports, toggleStar } from "@/lib/storage";
import { colors, radius, space } from "@/theme";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Report } from "../../types/shared";

const PAGE_SIZE = 12;
type Sort = "newest" | "oldest" | "project";

export default function Reports() {
   const router = useRouter();
   const { width } = useWindowDimensions();
   const listRef = useRef<FlatList<Report>>(null);

   const [reports, setReports] = useState<Report[]>([]);
   const [query, setQuery] = useState("");
   const [sort, setSort] = useState<Sort>("newest");
   const [page, setPage] = useState(0);
   const [exportOpen, setExportOpen] = useState(false);
   const [toast, setToast] = useState<string | null>(null);

   // Reload reports every time the tab gains focus
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

   const sorted = useMemo(() => {
      const q = query.trim().toLowerCase();
      const filtered = reports.filter(
         (r) =>
            !q ||
            r.projectName.some((p) => p.toLowerCase().includes(q)) ||
            r.date.includes(q) ||
            formatDate(r.date).toLowerCase().includes(q),
      );
      return [...filtered].sort((a, b) => {
         if (sort === "oldest") return a.date.localeCompare(b.date);
         if (sort === "project") {
            return (
               a.projectName[0]?.localeCompare(b.projectName[0] ?? "") ||
               b.date.localeCompare(a.date)
            );
         }
         return b.date.localeCompare(a.date);
      });
   }, [query, sort, reports]);

   const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
   const safePage = Math.min(page, pages - 1);
   const pageItems = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

   const changePage = (p: number) => {
      setPage(p);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
   };

   const open = (id: string) => router.push(`/report/${id}`);

   const handleToggleStar = async (id: string) => {
      await toggleStar(id);
      const updated = await getAllReports();
      setReports(updated);
   };

   const itemStyle = { width: `${100 / cols}%` as `${number}%`, padding: 6 };

   return (
      <View style={{ flex: 1 }}>
         <Content fill style={{ paddingTop: space.lg }}>
            <View style={styles.header}>
               <View style={{ flex: 1 }}>
                  <Text style={styles.title}>Your reports</Text>
                  <Text style={styles.sub}>
                     {sorted.length === reports.length
                        ? `${reports.length} reports`
                        : `${sorted.length} of ${reports.length} reports`}
                  </Text>
               </View>
               <Button
                  label="Download"
                  icon="download-outline"
                  variant="secondary"
                  onPress={() => setExportOpen(true)}
               />
            </View>

            <Field
               icon="search"
               value={query}
               onChangeText={(v) => {
                  setQuery(v);
                  setPage(0);
               }}
               placeholder="Search by date or project"
               autoCapitalize="none"
            />

            <View style={styles.controls}>
               <View style={styles.sortRow}>
                  <Chip
                     label="Newest"
                     active={sort === "newest"}
                     onPress={() => {
                        setSort("newest");
                        setPage(0);
                     }}
                  />
                  <Chip
                     label="Oldest"
                     active={sort === "oldest"}
                     onPress={() => {
                        setSort("oldest");
                        setPage(0);
                     }}
                  />
                  <Chip
                     label="Project"
                     active={sort === "project"}
                     onPress={() => {
                        setSort("project");
                        setPage(0);
                     }}
                  />
               </View>
            </View>

            <FlatList
               ref={listRef}
               key={`cards-${cols}`}
               data={pageItems}
               keyExtractor={(r) => r.id}
               numColumns={cols}
               keyboardShouldPersistTaps="handled"
               showsVerticalScrollIndicator={false}
               style={{ marginHorizontal: -6 }}
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
                     <Text style={styles.emptyTitle}>
                        {query ? `No reports match "${query}"` : "No reports yet"}
                     </Text>
                     <Text style={styles.emptyText}>
                        {query
                           ? "Try a project name or a date like 2026-10-12."
                           : "Add your first report from the Add tab."}
                     </Text>
                     {query ? (
                        <Button
                           label="Clear search"
                           variant="secondary"
                           onPress={() => setQuery("")}
                        />
                     ) : null}
                  </View>
               }
               ListFooterComponent={
                  <Pager
                     page={safePage}
                     pages={pages}
                     total={sorted.length}
                     onChange={changePage}
                  />
               }
            />
         </Content>

         <ExportModal
            visible={exportOpen}
            onClose={() => setExportOpen(false)}
            reports={reports}
            onExport={(format: ExportFormat, from, to, count) => {
               setExportOpen(false);
               showToast(
                  `Download preview: ${count} reports from ${from} to ${to} as ${
                     format === "docx" ? "Word" : "Markdown"
                  }`,
               );
            }}
         />
         <Toast message={toast} />
      </View>
   );
}

function Pager({
   page,
   pages,
   total,
   onChange,
}: {
   page: number;
   pages: number;
   total: number;
   onChange: (p: number) => void;
}) {
   if (pages <= 1) return <View style={{ height: space.xl }} />;
   const start = page * PAGE_SIZE + 1;
   const end = Math.min(total, (page + 1) * PAGE_SIZE);
   return (
      <View style={styles.pager}>
         <Text style={styles.pagerInfo}>
            Showing {start} to {end} of {total}
         </Text>
         <View style={styles.pagerButtons}>
            <Button
               label="‹"
               variant="secondary"
               disabled={page === 0}
               onPress={() => onChange(page - 1)}
            />
            <Text style={styles.pageText}>
               Page {page + 1} of {pages}
            </Text>
            <Button
               label="›"
               variant="secondary"
               disabled={page >= pages - 1}
               onPress={() => onChange(page + 1)}
            />
         </View>
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
   title: { color: colors.text, fontSize: 26, fontWeight: "800", letterSpacing: -0.3 },
   sub: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
   controls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: space.sm,
      marginVertical: space.md,
   },
   sortRow: { flexDirection: "row", gap: space.sm, flexWrap: "wrap" },
   empty: {
      alignItems: "center",
      gap: space.sm,
      padding: space.xxl,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      borderRadius: radius.lg,
      margin: 6,
   },
   emptyTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
   },
   emptyText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: "center",
      marginBottom: space.sm,
   },
   pager: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: space.md,
      paddingHorizontal: 6,
      paddingVertical: space.xl,
   },
   pagerInfo: { color: colors.textMuted, fontSize: 13.5 },
   pagerButtons: { flexDirection: "row", alignItems: "center", gap: space.md },
   pageText: { color: colors.text, fontSize: 14, fontWeight: "600" },
});
