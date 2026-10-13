import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ReportDetail() {
   const { id } = useLocalSearchParams<{ id: string }>();
   return (
      <View style={{ padding: 16 }}>
         <Text>Report {id}</Text>
      </View>
   );
}
