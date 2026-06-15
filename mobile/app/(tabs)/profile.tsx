import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { Pencil } from "lucide-react-native";
import {
  ScreenHeader,
  AnimatedCounter,
  SportLogo,
  RankBadge,
  LoadingSkeleton,
  OnboardingModal,
  hapticLight,
} from "@/components";
import { COLORS, RADIUS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { getCategoryTheme } from "@/theme/categories";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { League, Profile, SeasonStats } from "@/lib/types";

export default function ProfileScreen() {
  const { userId, displayName, favorites, setFavorites } = useSession();
  const provider = getProvider();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [seasons, setSeasons] = useState<{ league: League; stats: SeasonStats }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const p = await provider.getProfile(userId);
      const leagues = await provider.listLeagues();
      const rows = await Promise.all(
        leagues.map(async (league) => ({ league, stats: await provider.seasonStats(userId, league.id) })),
      );
      if (!alive) return;
      setProfile(p);
      setSeasons(rows.filter((r) => r.stats.made > 0));
      setLoading(false);
    })().catch(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [userId, provider]);

  const favText = favorites.length > 0 ? favorites.join(", ") : "aucun";

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={displayName}
        subtitle="Profil"
        right={
          <View style={styles.headerPts}>
            <AnimatedCounter value={profile?.totalPoints ?? 0} style={styles.headerPtsValue} />
            <Text style={styles.headerPtsLabel}>PTS</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Identity card */}
        <View style={styles.identity}>
          <View style={styles.identityRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={styles.identityInfo}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.favorites} numberOfLines={1}>
                favoris: {favText}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              hapticLight();
              setEditing(true);
            }}
            style={({ pressed }) => [styles.editBtn, pressed && styles.editBtnPressed]}
          >
            <Pencil size={15} color={COLORS.text} strokeWidth={2.2} />
            <Text style={styles.editBtnText}>Modifier mes sports</Text>
          </Pressable>
        </View>

        {/* Seasons */}
        <Text style={styles.sectionLabel}>RANG PAR SAISON</Text>

        {loading ? (
          <View style={styles.list}>
            <LoadingSkeleton height={120} radius={RADIUS.lg} />
            <LoadingSkeleton height={120} radius={RADIUS.lg} />
          </View>
        ) : seasons.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Fais des pronostics pour démarrer un classement.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {seasons.map(({ league, stats }) => {
              const accent = getCategoryTheme(league.id).accent;
              return (
                <View key={league.id} style={styles.card}>
                  <View style={styles.cardHead}>
                    <SportLogo sport={league.sport} size={20} />
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {league.org} {league.season}
                    </Text>
                    <View style={styles.badgeWrap}>
                      <RankBadge tier={stats.tier} />
                    </View>
                  </View>
                  <View style={styles.cells}>
                    <Cell value={stats.points} label="Points" tone={accent} first />
                    <Cell value={`${Math.round(stats.accuracy * 100)}%`} label="Précision" tone={COLORS.text} />
                    <Cell value={`${stats.correct}/${stats.settled}`} label="Corrects" tone={COLORS.textMuted} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {editing && (
        <OnboardingModal
          initial={favorites}
          eyebrow="Vos sports"
          title="Modifier mes sports"
          ctaLabel="Enregistrer"
          onDone={(sports) => {
            setFavorites(sports);
            setEditing(false);
          }}
        />
      )}
    </View>
  );
}

function Cell({
  value,
  label,
  tone,
  first,
}: {
  value: number | string;
  label: string;
  tone: string;
  first?: boolean;
}) {
  return (
    <View style={[styles.cell, !first && styles.cellDivider]}>
      <Text style={[styles.cellValue, { color: tone }]}>{value}</Text>
      <Text style={styles.cellLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },

  headerPts: { alignItems: "flex-end" },
  headerPtsValue: { fontFamily: FONTS.monoBold, fontSize: 26, color: COLORS.text },
  headerPtsLabel: { fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 2, color: COLORS.textMuted, marginTop: 2 },

  identity: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 16,
    gap: 16,
  },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.text },
  identityInfo: { flex: 1, gap: 4 },
  name: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.text },
  favorites: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
  },
  editBtnPressed: { backgroundColor: COLORS.surfaceAlt, opacity: 0.9 },
  editBtnText: { fontFamily: FONTS.displayBold, fontSize: 14, color: COLORS.text },

  sectionLabel: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: COLORS.textFaint,
    marginTop: 28,
    marginBottom: 12,
  },

  list: { gap: 12 },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  emptyText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, textAlign: "center" },

  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 16,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { flex: 1, fontFamily: FONTS.displayBold, fontSize: 15, color: COLORS.text },
  badgeWrap: { marginLeft: "auto" },

  cells: {
    flexDirection: "row",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
  },
  cell: { flex: 1, alignItems: "center", gap: 4 },
  cellDivider: { borderLeftWidth: 1, borderLeftColor: COLORS.border },
  cellValue: { fontFamily: FONTS.monoBold, fontSize: 18, fontVariant: ["tabular-nums"] },
  cellLabel: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1, color: COLORS.textFaint, textTransform: "uppercase" },
});
