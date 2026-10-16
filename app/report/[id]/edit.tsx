import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, space } from "@/theme";
import { Button, Chip, Content, Field, RemovablePill, Toast } from "@/components/ui";
import { StringListEditor } from "@/components/StringListEditor";
import { getReport, updateReport, deleteReport } from "@/lib/storage";
import { projectNames } from "@/lib/dummyReports";
import { isValidISO } from "@/lib/format";
import { Report } from "@/types/shared";

export default function EditReport() {
   const { id } = useLocalSearchParams<{ id: string }>();
   const router = useRouter();

   const [loading, setLoading] = useState(true);
   const [report, setReport] = useState<Report | null>(null);
   const [date, setDate] = useState("");
   const [projects, setProjects] = useState<string[]>([]);
   const [newProject, setNewProject] = useState("");
   const [keyPoints, setKeyPoints] = useState<string[]>([]);
   const [details, setDetails] = useState<string[]>([]);
   const [toast, setToast] = useState<string | null>(null);

   useEffect(() => {
      if (!id) return;
      getReport(id).then((r) => {
         if (r) {
            setReport(r);
            setDate(r.date);
            setProjects(r.projectName);
            setKeyPoints(r.keyPoints);
            setDetails(r.details);
         }
         setLoading(false);
      });
   }, [id]);

   if (loading) {
      return (
         <View style={styles.missing}>
            <Text style={styles.missingTitle}>Loading report...</Text>
         </View>
      );
   }

   if (!report) {
      return (
         <View style={styles.missing}>
            <Text style={styles.missingTitle}>This report doesn&apos;t exist</Text>
            <Button label="Back to reports" onPress={() => router.replace("/reports")} />
         </View>
      );
   }

   const valid = isValidISO(date) && projects.length > 0;

   const handleSave = async () => {
      await updateReport(report.id, {
         date,
         projectName: projects,
         keyPoints: keyPoints.filter((k) => k.trim().length > 0),
         details: details.filter((d) => d.trim().length > 0),
      });
      setToast("Report updated");
      setTimeout(() => router.back(), 500);
   };

   const handleDelete = async () => {
      await deleteReport(report.id);
      router.replace("/reports");
   };

   const toggleProject = (name: string) => {
      if (projects.includes(name)) {
         setProjects(projects.filter((p) => p !== name));
      } else {
         setProjects([...projects, name]);
      }
   };

   const removeProject = (name: string) => {
      setProjects(projects.filter((p) => p !== name));
   };

   const addCustomProject = () => {
      const trimmed = newProject.trim();
      if (trimmed && !projects.includes(trimmed)) {
         setProjects([...projects, trimmed]);
         setNewProject("");
      }
   };

   return (
      <View style={{ flex: 1 }}>
         <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
         >
            <ScrollView
               keyboardShouldPersistTaps="handled"
               contentContainerStyle={{ paddingVertical: space.md, paddingBottom: 56 }}
            >
               <Content style={{ gap: space.md }}>
                  <View style={{ gap: space.xs }}>
                     <Field
                        icon="calendar-outline"
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        autoCapitalize="none"
                     />
                     {date.length === 10 && !isValidISO(date) ? (
                        <Text style={styles.error}>Use valid date in YYYY-MM-DD format</Text>
                     ) : null}
                  </View>

                  <View style={{ gap: space.xs + 2 }}>
                     {/* Selected removable project pills */}
                     {projects.length > 0 && (
                        <View style={styles.pillContainer}>
                           {projects.map((p) => (
                              <RemovablePill
                                 key={p}
                                 label={p}
                                 onRemove={() => removeProject(p)}
                              />
                           ))}
                        </View>
                     )}

                     <View style={styles.chipRow}>
                        {projectNames.map((p) => {
                           const active = projects.includes(p);
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

                     <View style={styles.addProjectRow}>
                        <Field
                           placeholder="Add custom project..."
                           value={newProject}
                           onChangeText={setNewProject}
                           style={{ flex: 1 }}
                        />
                        <Button
                           label="Add"
                           variant="secondary"
                           disabled={!newProject.trim()}
                           onPress={addCustomProject}
                        />
                     </View>
                  </View>

                  <StringListEditor
                     label="Key points"
                     items={keyPoints}
                     onChange={setKeyPoints}
                     placeholder="One short line"
                     addLabel="Add key point"
                  />

                  <StringListEditor
                     label="Details"
                     items={details}
                     onChange={setDetails}
                     placeholder="A longer note about what happened"
                     multiline
                     addLabel="Add detail"
                  />

                  <View style={styles.actions}>
                     <Button label="Cancel" variant="secondary" onPress={() => router.back()} />
                     <Button
                        label="Save changes"
                        icon="checkmark"
                        disabled={!valid}
                        onPress={handleSave}
                        style={{ flex: 1 }}
                     />
                  </View>

                  <Button
                     label="Delete report"
                     icon="trash-outline"
                     variant="ghost"
                     onPress={handleDelete}
                     style={{ alignSelf: "center", marginTop: space.xs }}
                  />
               </Content>
            </ScrollView>
         </KeyboardAvoidingView>
         <Toast message={toast} />
      </View>
   );
}

const styles = StyleSheet.create({
   pillContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
   chipRow: { flexDirection: "row", flexWrap: "wrap", gap: space.xs + 2 },
   addProjectRow: { flexDirection: "row", gap: space.sm, alignItems: "center" },
   actions: { flexDirection: "row", gap: space.md },
   error: { color: colors.danger, fontSize: 11, marginTop: -2 },
   missing: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: space.md,
      padding: space.xl,
   },
   missingTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
});
