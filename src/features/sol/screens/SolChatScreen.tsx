import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

import { SolOrb } from '../../../components/motion/SolOrb';
import { AnimatedStrands } from '../../../components/motion/AnimatedStrands';

// ─── Types ────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  role: 'sol' | 'user';
  content: string;
  time: string;
};

// ─── Static data ──────────────────────────────────────────────────────────
const STARTER_CHIPS = [
  "How's my carbon this week?",
  "What's my biggest impact area?",
  'Help me set a new goal',
  'Tips to reduce my footprint',
];

const SOL_RESPONSES: Record<string, string> = {
  "How's my carbon this week?":
    "You've reduced your footprint by 14% this week — your lowest score in 3 months. Transport choices made the biggest difference.",
  "What's my biggest impact area?":
    'Transport accounts for 41% of your monthly footprint. Swapping even 2 car trips a week for walking or transit could cut it by ~8 kg CO₂e.',
  'Help me set a new goal':
    'Based on your patterns, a target of 320 kg CO₂e this month is ambitious but achievable. Want me to set that now?',
  'Tips to reduce my footprint':
    'Three high-leverage habits for you: (1) One plant-based meal a day, (2) Use transit on Tuesdays and Thursdays, (3) Short-cycle laundry at 30°C.',
};

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Typing indicator ──────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <View style={styles.solRow}>
      <SolOrb size={34} />
      <View style={[styles.solBubble, styles.typingBubble]}>
        <View style={styles.dotRow}>
          <View style={[styles.dot, { opacity: 1.0 }]} />
          <View style={[styles.dot, { opacity: 0.6 }]} />
          <View style={[styles.dot, { opacity: 0.3 }]} />
        </View>
      </View>
    </View>
  );
}

