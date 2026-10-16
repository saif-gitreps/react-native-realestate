import { Button, Chip, Content, Field, RemovablePill, Toast } from "@/components/ui";
import { StringListEditor } from "@/components/StringListEditor";
import { parseReport } from "@/lib/reportParser";
import { createReport, generateId } from "@/lib/storage";
import { projectNames } from "@/lib/dummyReports";
import { isValidISO, shiftDays, todayISO } from "@/lib/format";
import { colors, radius, space } from "@/theme";
import { useEffect, useMemo, useState } from "react";
import {
   KeyboardAvoidingView,
   Platform,
   Pressable,
   ScrollView,
   StyleSheet,
   Text,
   View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AddReport() {
   const router = useRouter();
   const [dateOverride, setDateOverride] = useState("");
   const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
   const [customProjectInput, setCustomProjectInput] = useState("");
   const [text, setText] = useState("");
   const [manualDetails, setManualDetails] = useState<string[]>([]);
   const [toast, setToast] = useState<string | null>(null);
   const [showDatePicker, setShowDatePicker] = useState(false);
   const [showProjectDropdown, setShowProjectDropdown] = useState(false);

   useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 2400);
      return () => clearTimeout(t);
   }, [toast]);

   // Run the parsing algo on the raw text
   const parsed = useMemo(() => parseReport(text), [text]);

   // Date resolution: manual date picker override has precedence over algo detection
   const resolvedDate = dateOverride.trim() || parsed.detectedDate || todayISO();
   const dateSource = dateOverride.trim()
      ? "picker"
      : parsed.detectedDate
        ? "detected"
        : "default";

   // Project resolution: dropdown/manual selection has precedence over algo detection
   const hasManualProjects = selectedProjects.length > 0;
   const resolvedProjects: string[] = hasManualProjects
      ? selectedProjects
      : parsed.detectedProjects.length > 0
        ? parsed.detectedProjects
        : ["General"];

   const projectSource = hasManualProjects
      ? "selected"
      : parsed.detectedProjects.length > 0
        ? "detected"
        : "default";

   // Combine algo details with manual details
   const allDetails = [...parsed.details, ...manualDetails.filter((d) => d.trim())];

   const hasContent = text.trim().length > 0 || manualDetails.some((d) => d.trim());
   const valid = isValidISO(resolvedDate) && hasContent;

   const toggleProject = (name: string) => {
      if (selectedProjects.includes(name)) {
         setSelectedProjects(selectedProjects.filter((p) => p !== name));
      } else {
         setSelectedProjects([...selectedProjects, name]);
      }
   };

   const addCustomProject = () => {
      const trimmed = customProjectInput.trim();
      if (trimmed && !selectedProjects.includes(trimmed)) {
         setSelectedProjects([...selectedProjects, trimmed]);
         setCustomProjectInput("");
      }
   };

   const removeProject = (name: string) => {
      setSelectedProjects(selectedProjects.filter((p) => p !== name));
   };

   const handleAddReport = async () => {
      if (!hasContent) {
         setToast("Please enter your work report text first");
         return;
      }
      if (!isValidISO(resolvedDate)) {
         setToast("Please enter a valid date (YYYY-MM-DD)");
         return;
      }

      await createReport({
         id: generateId(),
         date: resolvedDate,
         projectName: resolvedProjects,
         rawInput: text || undefined,
         keyPoints: parsed.keyPoints.length > 0 ? parsed.keyPoints : ["[others]" + text.trim()],
         details: allDetails,
         isStarred: false,
      });

      setToast("Report added successfully!");
      setText("");
      setDateOverride("");
      setSelectedProjects([]);
      setCustomProjectInput("");
      setManualDetails([]);

      // Navigate to reports tab so user immediately sees their newly added card
      setTimeout(() => {
         router.push("/reports");
      }, 400);
   };

   return (
      <View style={{ flex: 1 }}>
         <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
         >
            <ScrollView
               keyboardShouldPersistTaps="handled"
               contentContainerStyle={{ paddingVertical: space.md, paddingBottom: 140 }}
            >
               <Content style={{ gap: space.md }}>
                  {/* Date section */}
                  <View style={{ gap: space.xs + 2 }}>
                     <Pressable
                        style={styles.pickerToggle}
                        onPress={() => setShowDatePicker(!showDatePicker)}
                     >
                        <Ionicons name="calendar-outline" size={16} color={colors.accent} />
                        <Text style={styles.pickerToggleText}>
                           {dateOverride ? `Date: ${dateOverride}` : `Date: ${resolvedDate}`}
                        </Text>
                        <Text style={styles.sourceTag}>({dateSource})</Text>
                        <Ionicons
                           name={showDatePicker ? "chevron-up" : "chevron-down"}
                           size={14}
                           color={colors.textMuted}
                        />
                     </Pressable>

                     {showDatePicker && (
                        <View style={styles.expandedBox}>
                           <Field
                              icon="calendar-outline"
                              value={dateOverride}
                              onChangeText={setDateOverride}
                              placeholder="YYYY-MM-DD (overrides algo date)"
                              autoCapitalize="none"
                           />
                           <View style={styles.chipRow}>
                              <Chip
                                 label="Today"
                                 active={dateOverride === todayISO()}
                                 onPress={() => setDateOverride(todayISO())}
                              />
                              <Chip
                                 label="Yesterday"
                                 active={dateOverride === shiftDays(-1)}
                                 onPress={() => setDateOverride(shiftDays(-1))}
                              />
                              {dateOverride ? (
                                 <Chip
                                    label="Clear (use algo)"
                                    onPress={() => setDateOverride("")}
                                 />
                              ) : null}
                           </View>
                           {dateOverride.length === 10 && !isValidISO(dateOverride) ? (
                              <Text style={styles.error}>
                                 Invalid date. Use YYYY-MM-DD.
                              </Text>
                           ) : null}
                        </View>
                     )}
                  </View>

                  {/* Project selection section (Multi-select dropdown with removable pills) */}
                  <View style={{ gap: space.xs + 2 }}>
                     <Pressable
                        style={styles.pickerToggle}
                        onPress={() => setShowProjectDropdown(!showProjectDropdown)}
                     >
                        <Ionicons name="folder-outline" size={16} color={colors.accent} />
                        <Text style={styles.pickerToggleText}>
                           {selectedProjects.length > 0
                              ? `${selectedProjects.length} project(s) selected`
                              : `Projects: ${resolvedProjects.join(", ")}`}
                        </Text>
                        <Text style={styles.sourceTag}>({projectSource})</Text>
                        <Ionicons
                           name={showProjectDropdown ? "chevron-up" : "chevron-down"}
                           size={14}
                           color={colors.textMuted}
                        />
                     </Pressable>

                     {/* Selected removable pills */}
                     {selectedProjects.length > 0 && (
                        <View style={styles.pillContainer}>
                           {selectedProjects.map((p) => (
                              <RemovablePill
                                 key={p}
                                 label={p}
                                 onRemove={() => removeProject(p)}
                              />
                           ))}
                        </View>
                     )}

                     {showProjectDropdown && (
                        <View style={styles.expandedBox}>
                           <Text style={styles.subtext}>
                              Select projects (selected projects take precedence over detected ones):
                           </Text>
                           <View style={styles.chipRow}>
                              {projectNames.map((p) => {
                                 const active = selectedProjects.includes(p);
                                 return (
                                    <Chip
                                       key={p}
                                       label={p}
                                       active={active}
                                       icon={active ? "checkmark" : undefined}
                                       onPress={() => toggleProject(p)}
                                    />
                                 );
                              })}
                           </View>
                           <View style={styles.customInputRow}>
                              <Field
                                 placeholder="Type custom project name..."
                                 value={customProjectInput}
                                 onChangeText={setCustomProjectInput}
                                 style={{ flex: 1 }}
                              />
                              <Button
                                 label="Add"
                                 variant="secondary"
                                 disabled={!customProjectInput.trim()}
                                 onPress={addCustomProject}
                              />
                           </View>
                           {selectedProjects.length > 0 && (
                              <Button
                                 label="Clear all selected projects (use algo detection)"
                                 variant="ghost"
                                 onPress={() => setSelectedProjects([])}
                                 style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}
                              />
                           )}
                        </View>
                     )}
                  </View>

                  {/* Main text input (no label) */}
                  <View style={{ gap: space.xs }}>
                     <Field
                        multiline
                        value={text}
                        onChangeText={setText}
                        placeholder={
                           "Daily work report\nDate: 12/10/2026\nAdded exe file to startup folder for uii school\nFixed issue in daily attendance related to whitespace..."
                        }
                     />
                     <Text style={styles.count}>{text.length} characters</Text>
                  </View>

                  {/* Additional details list input (no label) */}
                  <StringListEditor
                     items={manualDetails}
                     onChange={setManualDetails}
                     placeholder="A detailed point about what happened..."
                     multiline
                     addLabel="Add detail item"
                  />

                  {/* Live parse preview */}
                  <View style={styles.preview}>
                     <Text style={styles.previewTitle}>Live Parse Preview</Text>

                     <View style={styles.previewRow}>
                        <Text style={styles.previewLabel}>Date:</Text>
                        <Text style={styles.previewValue}>
                           {resolvedDate} <Text style={styles.previewSource}>({dateSource})</Text>
                        </Text>
                     </View>

                     <View style={styles.previewRow}>
                        <Text style={styles.previewLabel}>Projects:</Text>
                        <Text style={styles.previewValue}>
                           {resolvedProjects.join(", ")}{" "}
                           <Text style={styles.previewSource}>({projectSource})</Text>
                        </Text>
                     </View>

                     {parsed.keyPoints.length > 0 ? (
                        <View style={{ gap: 5 }}>
                           <Text style={styles.previewLabel}>
                              Key points ({parsed.keyPoints.length})
                           </Text>
                           {parsed.keyPoints.map((p, i) => (
                              <View key={i} style={styles.previewPointRow}>
                                 <View style={styles.previewDot} />
                                 <Text style={styles.previewPointText}>{p}</Text>
                              </View>
                           ))}
                        </View>
                     ) : (
                        <Text style={styles.previewEmpty}>
                           Type in the box above to see auto-detected key points.
                        </Text>
                     )}

                     {allDetails.length > 0 && (
                        <View style={{ gap: 5 }}>
                           <Text style={styles.previewLabel}>
                              Details ({allDetails.length})
                           </Text>
                           {allDetails.map((d, i) => (
                              <Text key={i} style={styles.previewDetailText} numberOfLines={2}>
                                 {d}
                              </Text>
                           ))}
                        </View>
                     )}
                  </View>

                  {/* Actions: Add report and Clear buttons */}
                  <View style={styles.actions}>
                     <Button
                        label="Clear"
                        variant="secondary"
                        disabled={!text && !dateOverride && selectedProjects.length === 0 && manualDetails.length === 0}
                        onPress={() => {
                           setText("");
                           setDateOverride("");
                           setSelectedProjects([]);
                           setCustomProjectInput("");
                           setManualDetails([]);
                        }}
                     />
                     <Button
                        label="Add report"
                        icon="add-circle"
                        onPress={handleAddReport}
                        style={{ flex: 1 }}
                     />
                  </View>
               </Content>
            </ScrollView>
         </KeyboardAvoidingView>
         <Toast message={toast} />
      </View>
   );
}

