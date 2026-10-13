import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
   return (
      <Tabs>
         <Tabs.Screen
            name="index"
            options={{
               title: "Add",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="add-circle-outline" color={color} size={size} />
               ),
            }}
         />
         <Tabs.Screen
            name="reports"
            options={{
               title: "Reports",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="list-outline" color={color} size={size} />
               ),
            }}
         />
      </Tabs>
   );
}