// ─── SolChatScreen ────────────────────────────────────────────────────────
export function SolChatScreen() {
  const navigation = useNavigation<any>();
  const [isInChat, setIsInChat] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  // Reanimated transition: 0 = intro, 1 = chat
  const transition = useSharedValue(0);

  // ── Start chat (from chip or text input) ──
  const startChat = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!isInChat) {
      setIsInChat(true);
      transition.value = withTiming(1, { duration: 520, easing: Easing.inOut(Easing.cubic) });
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      time: getTime(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const delay = 1600 + Math.random() * 800;
    setTimeout(() => {
      setIsTyping(false);
      const response =
        SOL_RESPONSES[trimmed] ??
        "That's a great question. Based on your recent data, I'd suggest focusing on your transport habits first — they have the highest leverage for your lifestyle right now.";
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'sol', content: response, time: getTime() },
      ]);
    }, delay);
  };

  // ── Additional message send (while already in chat) ──
  const sendMessage = () => startChat(input);

  useEffect(() => {
    if (isInChat) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping, isInChat]);

  // ── Animated styles ──
  const introStyle = useAnimatedStyle(() => ({
    opacity: interpolate(transition.value, [0, 0.55], [1, 0]),
    transform: [{ scale: interpolate(transition.value, [0, 1], [1, 0.94]) }],
  }));

  const chatStyle = useAnimatedStyle(() => ({
    opacity: interpolate(transition.value, [0.3, 1], [0, 1]),
  }));

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* Background strands — always rendered, subtle in chat */}
      <AnimatedStrands intensity={isInChat ? 0.5 : 1} />

      {/* ── INTRO PHASE ──────────────────────────────────────────── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, introStyle]}
        pointerEvents={isInChat ? 'none' : 'auto'}
      >
        <SafeAreaView style={styles.introSafe}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ArrowLeft size={22} color="#161816" strokeWidth={1.8} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sol</Text>
            <View style={{ width: 30 }} />
          </View>

          {/* Orb + labels */}
          <View style={styles.introOrbArea}>
            <SolOrb size={172} showGlow />
            <Text style={styles.introName}>Sol</Text>
            <Text style={styles.introSub}>ACTIVE INTELLIGENCE</Text>
          </View>

          {/* Starter chips */}
          <View style={styles.chipsArea}>
            <Text style={styles.chipsHint}>Start a conversation</Text>
            <View style={styles.chipsGrid}>
              {STARTER_CHIPS.map(chip => (
                <TouchableOpacity
                  key={chip}
                  style={styles.chip}
                  onPress={() => startChat(chip)}
                  activeOpacity={0.82}
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* ── CHAT PHASE ───────────────────────────────────────────── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, chatStyle]}
        pointerEvents={isInChat ? 'auto' : 'none'}
      >
        <SafeAreaView style={styles.chatSafe}>
          {/* Chat header — back + Sol + mini orb */}
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ArrowLeft size={22} color="#161816" strokeWidth={1.8} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sol</Text>
            <SolOrb size={36} />
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Weekly review card */}
            <View style={styles.weeklyCard}>
              <View style={styles.weeklyLeft}>
                <Text style={styles.weeklyTag}>WEEKLY REVIEW</Text>
                <Text style={styles.weeklyBody}>
                  You're building real momentum. Keep focusing on the small wins.
                </Text>
              </View>
              <View style={styles.weeklyRight}>
                <Text style={styles.weeklyMetric}>18.4</Text>
                <Text style={styles.weeklyUnit}>kg CO₂e saved</Text>
                <Text style={styles.weeklyDelta}>↓ 14% vs last week</Text>
              </View>
            </View>

            {/* Messages */}
            {messages.map(msg =>
              msg.role === 'sol' ? (
                <View key={msg.id} style={styles.solRow}>
                  <SolOrb size={34} />
                  <View style={styles.solBubble}>
                    <Text style={styles.msgText}>{msg.content}</Text>
                    <Text style={styles.msgTime}>{msg.time}</Text>
                  </View>
                </View>
              ) : (
                <View key={msg.id} style={styles.userRow}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userMsgText}>{msg.content}</Text>
                    <Text style={styles.msgTimeUser}>{msg.time} ✓✓</Text>
                  </View>
                </View>
              )
            )}

            {isTyping && <TypingIndicator />}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>

      {/* ── COMPOSER ─────────────────────────────────────────────────
          Rendered outside both phases so it's ALWAYS interactive.
          zIndex ensures it stays on top of the absolute-fill views.  */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.composerKAV}
      >
        <SafeAreaView style={styles.composerSafe}>
          <View style={styles.composer}>
            <View style={styles.composerInner}>
              <TextInput
                style={styles.composerInput}
                value={input}
                onChangeText={setInput}
                placeholder="Ask Sol anything"
                placeholderTextColor="rgba(243,246,243,0.35)"
                returnKeyType="send"
                onSubmitEditing={sendMessage}
                multiline
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                onPress={sendMessage}
                activeOpacity={0.85}
              >
                <Send size={15} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F5F2' },

  // ── Intro ──
  introSafe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '700',
    color: '#161816',
  },

  introOrbArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  introName: {
    fontFamily: 'Manrope',
    fontSize: 26,
    fontWeight: '700',
    color: '#161816',
    marginTop: 12,
  },
  introSub: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: '#6B716D',
    letterSpacing: 1.8,
    marginTop: 4,
  },

  chipsArea: {
    paddingHorizontal: 20,
    paddingBottom: 80, // space for composer
  },
  chipsHint: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#6B716D',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  chipsGrid: {
    gap: 10,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.10)',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  chipText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#161816',
    fontWeight: '400',
    lineHeight: 20,
  },

  // ── Chat ──
  chatSafe: { flex: 1 },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },

  messageList: { flex: 1 },
  messageListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90, // space for composer
  },

  weeklyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 16,
  },
  weeklyLeft: { flex: 1 },
  weeklyTag: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: '#6B716D',
    letterSpacing: 0.9,
    marginBottom: 6,
  },
  weeklyBody: { fontFamily: 'Inter', fontSize: 14, color: '#161816', lineHeight: 20 },
  weeklyRight: { alignItems: 'flex-end', justifyContent: 'center' },
  weeklyMetric: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 32,
    fontWeight: '700',
    color: '#00BB78',
    lineHeight: 36,
  },
  weeklyUnit: { fontFamily: 'Inter', fontSize: 11, color: '#6B716D' },
  weeklyDelta: { fontFamily: 'Inter', fontSize: 11, color: '#00BB78', marginTop: 2 },

  // Sol message
  solRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 14,
    paddingRight: 52,
  },
  solBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(29,31,30,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  msgText: { fontFamily: 'Inter', fontSize: 15, color: '#161816', lineHeight: 22 },
  msgTime: { fontFamily: 'Inter', fontSize: 11, color: '#6B716D', marginTop: 6 },

  // User message
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 14,
    paddingLeft: 52,
  },
  userBubble: {
    backgroundColor: 'rgba(0,187,120,0.09)',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,187,120,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userMsgText: { fontFamily: 'Inter', fontSize: 15, color: '#161816', lineHeight: 22 },
  msgTimeUser: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#6B716D',
    marginTop: 6,
    textAlign: 'right',
  },

  // Typing
  typingBubble: { paddingVertical: 16 },
  dotRow: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#00BB78' },

  // ── Composer ──
  composerKAV: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  composerSafe: { backgroundColor: '#1A1D1B' },
  composer: {
    backgroundColor: '#1A1D1B',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  composerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(243,246,243,0.10)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  composerInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#F3F6F3',
    maxHeight: 80,
    minHeight: 22,
    // Crucial for web: don't let browser styles override
    outlineStyle: 'none',
  } as any,
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00BB78',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: 'rgba(0,187,120,0.3)' },
});
