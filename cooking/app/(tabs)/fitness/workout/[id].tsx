import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Dimensions, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiUrl } from '@/utils/getApiUrl';

const API_URL = `${getApiUrl()}/fitness`;
const { width } = Dimensions.get('window');

// =====================================================================
// 👋 USER: COPY YOUR GIF MAPPINGS HERE TOO
// This ensures they show up in the list view as well!
// =====================================================================
const MANUAL_GIFS: { [key: string]: any } = {
    // --- 30-Min Cardio Blast ---
    "High Knees": require('../../../../assets/high_knees.gif'),
    "Plank Hold": require('../../../../assets/plank.gif'),
    "Jumping Jacks": require('../../../../assets/jumping_jacks.gif'),
    "Mountain Climbers": require('../../../../assets/mountain_climbers.gif'),
    "Burpees": require('../../../../assets/burpees.gif'),

    // --- Arms & Shoulders ---
    "Overhead Barbell Press": require('../../../../assets/overhead_press.gif'),
    "Lateral Raises": require('../../../../assets/lateral_raises.gif'),
    "Front Dumbbell Raise": require('../../../../assets/front_raise.gif'),
    "Barbell Bicep Curls": require('../../../../assets/bicep_curls.gif'),
    "Tricep Rope Pushdown": require('../../../../assets/tricep_pushdown.gif'),
    "Rear Delt Flys": require('../../../../assets/rear_delt_flys.gif'),

    // --- Chest ---
    "Bench Press": require('../../../../assets/bench_press.gif'),
    "Incline Dumbbell Press": require('../../../../assets/incline_press.gif'),
    "Chest Flys": require('../../../../assets/chest_flys.gif'),
    "Push-Ups": require('../../../../assets/pushups.gif'),
    "Cable Crossover": require('../../../../assets/cable_crossover.gif'),
    "Dips": require('../../../../assets/dips.gif'),

    // --- Back ---
    "Deadlift": require('../../../../assets/deadlift.gif'),
    "Pull-Ups": require('../../../../assets/pullups.gif'),
    "Bent Over Barbell Row": require('../../../../assets/barbell_row.gif'),
    "Lat Pulldown": require('../../../../assets/lat_pulldown.gif'),
    "Seated Cable Row": require('../../../../assets/seated_row.gif'),
    "Face Pulls": require('../../../../assets/face_pulls.gif'),

    // --- Legs ---
    "Barbell Squat": require('../../../../assets/squat.gif'),
    "Leg Press": require('../../../../assets/leg_press.gif'),
    "Romanian Deadlift": require('../../../../assets/romanian_deadlift.gif'),
    "Leg Extensions": require('../../../../assets/leg_extensions.gif'),
    "Leg Curls": require('../../../../assets/leg_curls.gif'),
    "Calf Raises": require('../../../../assets/calf_raises.gif'),
};

interface Exercise {
    name: string;
    sets?: number;
    reps?: string;
    videoUrl?: string; // We ignore this now
    gifUrl?: string;
    duration?: number;
    breakDuration?: number;
    instructions?: string;
}

interface Workout {
    _id: string;
    name: string;
    type: 'standard' | 'guided';
    exercises: Exercise[];
}

export default function WorkoutDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                const res = await fetch(`${API_URL}/workouts`);
                const data: Workout[] = await res.json();
                const found = data.find(w => w._id === id);
                setWorkout(found || null);
            } catch (error) {
                console.error("Error fetching workout:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkout();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!workout) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Workout not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isGuided = workout.type === 'guided';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>{workout.name}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Always Show Guided Session Banner */}
                <View style={styles.guidedBanner}>
                    <View style={styles.guidedInfo}>
                        <Text style={styles.guidedTitle}>🔥 Interactive Mode</Text>
                        <Text style={styles.guidedSubtitle}>Full guided chronology enabled.</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.startSessionBtn}
                        activeOpacity={0.8}
                        onPress={() => router.push(`/fitness/guided/${workout._id}` as any)}>
                        <Text style={styles.startSessionText}>START</Text>
                        <Ionicons name="play" size={20} color="#2563EB" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.subtitle}>{workout.exercises.length} Exercises</Text>

                {workout.exercises.map((exercise, index) => (
                    <AnimatedCard key={index} index={index}>
                        <View style={styles.exerciseHeader}>
                            <View style={styles.indexBadge}>
                                <Text style={styles.indexText}>{index + 1}</Text>
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.exerciseName}>{exercise.name}</Text>
                                <Text style={styles.exerciseMeta}>
                                    {isGuided && !exercise.sets
                                        ? `${exercise.duration}s Work • ${exercise.breakDuration}s Rest`
                                        : `${exercise.sets} Sets • ${exercise.reps} Reps • ${(exercise.duration || 0) / 60}m Work`
                                    }
                                </Text>
                            </View>
                        </View>

                        {/* Instructions / Advice - The 'Friendly' Touch */}
                        {exercise.instructions && (
                            <View style={styles.adviceContainer}>
                                <Ionicons name="bulb" size={16} color="#F59E0B" style={{ marginRight: 6 }} />
                                <Text style={styles.adviceText}>{exercise.instructions}</Text>
                            </View>
                        )}

                        {/* GIF Display */}
                        <View style={styles.mediaContainer}>
                            {(MANUAL_GIFS[exercise.name] || exercise.gifUrl) ? (
                                <Image
                                    source={MANUAL_GIFS[exercise.name] || { uri: exercise.gifUrl }}
                                    style={styles.gifImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.gifImage, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={{ color: '#888' }}>No GIF Found</Text>
                                </View>
                            )}
                        </View>
                    </AnimatedCard>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

// Minimal Animated Card Component for that "Classy Click" feel
const AnimatedCard = ({ children, index }: { children: React.ReactNode, index: number }) => {
    const scaleAnim = new Animated.Value(1); // Initial value for scale: 1

    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3, // Bouncier
            tension: 40, // Faster
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            activeOpacity={1} // Control opacity change on press
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={{ transform: [{ scale: scaleAnim }] }} // Apply the animated scale
        >
            <Animated.View style={styles.exerciseCard}>
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Deep modern blue-black
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 10,
    },
    backIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
    },
    content: {
        padding: 20,
        paddingTop: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    // Guided Banner
    guidedBanner: {
        backgroundColor: '#2563EB', // Bright Blue
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    guidedInfo: {
        flex: 1,
    },
    guidedTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
    },
    guidedSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    startSessionBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
    },
    startSessionText: {
        color: '#2563EB',
        fontWeight: '900',
        fontSize: 14,
        marginRight: 4,
    },
    // Exercise Card
    exerciseCard: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    indexBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    indexText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: 4,
    },
    exerciseMeta: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
    adviceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    adviceText: {
        color: '#CBD5E1', // Light gray blue
        fontSize: 13,
        flex: 1,
        fontStyle: 'italic',
        lineHeight: 18,
    },
    mediaContainer: {
        width: '100%',
        height: 220,
        backgroundColor: '#000',
    },
    gifImage: {
        width: '100%',
        height: '100%',
    },
    // Error states
    errorText: {
        color: '#EF4444',
        fontSize: 18,
        marginBottom: 20,
    },
    backButton: {
        padding: 12,
        backgroundColor: '#334155',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
