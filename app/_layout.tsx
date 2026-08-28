import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

type Rooms = {
   id: number;
   name?: string;
   descriptions?: string;
};

export default function RootLayout() {
   const rooms: Rooms[] = [
      { id: 1, name: "2 bed", descriptions: "nice room" },
      { id: 2, name: "3 bed", descriptions: "nice room 2" },
   ];
   return (
      <SafeAreaView className="bg-white">
         <View
            style={{
               padding: 16,
               margin: 30,
               backgroundColor: "#bebebe",
               flex: 1,
            }}
         >
            <Text>Hello</Text>

            <TextInput
               placeholder="hello"
               style={{ padding: 14, marginTop: 5, borderColor: "#c28f8f" }}
            ></TextInput>

            <TouchableOpacity
               style={{ backgroundColor: "#1e1a1a", borderRadius: 8, padding: 10 }}
            >
               <Text style={{ color: "#fff" }}>Search</Text>
            </TouchableOpacity>

            <FlatList
               data={rooms}
               keyExtractor={(room) => String(room.id)}
               renderItem={({ item }) => (
                  <View
                     style={{ flexDirection: "row", padding: 10, margin: 10, gap: 10 }}
                  >
                     <Text>{item.id}</Text>
                     <Text>{item.name}</Text>
                     <Text>{item.descriptions}</Text>
                  </View>
               )}
            />
         </View>
      </SafeAreaView>
   );
}
