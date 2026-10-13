import { Stack } from "expo-router";

export default function RootLayout() {
   return (
      <Stack>
         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
         <Stack.Screen name="report/[id]/index" options={{ title: "Report" }} />
         <Stack.Screen name="report/[id]/edit" options={{ title: "Edit report" }} />
      </Stack>
   );
}
