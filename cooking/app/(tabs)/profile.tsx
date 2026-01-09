import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { api } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { getApiUrl } from '@/utils/getApiUrl';

// --- Interfaces ---

interface UserMetrics {
  age?: number;
  gender?: 'male' | 'female';
  height?: number; // cm
  weight?: number; // kg
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme';
  goal?: 'lose' | 'maintain' | 'gain';
}

interface DailyLog {
  calories: number;
  protein: number;
  carbs: number;
  water: number;
}

interface Recipe {
  _id: string;
  name: string;
  description?: string;
  servings: number;
  totalCalories: number;
  perServing?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

// --- Constants & Calcs ---

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extreme: 1.9,
};

const calculateBMR = (metrics: UserMetrics) => {
  if (!metrics.weight || !metrics.height || !metrics.age || !metrics.gender) return 0;
  // Mifflin-St Jeor Equation
  let s = metrics.gender === 'male' ? 5 : -161;
  return (10 * metrics.weight) + (6.25 * metrics.height) - (5 * metrics.age) + s;
};

const calculateTDEE = (metrics: UserMetrics) => {
  const bmr = calculateBMR(metrics);
  const multiplier = ACTIVITY_MULTIPLIERS[metrics.activityLevel || 'moderate'];
  return Math.round(bmr * multiplier);
};

const calculateGoals = (metrics: UserMetrics) => {
  const tdee = calculateTDEE(metrics);
  let targetCalories = tdee;
  if (metrics.goal === 'lose') targetCalories -= 500;
  if (metrics.goal === 'gain') targetCalories += 500;

  // Macro split: 30% Protein, 35% Carbs, 35% Fat
  const protein = Math.round((targetCalories * 0.3) / 4);
  const carbs = Math.round((targetCalories * 0.35) / 4);
  const fats = Math.round((targetCalories * 0.35) / 9);

  return { calories: targetCalories, protein, carbs, fats };
};

