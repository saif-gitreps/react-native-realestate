import { Button, Chip, Content, Field, Toast } from "@/components/ui";
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

export default function AddReport() {
   const [dateOverride, setDateOverride] = useState("");
   const [selectedProject, setSelectedProject] = useState("");
   const [customProject, setCustomProject] = useState("");
   const [text, setText] = useState("");
   const [manualDetails, setManualDetails] = useState<string[]>([]);
   const [toast, setToast] = useState<string | null>(null);
   const [showDatePicker, setShowDatePicker] = useState(false);
   const [showProjectPicker, setShowProjectPicker] = useState(false);

   useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 2200);
      return () => clearTimeout(t);
   }, [toast]);

   // Run the parsing algo on the raw text
   const parsed = useMemo(() => parseReport(text), [text]);

   // Date resolution: manual date picker override has precedence over algo detection
   const resolvedDate = dateOverride.trim() || parsed.detectedDate || todayISO();
   const dateSource = dateOverride.trim()
      ? "picker"
      : parsed.detectedDate
        ? "algo detected"
        : "default";

   // Project resolution: dropdown/manual selection has precedence over algo detection
   const chosenProject = (customProject.trim() || selectedProject.trim());
   const resolvedProjects: string[] = chosenProject
      ? [chosenProject]
      : parsed.detectedProjects.length > 0
        ? parsed.detectedProjects
        : ["General"];

   const projectSource = chosenProject
      ? "selected"
      : parsed.detectedProjects.length > 0
        ? "algo detected"
        : "default";

   // Combine algo details with manual details
   const allDetails = [...parsed.details, ...manualDetails.filter((d) => d.trim())];

   const hasContent = text.trim().length > 0 || manualDetails.some((d) => d.trim());
   const valid = isValidISO(resolvedDate) && hasContent;

   const save = async () => {
      await createReport({
         id: generateId(),
         date: resolvedDate,
         projectName: resolvedProjects,
         rawInput: text || undefined,
         keyPoints: parsed.keyPoints.length > 0 ? parsed.keyPoints : ["[others]" + text.trim()],
         details: allDetails,
         isStarred: false,
      });
      setToast("Report saved");
      setText("");
      setDateOverride("");
      setSelectedProject("");
      setCustomProject("");
      setManualDetails([]);
   };

   return (
      <View style={{ flex: 1 }}>
         <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
         >
            <ScrollView
               keyboardShouldPersistTaps="handled"
               contentContainerStyle={{ paddingVertical: space.xl }}
            >
               <Content style={{ gap: space.xl }}>
                  {/* Date section */}
                  <View style={{ gap: space.sm }}>
                     <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>Date</Text>
                        <Text style={styles.sourceTag}>({dateSource}: {resolvedDate})</Text>
                     </View>

                     <Pressable
                        style={styles.pickerToggle}
                        onPress={() => setShowDatePicker(!showDatePicker)}
                     >
                        <Ionicons name="calendar-outline" size={18} color={colors.accent} />
                        <Text style={styles.pickerToggleText}>
                           {dateOverride ? `Custom: ${dateOverride}` : `Current: ${resolvedDate}`}
                        </Text>
                        <Ionicons
                           name={showDatePicker ? "chevron-up" : "chevron-down"}
                           size={16}
                           color={colors.textMuted}
                        />
                     </Pressable>

                     {showDatePicker && (
                        <View style={styles.expandedBox}>
                           <Field
                              label="Date override (precedence over algo)"
                              icon="calendar-outline"
                              value={dateOverride}
                              onChangeText={setDateOverride}
                              placeholder="YYYY-MM-DD"
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
                                 That date doesn&apos;t exist. Use the format YYYY-MM-DD.
                              </Text>
                           ) : null}
                        </View>
                     )}
                  </View>

                  {/* Project selection section (precedence over algo) */}
                  <View style={{ gap: space.sm }}>
                     <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>Project</Text>
                        <Text style={styles.sourceTag}>
                           ({projectSource}: {resolvedProjects.join(", ")})
                        </Text>
                     </View>

                     <Pressable
                        style={styles.pickerToggle}
                        onPress={() => setShowProjectPicker(!showProjectPicker)}
                     >
                        <Ionicons name="folder-outline" size={18} color={colors.accent} />
                        <Text style={styles.pickerToggleText}>
                           {chosenProject ? chosenProject : `Detected: ${resolvedProjects.join(", ")}`}
                        </Text>
                        <Ionicons
                           name={showProjectPicker ? "chevron-up" : "chevron-down"}
                           size={16}
                           color={colors.textMuted}
                        />
                     </Pressable>

                     {showProjectPicker && (
                        <View style={styles.expandedBox}>
                           <Text style={styles.subtext}>
                              Selected project has precedence over detected project name from text.
                           </Text>
                           <View style={styles.chipRow}>
                              {projectNames.map((p) => (
                                 <Chip
                                    key={p}
                                    label={p}
                                    active={selectedProject === p && !customProject}
                                    onPress={() => {
                                       if (selectedProject === p && !customProject) {
                                          setSelectedProject("");
                                       } else {
                                          setSelectedProject(p);
                                          setCustomProject("");
                                       }
                                    }}
                                 />
                              ))}
                           </View>
                           <Field
                              label="Or custom project name"
                              icon="create-outline"
                              value={customProject}
                              onChangeText={(v) => {
                                 setCustomProject(v);
                                 if (v) setSelectedProject("");
                              }}
                              placeholder="e.g. My Custom Project"
                           />
                           {chosenProject ? (
                              <Button
                                 label="Clear project selection (use algo detection)"
                                 variant="ghost"
                                 onPress={() => {
                                    setSelectedProject("");
                                    setCustomProject("");
                                 }}
                                 style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}
                              />
                           ) : null}
                        </View>
                     )}
                  </View>

                  {/* Main text input */}
                  <View style={{ gap: space.sm }}>
                     <Field
                        label="Today's work"
                        multiline
                        value={text}
                        onChangeText={setText}
                        placeholder={
                           "Daily work report\nDate: 12/10/2026\nAdded exe file to the startup folder for uii school\nfixed an issue in daily attendance related to white space..."
                        }
                     />
                     <Text style={styles.count}>{text.length} characters</Text>
                  </View>

                  {/* Additional details list input */}
                  <StringListEditor
                     label="Additional details list"
                     items={manualDetails}
                     onChange={setManualDetails}
                     placeholder="A detailed point about what happened..."
                     multiline
                     addLabel="Add detail item"
                  />

                  {/* Live preview */}
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
                        <View style={{ gap: 6 }}>
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
                           Type in &quot;Today&apos;s work&quot; above to see detected key points.
                        </Text>
                     )}

                     {allDetails.length > 0 && (
                        <View style={{ gap: 6 }}>
                           <Text style={styles.previewLabel}>
                              Details ({allDetails.length})
                           </Text>
                           {allDetails.map((d, i) => (
                              <Text key={i} style={styles.previewDetailText} numberOfLines={3}>
                                 {d}
                              </Text>
                           ))}
                        </View>
                     )}
                  </View>

                  {/* Actions */}
                  <View style={styles.actions}>
                     <Button
                        label="Clear"
                        variant="secondary"
                        disabled={!text && !dateOverride && !chosenProject && manualDetails.length === 0}
                        onPress={() => {
                           setText("");
                           setDateOverride("");
                           setSelectedProject("");
                           setCustomProject("");
                           setManualDetails([]);
                        }}
                     />
                     <Button
                        label="Save report"
                        icon="checkmark"
                        disabled={!valid}
                        onPress={save}
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
   sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
   },
   sectionLabel: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
   sourceTag: { color: colors.textFaint, fontSize: 12 },
   pickerToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
   },
   pickerToggleText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "500",
      flex: 1,
   },
   expandedBox: {
      gap: space.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: space.md,
   },
   subtext: { color: colors.textMuted, fontSize: 12.5 },
   chipRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
   error: { color: colors.danger, fontSize: 13 },
   count: { color: colors.textFaint, fontSize: 12.5, alignSelf: "flex-end" },
   preview: {
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: space.lg,
      gap: space.md,
   },
   previewTitle: { color: colors.textMuted, fontSize: 14, fontWeight: "700" },
   previewEmpty: { color: colors.textFaint, fontSize: 13, lineHeight: 20 },
   previewRow: { flexDirection: "row", gap: space.sm, alignItems: "center", flexWrap: "wrap" },
   previewLabel: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
   previewValue: { color: colors.text, fontSize: 13.5 },
   previewSource: { color: colors.accent, fontSize: 12 },
   previewPointRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
   previewDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.accent,
      marginTop: 7,
   },
   previewPointText: { flex: 1, color: colors.text, fontSize: 13.5, lineHeight: 20 },
   previewDetailText: {
      color: colors.textFaint,
      fontSize: 13,
      lineHeight: 19,
      paddingLeft: 8,
      borderLeftWidth: 2,
      borderLeftColor: colors.accent,
   },
   actions: { flexDirection: "row", gap: space.md },
});
