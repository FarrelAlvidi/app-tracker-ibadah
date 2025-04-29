import {
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";

import tw from "twrnc";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

export default function HomeScreen() {
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [list, setList] = useState([]); // FIX: harus array
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const data = [
    { label: "Sunnah", value: "sunnah" },
    { label: "Wajib", value: "wajib" },
  ];

  const [title, setTitle] = useState("");
  const [kategori, setKategori] = useState("");
  const [deadline, setDeadline] = useState("");
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredList = filterCategory.toLowerCase() === 'all' ? list : list.filter(item => item.kategori === filterCategory);

  const addTask = async () => {
    if (
      title.trim() === "" ||
      kategori.trim() === "" ||
      deadline.trim() === ""
    ) {
      Alert.alert("Isi semua data ya!");
      return;
    }
  
    if (kategori.length < 3) {
      Alert.alert("Subject minimal 3 huruf!");
      return;
    }
  
    const isValidDate = (dateString) => !isNaN(Date.parse(dateString));
    if (!isValidDate(deadline)) {
      Alert.alert("Format tanggal tidak valid (cth: 2025-04-30)");
      return;
    }
  
    // <<< NEW TASK HARUS DISINI, setelah validasi
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      kategori: kategori.trim(),
      deadline: deadline.trim(),
      checked: false,
    };
  
    // Tambahkan ke list
    setList([...list, newTask]);
  
    // Reset input form
    setTitle("");
    setKategori("");
    setSelectedKategori(null);
    setDeadline("");
  
    Alert.alert("Pengingat berhasil ditambahkan");
  };
  

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(list));
      console.log("Berhasil simpan data");
    } catch (error) {
      console.log("Gagal simpan", error);
    }
  };

  const loadTasks = async () => {
    try {
      const saved = await AsyncStorage.getItem("tasks");
      if (saved !== null) {
        setList(JSON.parse(saved));
        console.log("Berhasil load data");
      }
    } catch (error) {
      console.log("Gagal load", error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [list]);

  const deleteTask = async (id: string) => {
    Alert.alert("delete", "Yakin mau Hapus?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress(value) {
          const filtered = list.filter((item) => item.id !== id);
          setList(filtered);
          // await AsyncStorage.setItem("tasks", JSON.stringify(filtered)); // langsung simpan
        },
      },
    ]);
  };
  const handleChecked = (id: string) => {
    const updatedList = list.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setList(updatedList);
  };

  const handleEdit = () => {
    Alert.alert("Edit", "Simpan edit?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress(value) {
          const updated = list.map((item) =>
            item.id === editId
              ? { ...item, title: title.trim(), kategori: kategori.trim(), deadline: deadline.trim() }
              : item
          );
          setList(updated);
        
          setTitle('');
          setKategori('');
          setDeadline('');
          setIsEditing(false);
          setEditId(null);
        },
      },
    ]);
    if (title.trim() === "" || kategori.trim() === "" || deadline.trim() === "") {
      Alert.alert("Semua data harus diisi ya saat edit!");
      return;
    }
  
    
  
  };

  const startEdit = (item: any) => {
    setTitle(item.title);
    setKategori(item.kategori);
    setDeadline(item.deadline);
    setIsEditing(true);
    setEditId(item.id)
  }


  return (
    <SafeAreaView>
      <ScrollView>
        <View style={tw`bg-white h-240 p-5`}>
          <View style={tw`flex-row justify-between items-center mb-10`}>
            <Text style={tw`text-xl font-semibold`}>Tracker Ibadah</Text>
            <FontAwesome6 name="circle-user" size={24} />
          </View>
          <View style={tw`gap-y-4`}>
            <View>
              <Text style={tw`font-semibold text-gray-400 mb-1 text-base`}>
                Nama Ibadah
              </Text>
              <TextInput
                placeholder="Shalat"
                value={title}
                onChangeText={setTitle}
                style={tw`rounded-lg w-full bg-gray-100 px-5 font-semibold text-[#C7C8CC] py-3 `}
                placeholderTextColor="#C7C8CC"
              />
            </View>
            <View>
              <Text style={tw`font-semibold text-gray-400 mb-1 text-base`}>
                Kategori Ibadah
              </Text>
              <Dropdown
                style={tw`bg-gray-100 rounded-lg px-5 py-3`}
                placeholderStyle={tw`text-[#C7C8CC] font-semibold`}
                selectedTextStyle={tw`text-[#C7C8CC] font-semibold`}
                data={data}
                maxHeight={300}
                labelField="label"
                valueField="value" // << ini HARUS string, bukan variable
                placeholder="Pilih Kategori"
                value={kategori} // yang disimpan ke state kategori
                onChange={(item) => {
                  setSelectedKategori(item.label); // opsional, kalau mau tetap simpan label
                  setKategori(item.value); // inilah value yang dipakai
                }}
              />
            </View>
            <View>
              <Text style={tw`font-semibold text-gray-400 mb-1 text-base`}>
                Waktu
              </Text>
              <TextInput
                placeholder="30-03-2025"
                style={tw`rounded-lg w-full bg-gray-100 px-5 font-semibold text-[#C7C8CC] py-3 `}
                placeholderTextColor="#C7C8CC"
                value={deadline}
                onChangeText={setDeadline}
              />
            </View>
            <TouchableOpacity
          disabled={title === '' || kategori === '' }
              style={tw`bg-black py-4 mt-2 rounded-xl w-full`}
              onPress={isEditing ? handleEdit : addTask}>
            
              <Text style={tw`text-white text-center font-semibold ${title === '' || kategori === '' ? 'opacity-50' : ''}`}>
              {isEditing ? 'Simpan Pengingat' : 'Tambah Pengingat'}
              </Text>
            </TouchableOpacity>
          </View>
          {list.length > 0 && (
            <>
              <Text style={tw`text-gray-500  mt-10 text-xl font-semibold mb-4`}>Daftar Ibadah</Text>
              <View style={tw`bg-[#0A1A12] rounded-xl p-1 mb-6`}>
                <Picker
                  selectedValue={filterCategory}
                  onValueChange={(itemValue) => setFilterCategory(itemValue)}
                  style={tw`text-white`}
                  dropdownIconColor="#4ADE80"
                >
                  <Picker.Item label="Semua Ibadah" value="all" />
                  <Picker.Item label="Ibadah Wajib" value="wajib" />
                  <Picker.Item label="Ibadah Sunnah" value="sunnah" />
                </Picker>
              </View>
            </>
          )}

          <View >
            {/* Empty State */}
            {list.length === 0 ? (
              <>
                <Text style={tw`text-white text-xl font-semibold mb-4`}>Daftar Ibadah</Text>
                <View style={tw`items-center justify-center py-8`}>
                  <MaterialIcons name="mosque" size={48} color="#C7C8CC" style={tw`mb-4 opacity-50`} />
                  <Text style={tw`text-gray-300 font-semibold text-lg text-center`}>
                    Belum ada ibadah yang ditambahkan
                  </Text>
                  <Text style={tw`text-gray-300 text-base text-center mt-2`}>
                    Mulai tambahkan ibadah Anda
                  </Text>
                </View>
              </>
            ) : (
              <FlatList
                data={filteredList}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                numColumns={2}
                style={tw`mt-4`}
                renderItem={({ item }) => (
                  <View
                    style={tw`rounded-xl p-4 w-[48%] h-34 bg-gray-100 gap-y-1 mr-3 mb-3`}
                  >
                    <Text style={tw`font-semibold text-neutral-600 text-3.6`}>
                      {item.title}
                    </Text>
                    <Text style={tw`font-semibold text-[3.2] text-gray-400`}>
                      {item.kategori}
                    </Text>
                    <Text style={tw`font-semibold text-[3.2] text-red-300`}>
                      {item.deadline}
                    </Text>
                    <View style={tw`flex-row mt-1`}>
                      <TouchableOpacity onPress={() => deleteTask(item.id)}>
                        <MaterialCommunityIcons
                          name="trash-can"
                          size={26}
                          color="red"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => startEdit(item)}>
                        <MaterialCommunityIcons
                          name="square-edit-outline"
                          size={26}
                          color="blue"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={tw`ml-14`}
                        onPress={() => {
                          handleChecked(item.id);
                        }}
                      >
                        {item.checked ? (
                          <MaterialCommunityIcons
                            name="checkbox-marked-circle-outline"
                            color="green"
                            size={28}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name="checkbox-blank-circle-outline"
                            color="white"
                            size={28}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