const calculateBMI = (metrics: UserMetrics) => {
  if (!metrics.weight || !metrics.height) return { value: 0, category: 'Unknown' };
  const heightM = metrics.height / 100;
  const bmi = metrics.weight / (heightM * heightM);
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi >= 25 && bmi < 30) category = 'Overweight';
  else if (bmi >= 30) category = 'Obese';
  return { value: parseFloat(bmi.toFixed(1)), category };
};

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth(); // Assuming refreshUser exists, if not we'll fetch manually
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // State
  const [activeTab, setActiveTab] = useState<'stats' | 'nutrition' | 'saved'>('nutrition');
  const [metrics, setMetrics] = useState<UserMetrics>({});
  const [dailyLog, setDailyLog] = useState<DailyLog>({ calories: 0, protein: 0, carbs: 0, water: 0 });
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Editor State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<UserMetrics>({});

  // Food Logger State
  const [foodInput, setFoodInput] = useState({ calories: '', protein: '', carbs: '' });

  // --- Effects ---

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // Clear state on logout
      setMetrics({});
      setDailyLog({ calories: 0, protein: 0, carbs: 0, water: 0 });
      setRecipes([]);
      setFoodInput({ calories: '', protein: '', carbs: '' });
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get Metrics (from user object or refresh)
      // Reset metrics to empty object if user has none, ensuring we don't keep stale data
      setMetrics(user?.metrics || {});

      // 2. Get Daily Log
      const today = new Date().toISOString().split('T')[0];
      const logRes = await api.get<DailyLog>(`/fitness/log/${today}?userId=${user?._id}`);
      if (logRes.success && logRes.data) {
        setDailyLog({
          calories: logRes.data.calories || 0,
          protein: logRes.data.protein || 0,
          carbs: logRes.data.carbs || 0,
          water: logRes.data.water || 0
        });
      }

      // 3. Get Saved Recipes
      const favRes = await api.get<Recipe[]>('/users/favorites');
      if (favRes.success) setRecipes(favRes.data || []);

    } catch (e) {
      console.error("Load Data Error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- Actions ---

  const handleUpdateMetrics = async () => {
    // Validation/Parsing
    const payload = {
      ...editForm,
      age: Number(editForm.age),
      height: Number(editForm.height),
      weight: Number(editForm.weight),
    };

    try {
      const res = await api.put('/users/metrics', payload);
      if (res.success && res.data) {
        setMetrics(res.data);
        setShowEditModal(false);
        Alert.alert("Success", "Body stats updated!");
        // Update global user context so metrics don't disappear on reload
        await refreshUser();
      }
    } catch (e) {
      Alert.alert("Error", "Failed to update stats");
    }
  };

  const handleLogFood = async () => {
    const cals = Number(foodInput.calories) || 0;
    const prot = Number(foodInput.protein) || 0;
    const carb = Number(foodInput.carbs) || 0;

    if (cals === 0 && prot === 0 && carb === 0) return;

    const newLog = {
      calories: dailyLog.calories + cals,
      protein: dailyLog.protein + prot,
      carbs: dailyLog.carbs + carb,
      water: dailyLog.water
    };

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.post<DailyLog>('/fitness/log', {
        userId: user?._id,
        date: today,
        ...newLog
      });
      const data = res.data;
      setDailyLog(newLog);
      setFoodInput({ calories: '', protein: '', carbs: '' }); // Clear inputs
    } catch (e) {
      Alert.alert("Error", "Failed to log food");
    }
  };

  // --- Logic ---
  const goals = calculateGoals(metrics);
  const bmi = calculateBMI(metrics);

  // --- Render Components ---

  const ProgressBar = ({ current, total, color, label, unit }: any) => {
    const percent = Math.min(Math.max(current / total, 0), 1);
    const remaining = total - current;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressLabel, { color: '#333' }]}>{label}</Text>
          <Text style={styles.progressValue}>{current} / {total} {unit}</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${percent * 100}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.remainingText}>
          {remaining > 0 ? `${remaining} ${unit} remaining` : `Goal met!`}
        </Text>
      </View>
    );
  };



  return (
    <View style={styles.container}>
      <Modal visible={showEditModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Body Stats</Text>

            <View style={styles.inputRow}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(editForm.age || '')}
                  onChangeText={t => setEditForm({ ...editForm, age: Number(t) })}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[styles.genderBtn, editForm.gender === 'male' && styles.genderBtnActive]}
                    onPress={() => setEditForm({ ...editForm, gender: 'male' })}
                  >
                    <Text style={[styles.genderText, editForm.gender === 'male' && { color: '#fff' }]}>M</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderBtn, editForm.gender === 'female' && styles.genderBtnActive]}
                    onPress={() => setEditForm({ ...editForm, gender: 'female' })}
                  >
                    <Text style={[styles.genderText, editForm.gender === 'female' && { color: '#fff' }]}>F</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(editForm.height || '')}
                  onChangeText={t => setEditForm({ ...editForm, height: Number(t) })}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(editForm.weight || '')}
                  onChangeText={t => setEditForm({ ...editForm, weight: Number(t) })}
                />
              </View>
            </View>

            <Text style={styles.label}>Activity Level</Text>
            <View style={styles.activityRow}>
              {['sedentary', 'moderate', 'active'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.activityBtn, editForm.activityLevel === level && styles.activityBtnActive]}
                  onPress={() => setEditForm({ ...editForm, activityLevel: level as any })}
                >
                  <Text style={[styles.activityText, editForm.activityLevel === level && { color: '#fff' }]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Goal</Text>
            <View style={styles.activityRow}>
              {['lose', 'maintain', 'gain'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.goalBtn, editForm.goal === g && styles.goalBtnActive]}
                  onPress={() => setEditForm({ ...editForm, goal: g as any })}
                >
                  <Text style={[styles.activityText, editForm.goal === g && { color: '#fff' }]}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>


            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateMetrics}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- Header --- */}
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>Fitness Enthusiast</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={async () => {
            try {
              await logout();
            } catch (e) {
              console.error('Logout failed:', e);
            } finally {
              // Force navigation to the root index (Login Screen)
              router.replace('/');
            }
          }}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* --- Tabs --- */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'nutrition' && styles.tabActive]}
            onPress={() => setActiveTab('nutrition')}
          >
            <Text style={[styles.tabText, activeTab === 'nutrition' && styles.tabTextActive]}>Nutrition</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>Recipes</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
      >
        {activeTab === 'nutrition' ? (
          <View style={styles.nutritionSection}>
            {/* 1. Body Stats Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Body Stats</Text>
                <TouchableOpacity onPress={() => { setEditForm(metrics); setShowEditModal(true); }}>
                  <Ionicons name="create-outline" size={20} color="#2563EB" />
                </TouchableOpacity>
              </View>

              {metrics.weight ? (
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statVal}>{bmi.value}</Text>
                    <Text style={styles.statLabel}>BMI ({bmi.category})</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statVal}>{goals.calories}</Text>
                    <Text style={styles.statLabel}>Daily Goal (kcal)</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statVal}>{metrics.weight}kg</Text>
                    <Text style={styles.statLabel}>Weight</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Add your stats to enable calculator</Text>
                  <TouchableOpacity style={styles.addStatsBtn} onPress={() => { setEditForm({}); setShowEditModal(true); }}>
                    <Text style={styles.addStatsText}>Add Stats</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 2. Today's Progress */}
            {metrics.weight && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Today's Progress</Text>
                <ProgressBar
                  label="Calories"
                  current={dailyLog.calories}
                  total={goals.calories}
                  unit="kcal"
                  color="#EC4899"
                />
                <ProgressBar
                  label="Protein"
                  current={dailyLog.protein}
                  total={goals.protein}
                  unit="g"
                  color="#8B5CF6"
                />
                <ProgressBar
                  label="Carbs"
                  current={dailyLog.carbs}
                  total={goals.carbs}
                  unit="g"
                  color="#10B981"
                />
              </View>
            )}

            {/* 3. Log Food */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Add Food</Text>
              <View style={styles.logRow}>
                <TextInput
                  style={styles.logInput}
                  placeholder="Kcal"
                  keyboardType="numeric"
                  value={foodInput.calories}
                  onChangeText={t => setFoodInput({ ...foodInput, calories: t })}
                />
                <TextInput
                  style={styles.logInput}
                  placeholder="Prot (g)"
                  keyboardType="numeric"
                  value={foodInput.protein}
                  onChangeText={t => setFoodInput({ ...foodInput, protein: t })}
                />
                <TextInput
                  style={styles.logInput}
                  placeholder="Carb (g)"
                  keyboardType="numeric"
                  value={foodInput.carbs}
                  onChangeText={t => setFoodInput({ ...foodInput, carbs: t })}
                />
                <TouchableOpacity style={styles.logBtn} onPress={handleLogFood}>
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.recipesSection}>
            {recipes.length === 0 ? (
              <Text style={styles.emptyText}>No saved recipes yet.</Text>
            ) : (
              recipes.map(r => (
                <View key={r._id} style={styles.recipeCard}>
                  <Text style={styles.recipeName}>{r.name}</Text>
                  <Text>{r.totalCalories} kcal</Text>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#FF6B6B' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  logoutBtn: { marginLeft: 'auto', padding: 5 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },

  content: { flex: 1, padding: 20 },
  nutritionSection: { gap: 20 },
  recipesSection: { gap: 15 },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  emptyState: { alignItems: 'center', padding: 10 },
  addStatsBtn: {
    marginTop: 10,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  addStatsText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#64748B' },

  // Progress Bar
  progressContainer: { marginBottom: 15 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { fontWeight: '600', fontSize: 14 },
  progressValue: { fontSize: 12, color: '#64748B' },
  barBg: { height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  remainingText: { fontSize: 11, color: '#94A3B8', marginTop: 4, textAlign: 'right' },

  // Logger
  logRow: { flexDirection: 'row', gap: 10 },
  logInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    textAlign: 'center',
  },
  logBtn: {
    backgroundColor: '#10B981',
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  inputWrap: { flex: 1 },
  label: { fontSize: 13, color: '#64748B', marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  genderBtnActive: { backgroundColor: '#2563EB' },
  genderText: { fontWeight: 'bold', color: '#64748B' },

  activityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  activityBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  activityBtnActive: { backgroundColor: '#2563EB' },
  activityText: { fontSize: 12, fontWeight: '600', color: '#64748B' },

  goalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  goalBtnActive: { backgroundColor: '#10B981' },

  modalBtnRow: { flexDirection: 'row', gap: 15, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelBtnText: { fontWeight: 'bold', color: '#64748B' },
  saveBtn: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center' },
  saveBtnText: { fontWeight: 'bold', color: '#fff' },

  // Recipe Reuse
  recipeCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    elevation: 2,
  },
  recipeName: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 }
});


