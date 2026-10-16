/**
 * Local-storage CRUD for reports using AsyncStorage.
 * Will be replaced with Firebase later.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { dummyReports } from "@/lib/dummyReports";
import { Report } from "@/types/shared";

const STORAGE_KEY = "work_reports";

/** Get all reports from local storage. Seeds with dummyReports on first run. */
export async function getAllReports(): Promise<Report[]> {
   const raw = await AsyncStorage.getItem(STORAGE_KEY);
   if (!raw) {
      // First run: seed with default dummyReports
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dummyReports));
      return dummyReports;
   }
   try {
      return JSON.parse(raw) as Report[];
   } catch {
      return dummyReports;
   }
}

/** Save full report list to storage (replaces everything). */
async function saveAll(reports: Report[]): Promise<void> {
   await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

/** Create a new report. */
export async function createReport(report: Report): Promise<void> {
   const reports = await getAllReports();
   reports.unshift(report); // newest first
   await saveAll(reports);
}

/** Update an existing report by id. */
export async function updateReport(id: string, patch: Partial<Omit<Report, "id">>): Promise<void> {
   const reports = await getAllReports();
   const idx = reports.findIndex((r) => r.id === id);
   if (idx === -1) return;
   reports[idx] = { ...reports[idx], ...patch };
   await saveAll(reports);
}

/** Delete a report by id. */
export async function deleteReport(id: string): Promise<void> {
   const reports = await getAllReports();
   await saveAll(reports.filter((r) => r.id !== id));
}

/** Toggle the isStarred flag for a report. Returns the new value. */
export async function toggleStar(id: string): Promise<boolean> {
   const reports = await getAllReports();
   const report = reports.find((r) => r.id === id);
   if (!report) return false;
   report.isStarred = !report.isStarred;
   await saveAll(reports);
   return report.isStarred;
}

/** Get a single report by id. */
export async function getReport(id: string): Promise<Report | undefined> {
   const reports = await getAllReports();
   return reports.find((r) => r.id === id);
}

/** Generate a unique ID. */
export function generateId(): string {
   return `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
