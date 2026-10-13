import { dummyReports } from "@/lib/dummyReports";
import { useRouter } from "expo-router";
import { FlatList, Pressable, Text } from "react-native";

export default function Reports() {
   const router = useRouter();
   return (
      <FlatList
         data={dummyReports}
         keyExtractor={(r) => r.id}
         renderItem={({ item }) => (
            <Pressable
               style={{ padding: 16 }}
               onPress={() => router.push(`/report/${item.id}`)}
            >
               <Text>
                  {item.date} · {item.projectName}
               </Text>
            </Pressable>
         )}
      />
   );
}
