import { ComponentProps, ReactNode, useState } from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, space } from "@/theme";
import { parseISO } from "@/lib/format";

export type IconName = ComponentProps<typeof Ionicons>["name"];

const webReset = Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {};

/** Centers content and caps its width so desktop windows don't stretch the layout. */
export function Content({
  children,
  style,
  fill,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  fill?: boolean;
}) {
  return <View style={[styles.content, fill && { flex: 1 }, style]}>{children}</View>;
}

export function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={active ? colors.onAccent : colors.textMuted} />
      ) : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  icon,
  variant = "primary",
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const textColor =
    variant === "primary" ? colors.onAccent : variant === "ghost" ? colors.accent : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.buttonPrimary,
        variant === "secondary" && styles.buttonSecondary,
        disabled && { opacity: 0.4 },
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={16} color={textColor} /> : null}
      <Text
        style={[styles.buttonText, { color: textColor }, variant === "primary" && { fontWeight: "700" }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  disabled,
  active,
  color,
  size = 18,
}: {
  icon: IconName;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.iconButton,
        active && styles.iconButtonActive,
        disabled && { opacity: 0.35 },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={size} color={active ? colors.onAccent : color ?? colors.textMuted} />
    </Pressable>
  );
}

export function ProjectPill({ name }: { name: string | string[] }) {
  const names = Array.isArray(name) ? name : [name];
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {names.map((n, i) => (
        <View key={i} style={styles.pill}>
          <Text style={styles.pillText} numberOfLines={1}>
            {n}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function RemovablePill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <View style={styles.removablePill}>
      <Text style={styles.pillText} numberOfLines={1}>
        {label}
      </Text>
      <Pressable onPress={onRemove} hitSlop={6} style={styles.removePillBtn}>
        <Ionicons name="close-circle" size={15} color={colors.accent} />
      </Pressable>
    </View>
  );
}

export function Field({
  label,
  icon,
  multiline,
  style,
  ...rest
}: TextInputProps & { label?: string; icon?: IconName }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: space.xs }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputFocused,
          multiline && { alignItems: "flex-start" },
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={16}
            color={focused ? colors.accent : colors.textFaint}
            style={multiline ? { marginTop: 12 } : undefined}
          />
        ) : null}
        <TextInput
          {...rest}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.accent}
          style={[styles.input, multiline && styles.inputMultiline, webReset, style]}
        />
      </View>
    </View>
  );
}

const STUB = {
  sm: { w: 44, day: 16, mon: 9 },
  md: { w: 56, day: 22, mon: 10 },
  lg: { w: 76, day: 34, mon: 12 },
} as const;

/** A small calendar block for each report's date. */
export function DateStub({ iso, size = "md" }: { iso: string; size?: keyof typeof STUB }) {
  const s = STUB[size];
  const d = parseISO(iso);
  return (
    <View style={[styles.stub, { width: s.w }]}>
      <Text style={[styles.stubDay, { fontSize: s.day, lineHeight: s.day + 4 }]}>{d.getDate()}</Text>
      <Text style={[styles.stubMonth, { fontSize: s.mon }]}>
        {d.toLocaleDateString("en-GB", { month: "short" })}
      </Text>
      {size === "lg" ? (
        <Text style={[styles.stubMonth, { fontSize: s.mon }]}>{d.getFullYear()}</Text>
      ) : null}
    </View>
  );
}

export function SectionHeading({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined ? <Text style={styles.sectionCount}>{count}</Text> : null}
    </View>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.toastWrap} pointerEvents="none">
      <View style={styles.toast}>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    paddingHorizontal: space.lg,
  },
  pressed: { opacity: 0.8 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textMuted, fontSize: 11, fontWeight: "500" },
  chipTextActive: { color: colors.onAccent, fontWeight: "600" },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonSecondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: { fontSize: 13, fontWeight: "600" },

  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButtonActive: { backgroundColor: colors.accent, borderColor: colors.accent },

  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  removablePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingLeft: 9,
    paddingRight: 6,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: "rgba(225, 173, 1, 0.3)",
  },
  removePillBtn: {
    padding: 1,
  },
  pillText: { color: colors.accent, fontSize: 10.5, fontWeight: "600" },

  label: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
  },
  inputFocused: { borderColor: colors.accent },
  input: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 10 },
  inputMultiline: { minHeight: 200, textAlignVertical: "top", lineHeight: 22 },

  stub: {
    alignItems: "center",
    paddingVertical: 7,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderTopWidth: 3,
    borderTopColor: colors.accent,
  },
  stubDay: { color: colors.accent, fontWeight: "800" },
  stubMonth: { color: colors.textMuted, fontWeight: "500" },

  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 7 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  sectionCount: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: "hidden",
  },

  toastWrap: { position: "absolute", left: 0, right: 0, bottom: 24, alignItems: "center" },
  toast: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    maxWidth: "90%",
  },
  toastText: { color: colors.onAccent, fontWeight: "600", fontSize: 12 },
});
