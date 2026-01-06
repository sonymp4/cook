import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Dimensions, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
import { getApiUrl } from '@/utils/getApiUrl';

// Use the centralized API URL helper
const API_URL = `${getApiUrl()}/fitness`;

interface Exercise {
    name: string;
    sets: number;
    reps: string;
    videoUrl?: string;
}

interface Workout {
    _id: string;
    name: string;
    exercises: Exercise[];
}

interface DailyLog {
    calories: number;
    protein: number;
    carbs: number;
    water: number;
}

interface NutritionCardProps {
    title: string;
    value: number;
    unit: string;
    color: string;
    onChange: (val: string) => void;
}

export default function FitnessDashboard() {
    const router = useRouter();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [dailyLog, setDailyLog] = useState<DailyLog>({
        calories: 0,
        protein: 0,
        carbs: 0,
        water: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Get current date as YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        // Get User ID from storage (assuming it was saved during login)
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                setUserId(id);
            } catch (e) {
                console.error("Error fetching user ID", e);
            }
        };
        getUserId();
    }, []);

    const fetchData = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            // Fetch Workouts
            const workoutsRes = await fetch(`${API_URL}/workouts`);
            const workoutsData = await workoutsRes.json();
            setWorkouts(workoutsData);
            if (Array.isArray(workoutsData) && workoutsData.length === 0) {
                Alert.alert("Debug Info", "Connected to DB but found 0 workouts. Re-seeding database...");
            }

            // Fetch Daily Log
            const logRes = await fetch(`${API_URL}/log/${today}?userId=${userId}`);
            const logData = await logRes.json();
            if (logData) {
                setDailyLog({
                    calories: logData.calories || 0,
                    protein: logData.protein || 0,
                    carbs: logData.carbs || 0,
                    water: logData.water || 0
                });
            }
        } catch (error) {
            console.error("Error fetching fitness data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId, today]);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const updateLog = async (newData: Partial<DailyLog>) => {
        if (!userId) return;

        // Optimistic update
        setDailyLog(prev => ({ ...prev, ...newData }));

        try {
            await fetch(`${API_URL}/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    date: today,
                    ...dailyLog,
                    ...newData
                }),
            });
        } catch (error) {
            console.error("Error updating log:", error);
            Alert.alert("Error", "Failed to save progress.");
        }
    };

    const addWater = () => {
        const newWater = (dailyLog.water || 0) + 250;
        updateLog({ water: newWater });
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    if (!userId) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>Please log in to view Fitness stats.</Text>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                <Text style={styles.headerTitle}>Fitness & Nutrition</Text>

                {/* Hydration Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="water" size={24} color="#3498db" />
                        <Text style={styles.cardTitle}>Hydration</Text>
                    </View>
                    <View style={styles.waterContainer}>
                        <View>
                            <Text style={styles.waterValue}>{dailyLog.water} ml</Text>
                            <Text style={styles.waterTarget}>Target: 2500 ml</Text>
                        </View>
                        <TouchableOpacity style={styles.addWaterBtn} onPress={addWater}>
                            <Ionicons name="add" size={24} color="#fff" />
                            <Text style={styles.addWaterText}>250ml</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${Math.min((dailyLog.water / 2500) * 100, 100)}%` }
                            ]}
                        />
                    </View>
                </View>

                {/* Nutrition Section */}
                <Text style={styles.sectionTitle}>Daily Nutrition</Text>
                <View style={styles.nutritionGrid}>
                    <NutritionCard
                        title="Calories"
                        value={dailyLog.calories}
                        unit="kcal"
                        color="#e74c3c"
                        onChange={(val) => updateLog({ calories: parseInt(val) || 0 })}
                    />
                    <NutritionCard
                        title="Protein"
                        value={dailyLog.protein}
                        unit="g"
                        color="#2ecc71"
                        onChange={(val) => updateLog({ protein: parseInt(val) || 0 })}
                    />
                    <NutritionCard
                        title="Carbs"
                        value={dailyLog.carbs}
                        unit="g"
                        color="#f1c40f"
                        onChange={(val) => updateLog({ carbs: parseInt(val) || 0 })}
                    />
                </View>

                {/* Workouts Section */}
                <Text style={styles.sectionTitle}>Workouts</Text>
                <View style={styles.workoutGrid}>
                    {workouts.map((workout) => (
                        <TouchableOpacity
                            key={workout._id}
                            style={styles.workoutCard}
                            onPress={() => router.push(`/fitness/workout/${workout._id}` as any)}
                        >
                            <View style={styles.workoutIconPlaceholder}>
                                <Ionicons name="barbell" size={32} color="#fff" />
                            </View>
                            <Text style={styles.workoutName}>{workout.name}</Text>
                            <Text style={styles.workoutCount}>{workout.exercises?.length || 0} Exercises</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const NutritionCard = ({ title, value, unit, color, onChange }: NutritionCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempVal, setTempVal] = useState(value.toString());

    useEffect(() => {
        setTempVal(value.toString());
    }, [value]);

    const handleBlur = () => {
        setIsEditing(false);
        if (tempVal !== value.toString()) {
            onChange(tempVal);
        }
    };

    return (
        <View style={[styles.nutritionCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <Text style={styles.nutritionTitle}>{title}</Text>
            {isEditing ? (
                <TextInput
                    style={styles.nutritionInput}
                    value={tempVal}
                    onChangeText={setTempVal}
                    keyboardType="numeric"
                    onBlur={handleBlur}
                    autoFocus
                />
            ) : (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Text style={styles.nutritionValue}>{value} <Text style={styles.nutritionUnit}>{unit}</Text></Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    scrollContent: {
        padding: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ddd',
        marginTop: 25,
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#2a2a2a',
        borderRadius: 16,
        padding: 20,
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 10,
    },
    waterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    waterValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    waterTarget: {
        fontSize: 14,
        color: '#888',
    },
    addWaterBtn: {
        backgroundColor: '#3498db',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addWaterText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 5,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#444',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#3498db',
        borderRadius: 4,
    },
    nutritionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nutritionCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        padding: 15,
        width: '31%',
        alignItems: 'center',
    },
    nutritionTitle: {
        fontSize: 14,
        color: '#bbb',
        marginBottom: 5,
    },
    nutritionValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    nutritionUnit: {
        fontSize: 12,
        color: '#888',
    },
    nutritionInput: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#666',
        minWidth: 50,
        textAlign: 'center',
    },
    workoutGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    workoutCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 16,
        width: (width - 50) / 2, // 2 column grid
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
    },
    workoutIconPlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: '#444',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    workoutName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 5,
    },
    workoutCount: {
        fontSize: 12,
        color: '#888',
    },
});
