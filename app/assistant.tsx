import { images } from "@/constants/images";
import { sendToAssistant } from "@/lib/assistant";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const ORANGE = "#FF8F3A";
const DARK = "#3B2D2A";
// .env:  EXPO_PUBLIC_SUPPORT_PHONE=+254712345678
const SUPPORT_PHONE = process.env.EXPO_PUBLIC_SUPPORT_PHONE ?? "";

const QUICK_QUESTIONS = [
  "What's popular today?",
  "Where's my order?",
  "How do I pay?",
  "Something spicy?",
  "Cheap eats under Ksh 500?",
];

type Msg = { id: string; role: "user" | "assistant"; text: string; error?: boolean };

// The assistant writes menu items as [[item:ID|Name]]. Turn them into plain names plus tap buttons.
const ITEM_TOKEN = /\[\[item:([^|\]]+)\|([^\]]+)\]\]/g;
const parseReply = (text: string) => {
  const items: { id: string; name: string }[] = [];
  const clean = text.replace(ITEM_TOKEN, (_m, id, name) => {
    if (!items.some((i) => i.id === id)) items.push({ id, name });
    return name;
  });
  return { clean, items };
};

const AssistantScreen = () => {
  const insets = useSafeAreaInsets();
  const listRef = React.useRef<FlatList>(null);
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const scrollDown = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || sending) return;

    const userMsg: Msg = { id: `u${Date.now()}`, role: "user", text: t };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setSending(true);
    scrollDown();

    try {
      // Error bubbles are not sent back to the model.
      const turns = history.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.text }));
      const reply = await sendToAssistant(turns);
      setMessages((cur) => [...cur, { id: `a${Date.now()}`, role: "assistant", text: reply }]);
    } catch (e: any) {
      setMessages((cur) => [
        ...cur,
        { id: `e${Date.now()}`, role: "assistant", text: e?.message || "Something went wrong. Please try again.", error: true },
      ]);
    } finally {
      setSending(false);
      scrollDown();
    }
  };

  const talkToHuman = () => {
    if (!SUPPORT_PHONE) {
      Alert.alert("Support", "Support contact details aren't set up yet.");
      return;
    }
    const digits = SUPPORT_PHONE.replace(/[^\d]/g, "");
    Alert.alert("Talk to a person", "How would you like to reach support?", [
      { text: "Call", onPress: () => Linking.openURL(`tel:${SUPPORT_PHONE}`) },
      { text: "WhatsApp", onPress: () => Linking.openURL(`https://wa.me/${digits}`) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const renderMessage = ({ item }: { item: Msg }) => {
    if (item.role === "user") {
      return (
        <View style={[styles.row, { justifyContent: "flex-end" }]}>
          <View style={[styles.bubble, styles.userBubble]}>
            <Text style={styles.userText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    const { clean, items } = parseReply(item.text);
    return (
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={14} color="#fff" />
        </View>
        <View style={{ flexShrink: 1, gap: 8 }}>
          <View style={[styles.bubble, styles.botBubble, item.error && styles.errorBubble]}>
            <Text style={[styles.botText, item.error && { color: "#a93226" }]}>{clean}</Text>
            {item.error && (
              <Pressable onPress={talkToHuman} style={{ marginTop: 8 }}>
                <Text style={styles.humanLink}>Talk to a person</Text>
              </Pressable>
            )}
          </View>
          {items.length > 0 && (
            <View style={styles.chipsWrap}>
              {items.map((it) => (
                <Pressable
                  key={it.id}
                  onPress={() => router.push({ pathname: "/product/[id]", params: { id: it.id } } as any)}
                  style={styles.itemChip}
                >
                  <Text style={styles.itemChipText} numberOfLines={1}>
                    {it.name} ›
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const header = (
    <View style={styles.intro}>
      <View style={styles.introIcon}>
        <Ionicons name="sparkles" size={26} color="#fff" />
      </View>
      <Text style={styles.introTitle}>Hi, I'm Plug</Text>
      <Text style={styles.introText}>
        UniPlug's AI assistant, here 24/7. Ask me about the menu, your order or payments. I can make mistakes, so
        check prices in your cart before paying.
      </Text>
      {messages.length === 0 && (
        <View style={styles.quickWrap}>
          {QUICK_QUESTIONS.map((q) => (
            <Pressable key={q} onPress={() => send(q)} style={styles.quick}>
              <Text style={styles.quickText}>{q}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.page} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Image source={images.arrowBack} style={styles.back} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.title}>Plug · Assistant</Text>
        <TouchableOpacity onPress={talkToHuman} hitSlop={12}>
          <Ionicons name="headset-outline" size={24} color={DARK} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          ListHeaderComponent={header}
          ListFooterComponent={
            sending ? (
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Ionicons name="sparkles" size={14} color="#fff" />
                </View>
                <View style={[styles.bubble, styles.botBubble, styles.typing]}>
                  <ActivityIndicator size="small" color={ORANGE} />
                  <Text style={styles.typingText}>Plug is typing...</Text>
                </View>
              </View>
            ) : null
          }
          contentContainerStyle={styles.list}
          onContentSizeChange={scrollDown}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything..."
            placeholderTextColor="#999"
            style={styles.input}
            maxLength={500}
            multiline
            editable={!sending}
            onSubmitEditing={() => send(input)}
          />
          <Pressable
            onPress={() => send(input)}
            disabled={sending || !input.trim()}
            style={[styles.sendBtn, (sending || !input.trim()) && { opacity: 0.4 }]}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f6f6f6" },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 },
  back: { width: 22, height: 22 },
  title: { fontSize: 17, fontWeight: "800", color: "#111" },

  list: { padding: 16, paddingBottom: 8, gap: 12 },

  intro: { alignItems: "center", gap: 8, paddingVertical: 12 },
  introIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center" },
  introTitle: { fontSize: 20, fontWeight: "800", color: "#111" },
  introText: { fontSize: 13, lineHeight: 19, color: "#777", textAlign: "center", paddingHorizontal: 12 },
  quickWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 10 },
  quick: { paddingHorizontal: 14, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: ORANGE, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  quickText: { color: "#a95a14", fontWeight: "700", fontSize: 13 },

  row: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  avatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "86%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  userBubble: { backgroundColor: ORANGE, borderBottomRightRadius: 4 },
  userText: { color: "#fff", fontSize: 15, lineHeight: 21 },
  botBubble: { backgroundColor: "#fff", borderBottomLeftRadius: 4 },
  botText: { color: "#222", fontSize: 15, lineHeight: 21 },
  errorBubble: { backgroundColor: "#fdecea" },
  humanLink: { color: "#a93226", fontWeight: "800", fontSize: 13 },
  typing: { flexDirection: "row", alignItems: "center", gap: 8 },
  typingText: { color: "#888", fontSize: 13 },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  itemChip: { paddingHorizontal: 12, height: 34, borderRadius: 17, backgroundColor: "#FF8F3A22", justifyContent: "center", maxWidth: 240 },
  itemChipText: { color: "#a95a14", fontWeight: "800", fontSize: 13 },

  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 12, paddingTop: 10, backgroundColor: "#fff", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#ddd" },
  input: { flex: 1, maxHeight: 110, minHeight: 44, borderRadius: 22, backgroundColor: "#f3f3f3", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: "#111" },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center" },
});

export default AssistantScreen;
