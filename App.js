import React, { useState } from "react";
import { Platform, View, Text, Button, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Asset } from "expo-asset";
import { Linking } from "react-native";

export default function App() {
  const [selectedFile, setSelectedFile] = useState("");
  const [invites, setInvites] = useState([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState("");
  const [blueIndex, setBlueIndex] = useState(0);

  const fileMap = {
    "am.csv": require("./assets/am.csv"),
    "pm.csv": require("./assets/pm.csv"),
  };

  const blueskyInvites = [
    "ربنا يسعدك ويروق بالك ويطمنك على ولادك يا دودو @rosede.bsky.social",
    "ربنا يشفيكي ويوفقك ويريح بالك ويفرح قلبك يا نودا @farawaystar.bsky.social",
    "ربنا يوفقك ويكتبلك الخير ويرزقك مليون دولار وتسافري انتي وجوزك وولادك على خير قريب يا بيرو @abeergaber.bsky.social",
  ];

  const loadCSV = async (filename) => {
    setStatus("...جارٍ التحميل");
    setInvites([]);
    setIndex(0);

    try {
      const asset = Asset.fromModule(fileMap[filename]);
      await asset.downloadAsync(); // مهم عشان يشتغل على الموبايل
      const response = await fetch(asset.uri);
      const text = await response.text();

      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
      setInvites(lines);
      setStatus(`📄 تم تحميل ${lines.length} دعوة من "${filename}"`);
    } catch (error) {
      setStatus("❌ حدث خطأ أثناء تحميل الملف");
      console.error(error);
    }
  };

  const sendNext = () => {
    if (index < invites.length) {
      const text = encodeURIComponent(invites[index]);
      const tweetURL = `https://twitter.com/intent/tweet?text=${text}`;
      if (Platform.OS === "web") {
        window.open(tweetURL, "_blank");
      } else {
        Linking.openURL(tweetURL);
      }
      setIndex(index + 1);
      setStatus(`✅ تم إرسال الدعوة رقم ${index + 1} من ${invites.length}`);
    } else {
      Alert.alert("🎉 خلصنا كل الدعوات!");
    }
  };

  const sendBluesky = async () => {
    if (blueIndex >= blueskyInvites.length) {
      Alert.alert("🎉 خلصنا كل دعوات بلوسكاي!");
      return;
    }

    const text = encodeURIComponent(blueskyInvites[blueIndex]);
    const url = `https://bsky.app/intent/compose?text=${text}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      setBlueIndex(blueIndex + 1);
      setStatus(
        `✅ تم إرسال دعوة بلوسكاي رقم ${blueIndex + 1} من ${
          blueskyInvites.length
        }`
      );
    } else {
      Alert.alert("❗ لا يمكن فتح بلوسكاي");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📂 اختر الملف: AM أو PM</Text>

      <Picker
        selectedValue={selectedFile}
        onValueChange={(itemValue) => {
          setSelectedFile(itemValue);
          if (itemValue) loadCSV(itemValue);
        }}
        style={styles.picker}
      >
        <Picker.Item label="-- اختر ملف الدعوات --" value="" />
        <Picker.Item label="am.csv" value="am.csv" />
        <Picker.Item label="pm.csv" value="pm.csv" />
      </Picker>

      <Button
        title="التالي"
        onPress={sendNext}
        disabled={invites.length === 0}
        color="#1DA1F2"
      />

      <View style={styles.buttonWrapper}>
        <Button
          title="إرسال دعوة بلوسكاي"
          onPress={sendBluesky}
          disabled={blueIndex >= blueskyInvites.length}
          color="#5A78F0"
        />
      </View>

      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "right",
    fontWeight: "bold",
  },
  picker: {
    fontSize: 18,
    marginBottom: 20,
  },
  status: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "right",
    color: "#333",
  },
  buttonWrapper: {
    marginVertical: 20,
  },
});
