import { StyleSheet, TextInput, View } from "react-native";
import { Platform, Text } from "react-native";
import { colors, radius, space } from "@/theme";
import { Button, IconButton } from "@/components/ui";

const webReset = Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {};

export function StringListEditor({
  label,
  items,
  onChange,
  placeholder,
  multiline,
  addLabel,
}: {
  label?: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
  addLabel: string;
}) {
  const update = (i: number, v: string) => onChange(items.map((x, idx) => (idx === i ? v : x)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <View style={{ gap: space.xs + 2 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {items.map((item, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            value={item}
            onChangeText={(v) => update(i, v)}
            placeholder={placeholder}
            placeholderTextColor={colors.textFaint}
            selectionColor={colors.accent}
            multiline={multiline}
            style={[styles.input, multiline && styles.inputMultiline, webReset]}
          />
          <IconButton icon="trash-outline" color={colors.danger} onPress={() => remove(i)} />
        </View>
      ))}
      <Button
        label={addLabel}
        icon="add"
        variant="ghost"
        onPress={() => onChange([...items, ""])}
        style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
  row: { flexDirection: "row", gap: space.sm, alignItems: "flex-start" },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 13.5,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  inputMultiline: { minHeight: 90, textAlignVertical: "top", lineHeight: 20 },
});
