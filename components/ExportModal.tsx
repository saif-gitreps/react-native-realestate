import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Report } from "@/types/shared";
import { colors, radius, space } from "@/theme";
import { Button, Chip, Field } from "@/components/ui";
import { isValidISO, shiftDays, todayISO, toISO } from "@/lib/format";

export type ExportFormat = "docx" | "md";
type Preset = "7d" | "30d" | "month" | "all";

export function ExportModal({
  visible,
  onClose,
  reports,
  onExport,
}: {
  visible: boolean;
  onClose: () => void;
  reports: Report[];
  onExport: (format: ExportFormat, from: string, to: string, count: number) => void;
}) {
  const [from, setFrom] = useState(shiftDays(-6));
  const [to, setTo] = useState(todayISO());
  const [preset, setPreset] = useState<Preset | null>("7d");

  const applyPreset = (p: Preset) => {
    setPreset(p);
    const today = todayISO();
    if (p === "7d") { setFrom(shiftDays(-6)); setTo(today); }
    if (p === "30d") { setFrom(shiftDays(-29)); setTo(today); }
    if (p === "month") {
      const now = new Date();
      setFrom(toISO(new Date(now.getFullYear(), now.getMonth(), 1)));
      setTo(today);
    }
    if (p === "all") {
      const dates = reports.map((r) => r.date).sort();
      setFrom(dates[0] ?? today);
      setTo(dates[dates.length - 1] ?? today);
    }
  };

  const datesOk = isValidISO(from) && isValidISO(to);
  const orderOk = datesOk && from <= to;
  const count = orderOk ? reports.filter((r) => r.date >= from && r.date <= to).length : 0;
  const canExport = orderOk && count > 0;

  let hint = `${count} ${count === 1 ? "report" : "reports"} in this range`;
  if (!datesOk) hint = "Enter dates as YYYY-MM-DD";
  else if (!orderOk) hint = "The start date must come before the end date";
  else if (count === 0) hint = "No reports in this range. Try a wider period";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Download reports</Text>
          <Text style={styles.sub}>Choose the period to include in the file.</Text>

          <View style={styles.chips}>
            <Chip label="Last 7 days" active={preset === "7d"} onPress={() => applyPreset("7d")} />
            <Chip label="Last 30 days" active={preset === "30d"} onPress={() => applyPreset("30d")} />
            <Chip label="This month" active={preset === "month"} onPress={() => applyPreset("month")} />
            <Chip label="All time" active={preset === "all"} onPress={() => applyPreset("all")} />
          </View>

          <View style={styles.dates}>
            <View style={{ flex: 1 }}>
              <Field
                label="From"
                icon="calendar-outline"
                value={from}
                onChangeText={(v) => { setFrom(v); setPreset(null); }}
                placeholder="YYYY-MM-DD"
                autoCapitalize="none"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="To"
                icon="calendar-outline"
                value={to}
                onChangeText={(v) => { setTo(v); setPreset(null); }}
                placeholder="YYYY-MM-DD"
                autoCapitalize="none"
              />
            </View>
          </View>

          <Text style={[styles.hint, !canExport && { color: colors.danger }]}>{hint}</Text>

          <View style={styles.actions}>
            <Button
              label="Word (.docx)"
              icon="document-text-outline"
              disabled={!canExport}
              onPress={() => onExport("docx", from, to, count)}
              style={{ flex: 1 }}
            />
            <Button
              label="Markdown (.md)"
              icon="logo-markdown"
              variant="secondary"
              disabled={!canExport}
              onPress={() => onExport("md", from, to, count)}
              style={{ flex: 1 }}
            />
          </View>
          <Button label="Cancel" variant="ghost" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: space.lg,
  },
  sheet: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.xl,
    gap: space.lg,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 14, marginTop: -8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  dates: { flexDirection: "row", gap: space.md },
  hint: { color: colors.textMuted, fontSize: 13.5 },
  actions: { flexDirection: "row", gap: space.md, flexWrap: "wrap" },
});
