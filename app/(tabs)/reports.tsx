import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Report } from "@/types/report";
import { colors, radius, space } from "@/theme";
import { Button, Chip, Content, Field, IconButton, Toast } from "@/components/ui";
import { ReportCard } from "@/components/ReportCard";
import { ReportRow } from "@/components/ReportRow";
import { ExportFormat, ExportModal } from "@/components/ExportModal";
import { dummyReports } from "@/lib/dummyReports";
import { formatDate } from "@/lib/format";

const PAGE_SIZE = 12;
type Sort = "newest" | "oldest" | "project";
type ViewMode = "cards" | "list";

export default function Reports() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Report>>(null);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [mode, setMode] = useState<ViewMode>("cards");
  const [page, setPage] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const cols = width >= 1000 ? 3 : width >= 640 ? 2 : 1;
  const numColumns = mode === "cards" ? cols : 1;

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = dummyReports.filter(
      (r) =>
        !q ||
        r.projectName.toLowerCase().includes(q) ||
        r.date.includes(q) ||
        formatDate(r.date).toLowerCase().includes(q)
    );
    return [...filtered].sort((a, b) => {
      if (sort === "oldest") return a.date.localeCompare(b.date);
      if (sort === "project") {
        return a.projectName.localeCompare(b.projectName) || b.date.localeCompare(a.date);
      }
      return b.date.localeCompare(a.date);
    });
  }, [query, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const pageItems = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const changePage = (p: number) => {
    setPage(p);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const open = (id: string) => router.push(`/report/${id}`);

  const itemStyle =
    mode === "cards"
      ? { width: `${100 / numColumns}%` as `${number}%`, padding: 6 }
      : { width: "100%" as const, paddingHorizontal: 6, paddingVertical: 3 };

  return (
    <View style={{ flex: 1 }}>
      <Content fill style={{ paddingTop: space.lg }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Your reports</Text>
            <Text style={styles.sub}>
              {sorted.length === dummyReports.length
                ? `${dummyReports.length} reports`
                : `${sorted.length} of ${dummyReports.length} reports`}
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
            <Chip label="Newest" active={sort === "newest"} onPress={() => { setSort("newest"); setPage(0); }} />
            <Chip label="Oldest" active={sort === "oldest"} onPress={() => { setSort("oldest"); setPage(0); }} />
            <Chip label="Project" active={sort === "project"} onPress={() => { setSort("project"); setPage(0); }} />
          </View>
          <View style={styles.toggle}>
            <IconButton icon="grid-outline" active={mode === "cards"} onPress={() => setMode("cards")} />
            <IconButton icon="list-outline" active={mode === "list"} onPress={() => setMode("list")} />
          </View>
        </View>

        <FlatList
          ref={listRef}
          key={`${mode}-${numColumns}`}
          data={pageItems}
          keyExtractor={(r) => r.id}
          numColumns={numColumns}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ marginHorizontal: -6 }}
          renderItem={({ item }) => (
            <View style={itemStyle}>
              {mode === "cards" ? (
                <ReportCard report={item} onPress={() => open(item.id)} />
              ) : (
                <ReportRow report={item} onPress={() => open(item.id)} />
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No reports match "{query}"</Text>
              <Text style={styles.emptyText}>Try a project name or a date like 2026-10-12.</Text>
              <Button label="Clear search" variant="secondary" onPress={() => setQuery("")} />
            </View>
          }
          ListFooterComponent={
            <Pager page={safePage} pages={pages} total={sorted.length} onChange={changePage} />
          }
        />
      </Content>

      <ExportModal
        visible={exportOpen}
        onClose={() => setExportOpen(false)}
        reports={dummyReports}
        onExport={(format: ExportFormat, from, to, count) => {
          setExportOpen(false);
          setToast(
            `Download preview: ${count} reports from ${from} to ${to} as ${
              format === "docx" ? "Word" : "Markdown"
            }`
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
        <IconButton icon="chevron-back" disabled={page === 0} onPress={() => onChange(page - 1)} />
        <Text style={styles.pageText}>
          Page {page + 1} of {pages}
        </Text>
        <IconButton
          icon="chevron-forward"
          disabled={page >= pages - 1}
          onPress={() => onChange(page + 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: space.md },
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
  toggle: { flexDirection: "row", gap: space.sm },
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
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: "700", textAlign: "center" },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginBottom: space.sm },
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
