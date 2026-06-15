import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Plus, Users, Hash, ChevronRight } from "lucide-react-native";
import { ScreenHeader, SportLogo, LoadingSkeleton, hapticLight } from "@/components";
import { COLORS, RADIUS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { SPORTS } from "@/lib/catalog";
import { getCategoryTheme } from "@/theme/categories";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { Group, League } from "@/lib/types";

export default function LeaguesScreen() {
  const { userId } = useSession();
  const provider = getProvider();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let active = true;
    provider
      .listLeagues()
      .then((l) => active && setLeagues(l))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [provider]);

  async function create() {
    if (!name) return;
    hapticLight();
    const g = await provider.createGroup(userId, name);
    setGroups((s) => [g, ...s]);
    setName("");
    setMsg(`Mini-ligue créée — code ${g.inviteCode}`);
  }

  async function join() {
    hapticLight();
    try {
      const g = await provider.joinGroup(userId, code.toUpperCase());
      setGroups((s) => [g, ...s]);
      setCode("");
      setMsg(`Rejoint ${g.name}`);
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Leagues" subtitle="Compétitions" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Official seasons */}
        <Text style={styles.microLabel}>SAISONS OFFICIELLES</Text>
        <View style={styles.list}>
          {loading
            ? [0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.leagueCard}>
                  <LoadingSkeleton width={24} height={24} radius={6} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <LoadingSkeleton width={120} height={14} radius={4} />
                    <LoadingSkeleton width={160} height={11} radius={4} />
                  </View>
                </View>
              ))
            : leagues.map((l) => {
                const meta = SPORTS[l.sport];
                const accent = getCategoryTheme(l.id).accent;
                return (
                  <View key={l.id} style={styles.leagueCard}>
                    <SportLogo sport={l.sport} size={24} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.org}>{l.org}</Text>
                      <Text style={styles.leagueSub}>
                        {meta.label} · Saison {l.season}
                      </Text>
                    </View>
                    <View style={[styles.dot, { backgroundColor: accent }]} />
                    <ChevronRight size={18} color={COLORS.textFaint} />
                  </View>
                );
              })}
        </View>

        {/* Private mini-leagues */}
        <Text style={[styles.microLabel, styles.section]}>MINI-LIGUES PRIVÉES</Text>
        <View style={styles.card}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nom de la mini-ligue"
            placeholderTextColor={COLORS.textFaint}
            style={styles.input}
          />
          <Pressable
            onPress={create}
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
          >
            <Plus size={16} color={COLORS.bg} />
            <Text style={styles.btnPrimaryText}>Créer</Text>
          </Pressable>

          <View style={styles.divider} />

          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            placeholder="Code d'invitation"
            placeholderTextColor={COLORS.textFaint}
            style={[styles.input, styles.codeInput]}
          />
          <Pressable
            onPress={join}
            style={({ pressed }) => [styles.btnOutline, pressed && styles.pressed]}
          >
            <Users size={16} color={COLORS.text} />
            <Text style={styles.btnOutlineText}>Rejoindre</Text>
          </Pressable>
        </View>

        {msg ? <Text style={styles.msg}>{msg}</Text> : null}

        {groups.length > 0 && (
          <View style={[styles.list, { marginTop: 12 }]}>
            {groups.map((g) => {
              const accent = getCategoryTheme("default").accent;
              return (
                <View key={g.id} style={styles.groupRow}>
                  <Text style={styles.groupName}>{g.name}</Text>
                  <View style={styles.codeChip}>
                    <Hash size={12} color={COLORS.textFaint} />
                    <Text style={[styles.groupCode, { color: accent }]}>{g.inviteCode}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  microLabel: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: COLORS.textFaint,
    marginBottom: 12,
  },
  section: { marginTop: 28 },
  list: { gap: 8 },
  leagueCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  org: { fontFamily: FONTS.displayBold, fontSize: 15, color: COLORS.text },
  leagueSub: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  card: {
    gap: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text,
  },
  codeInput: { fontFamily: FONTS.mono, letterSpacing: 3 },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.text,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
  },
  btnPrimaryText: { fontFamily: FONTS.displayBold, fontSize: 14, color: COLORS.bg },
  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
  },
  btnOutlineText: { fontFamily: FONTS.displayBold, fontSize: 14, color: COLORS.text },
  pressed: { opacity: 0.7 },
  divider: { height: 1, backgroundColor: COLORS.border },
  msg: { marginTop: 12, fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  groupName: { fontFamily: FONTS.bodyMed, fontSize: 14, color: COLORS.text },
  codeChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  groupCode: { fontFamily: FONTS.mono, fontSize: 12, letterSpacing: 2 },
});
