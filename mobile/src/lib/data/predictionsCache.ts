import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Prediction } from "@/lib/types";

const key = (userId: string) => `mpp-preds-${userId}`;

export async function loadPredictions(userId: string): Promise<Prediction[]> {
  const raw = await AsyncStorage.getItem(key(userId));
  return raw ? (JSON.parse(raw) as Prediction[]) : [];
}

export async function savePrediction(userId: string, pred: Prediction): Promise<void> {
  const all = await loadPredictions(userId);
  const next = all.filter((p) => p.marketId !== pred.marketId);
  next.push(pred);
  await AsyncStorage.setItem(key(userId), JSON.stringify(next));
}
