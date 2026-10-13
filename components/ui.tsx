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
      {icon ? <Ionicons name={icon} size={18} color={textColor} /> : null}
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
}: {
  icon: IconName;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  color?: string;
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
      <Ionicons name={icon} size={20} color={active ? colors.onAccent : color ?? colors.textMuted} />
    </Pressable>
  );
}

export function ProjectPill({ name }: { name: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText} numberOfLines={1}>
        {name}
      </Text>
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
    <View style={{ gap: space.sm }}>
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
            size={18}
            color={focused ? colors.accent : colors.textFaint}
            style={multiline ? { marginTop: 14 } : undefined}
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
  sm: { w: 44, day: 18, mon: 11 },
  md: { w: 56, day: 24, mon: 12 },
  lg: { w: 76, day: 36, mon: 14 },
} as const;

/** The memorable element: a small tear-off calendar block for each report's date. */
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
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: colors.onAccent, fontWeight: "600" },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: radius.md,
  },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonSecondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: { fontSize: 15, fontWeight: "600" },

  iconButton: {
    width: 40,
    height: 40,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  pillText: { color: colors.accent, fontSize: 12.5, fontWeight: "600" },

  label: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  inputFocused: { borderColor: colors.accent },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 13 },
  inputMultiline: { minHeight: 280, textAlignVertical: "top", lineHeight: 24 },

  stub: {
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderTopWidth: 3,
    borderTopColor: colors.accent,
  },
  stubDay: { color: colors.accent, fontWeight: "800" },
  stubMonth: { color: colors.textMuted, fontWeight: "500" },

  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  sectionCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: "hidden",
  },

  toastWrap: { position: "absolute", left: 0, right: 0, bottom: 24, alignItems: "center" },
  toast: {
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
    maxWidth: "90%",
  },
  toastText: { color: colors.onAccent, fontWeight: "600", fontSize: 14 },
});