const styles = StyleSheet.create({
   pickerToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: 12,
      paddingVertical: 10,
   },
   pickerToggleText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "500",
      flex: 1,
   },
   sourceTag: { color: colors.textFaint, fontSize: 10.5, marginRight: 4 },
   pillContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      paddingVertical: 2,
   },
   expandedBox: {
      gap: space.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: space.sm + 2,
   },
   subtext: { color: colors.textMuted, fontSize: 11 },
   chipRow: { flexDirection: "row", flexWrap: "wrap", gap: space.xs + 2 },
   customInputRow: { flexDirection: "row", gap: space.sm, alignItems: "center" },
   error: { color: colors.danger, fontSize: 11 },
   count: { color: colors.textFaint, fontSize: 10.5, alignSelf: "flex-end" },
   preview: {
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: space.md,
      gap: space.sm,
   },
   previewTitle: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
   previewEmpty: { color: colors.textFaint, fontSize: 11.5, lineHeight: 18 },
   previewRow: { flexDirection: "row", gap: space.sm, alignItems: "center", flexWrap: "wrap" },
   previewLabel: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
   previewValue: { color: colors.text, fontSize: 11.5 },
   previewSource: { color: colors.accent, fontSize: 10.5 },
   previewPointRow: { flexDirection: "row", gap: 7, alignItems: "flex-start" },
   previewDot: {
      width: 4.5,
      height: 4.5,
      borderRadius: 2.5,
      backgroundColor: colors.accent,
      marginTop: 6,
   },
   previewPointText: { flex: 1, color: colors.text, fontSize: 11.5, lineHeight: 17 },
   previewDetailText: {
      color: colors.textFaint,
      fontSize: 11,
      lineHeight: 17,
      paddingLeft: 7,
      borderLeftWidth: 2,
      borderLeftColor: colors.accent,
   },
   actions: {
      flexDirection: "row",
      gap: space.md,
      marginTop: space.xs,
   },
});
