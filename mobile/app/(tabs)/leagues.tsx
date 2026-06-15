import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Eyebrow, SportLogo } from "@/components";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { SPORTS } from "@/lib/catalog";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { Group, League } from "@/lib/types";

export default function LeaguesScreen() {
  const { userId } = useSession();
  const provider = getProvider();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    provider.listLeagues().then(setLeagues).catch(() => {});
  }, [provider]);

  async function create() {
    if (!name) return;
    const g = await provider.createGroup(userId, name);
    setGroups((s) => [...s, g]);
    setName("");
    setMsg(`Created ${g.name} — share code ${g.inviteCode}`);
  }
  async function join() {
    try {
      const g = await provider.joinGroup(userId, code.toUpperCase());
      setGroups((s) => [...s, g]);
      setMsg(`Joined ${g.name}`);
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Eyebrow>Competitions</Eyebrow>
      <Text style={styles.title}>Leagues</Text>

      <Eyebrow style={styles.section}>Official seasons</Eyebrow>
      <View style={{ gap: 8 }}>
        {leagues.map((l) => {
          const meta = SPORTS[l.sport];
          return (
            <View key={l.id} style={styles.leagueRow}>
              <SportLogo sport={l.sport} size={24} />
              <View style={{ flex: 1 }}>
                <Text style={styles.org}>{l.org}</Text>
                <Text style={[styles.leagueSub, { color: meta.accent }]}>{meta.label} · Season {l.season}</Text>
              </View>
              <Text style={styles.season}>{l.season}</Text>
            </View>
          );
        })}
      </View>

      <Eyebrow style={styles.section}>Private mini-leagues</Eyebrow>
      <View style={styles.card}>
        <TextInput value={name} onChangeText={setName} placeholder="e.g. Office Hoops Crew" placeholderTextColor="rgba(168,159,201,0.6)" style={styles.input} />
        <Pressable onPress={create} style={styles.cta}><Text style={styles.ctaText}>Create mini-league</Text></Pressable>
        <View style={styles.divider} />
        <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="Invite code" placeholderTextColor="rgba(168,159,201,0.6)" style={[styles.input, styles.codeInput]} />
        <Pressable onPress={join} style={styles.ctaOutline}><Text style={styles.ctaOutlineText}>Join with code</Text></Pressable>
      </View>

      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
      {groups.length > 0 && (
        <View style={{ gap: 8, marginTop: 12 }}>
          {groups.map((g) => (
            <View key={g.id} style={styles.groupRow}>
              <Text style={styles.groupName}>{g.name}</Text>
              <Text style={styles.groupCode}>{g.inviteCode}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 32 },
  title: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.white, marginTop: 8, marginBottom: 4, letterSpacing: -0.5 },
  section: { marginTop: 24, marginBottom: 8 },
  leagueRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: "rgba(21,17,42,0.6)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  org: { fontFamily: FONTS.displayBold, fontSize: 15, color: COLORS.white },
  leagueSub: { fontFamily: FONTS.body, fontSize: 12, marginTop: 2 },
  season: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted },
  card: { gap: 12, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: "rgba(21,17,42,0.6)", padding: 16 },
  input: { borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: COLORS.ink, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontFamily: FONTS.body, fontSize: 14, color: COLORS.white },
  codeInput: { fontFamily: FONTS.mono, letterSpacing: 3 },
  cta: { backgroundColor: COLORS.violet, borderRadius: 14, paddingVertical: 13, alignItems: "center" },
  ctaText: { fontFamily: FONTS.displayBold, fontSize: 14, color: "#fff" },
  ctaOutline: { borderWidth: 1, borderColor: COLORS.violet, borderRadius: 14, paddingVertical: 13, alignItems: "center" },
  ctaOutlineText: { fontFamily: FONTS.displayBold, fontSize: 14, color: COLORS.violetLight },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.line },
  msg: { marginTop: 12, fontFamily: FONTS.body, fontSize: 13, color: COLORS.muted },
  groupRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: "rgba(21,17,42,0.6)", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12 },
  groupName: { fontFamily: FONTS.bodyMed, fontSize: 14, color: COLORS.white },
  groupCode: { fontFamily: FONTS.mono, fontSize: 12, letterSpacing: 2, color: COLORS.violetLight },
});
