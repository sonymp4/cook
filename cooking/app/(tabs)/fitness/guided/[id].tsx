import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Image, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiUrl } from '@/utils/getApiUrl';

const { width } = Dimensions.get('window');
const API_URL = `${getApiUrl()}/fitness`;

// =====================================================================
// 👋 USER: ADD YOUR MANUAL GIFS HERE
// 1. Place your .gif files in your project's 'assets' folder (e.g., cooking/assets/)
// 2. Uncomment the lines below and match the exact name of your file
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

type TickState = 'prep' | 'work' | 'rest' | 'finished';

interface Exercise {
    name: string;
    gifUrl?: string;
    duration?: number; // seconds
    breakDuration?: number; // seconds
    instructions?: string;
}

interface Workout {
    _id: string;
    name: string;
    exercises: Exercise[];
}

export default function GuidedSession() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Data State
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(true);

    // Session State
    const [status, setStatus] = useState<TickState>('prep');
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5); // Start with 5s prep
    const [isActive, setIsActive] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                const res = await fetch(`${API_URL}/workouts`);
                const data = await res.json();
                const found = data.find((w: Workout) => w._id === id);
                if (found) {
                    setWorkout(found);
                } else {
                    Alert.alert("Error", "Workout not found");
                    router.back();
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Connection failed");
            } finally {
                setLoading(false);
            }
        };
        fetchWorkout();
    }, [id]);

    // Timer Engine
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handlePhaseTransition();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const handlePhaseTransition = () => {
        if (!workout) return;
        const exercise = workout.exercises[currentExerciseIndex];

        if (status === 'prep') {
            // Prep -> Work
            setStatus('work');
            // Ensure we use the exercise duration, default to 300s (5m) if missing
            setTimeLeft(exercise.duration || 300);
        } else if (status === 'work') {
            // Work -> Rest (or Finish)
            if (currentExerciseIndex >= workout.exercises.length - 1) {
                setStatus('finished');
                setIsActive(false);
            } else {
                setStatus('rest');
                // Ensure we use the break duration, default to 30s
                setTimeLeft(exercise.breakDuration || 30);
            }
        } else if (status === 'rest') {
            // Rest -> Prep for next exercise
            setCurrentExerciseIndex(prev => prev + 1);
            setStatus('prep');
            setTimeLeft(5); // Always 5s prep for next
        }
    };

    const toggleTimer = () => setIsActive(!isActive);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const getPhaseColor = () => {
        switch (status) {
            case 'work': return '#EF4444'; // Red-500
            case 'rest': return '#3B82F6'; // Blue-500
            case 'prep': return '#F59E0B'; // Amber-500
            case 'finished': return '#10B981'; // Emerald-500
            default: return '#1F2937';
        }
    };

    if (loading || !workout) return <View style={styles.loadingContainer}><Text style={styles.textWhite}>Loading...</Text></View>;

    if (status === 'finished') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: '#10B981' }]}>
                <View style={styles.centerContent}>
                    <Ionicons name="trophy" size={120} color="#fff" />
                    <Text style={styles.finishedTitle}>WORKOUT COMPLETE</Text>
                    <Text style={styles.finishedSubtitle}>You crushed it!</Text>
                </View>
                <TouchableOpacity style={styles.exitBtn} onPress={() => router.back()}>
                    <Text style={styles.exitBtnText}>EXIT</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!workout.exercises || workout.exercises.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: '#1F2937', justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar barStyle="light-content" />
                <View style={{ alignItems: 'center', padding: 20 }}>
                    <Ionicons name="alert-circle-outline" size={80} color="#F59E0B" />
                    <Text style={[styles.finishedTitle, { textAlign: 'center', marginTop: 20 }]}>No Exercises Found</Text>
                    <Text style={[styles.finishedSubtitle, { textAlign: 'center', marginTop: 10, fontSize: 16 }]}>
                        This workout is empty. Please ask an admin to add exercises.
                    </Text>
                </View>
                <TouchableOpacity style={[styles.exitBtn, { marginTop: 40 }]} onPress={() => router.back()}>
                    <Text style={styles.exitBtnText}>GO BACK</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const currentExercise = workout.exercises[currentExerciseIndex];
    // Safety check just in case index goes out of bounds
    if (!currentExercise) return null;

    const nextExercise = workout.exercises[currentExerciseIndex + 1];
    const backgroundColor = getPhaseColor();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="close" size={28} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
                <View style={styles.pill}>
                    <Text style={styles.pillText}>{status.toUpperCase()}</Text>
                </View>
                <View style={styles.iconBtn}>
                    <Text style={styles.stepText}>{currentExerciseIndex + 1}/{workout.exercises.length}</Text>
                </View>
            </View>

            {/* Main Timer */}
            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                <Text style={styles.exerciseTitle}>
                    {status === 'rest' ? "REST BREAK" : currentExercise.name}
                </Text>
            </View>

            {/* Visuals / Cards */}
            <View style={styles.cardContainer}>
                {status !== 'rest' ? (
                    <View style={styles.activeCard}>
                        {/* Logic: Check Manual Local GIF -> Check Database URL -> Show Error */}
                        {(MANUAL_GIFS[currentExercise.name] || currentExercise.gifUrl) ? (
                            <Image
                                source={MANUAL_GIFS[currentExercise.name] || { uri: currentExercise.gifUrl }}
                                style={styles.gif}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.noGifContainer}>
                                <Text style={styles.noGifText}>No GIF Found</Text>
                                <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Add to assets or seed DB</Text>
                            </View>
                        )}

                        {!isActive && (
                            <View style={styles.overlay}>
                                <Ionicons name="play-circle" size={80} color="#fff" style={{ opacity: 0.9 }} />
                                <Text style={styles.pausedText}>{status === 'prep' ? "GET READY" : "PAUSED"}</Text>

                                {status === 'prep' && currentExercise.instructions && (
                                    <View style={styles.prepTipContainer}>
                                        <Text style={styles.prepTipText}>{currentExercise.instructions}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.restCard}>
                        {/* Classy "Up Next" View */}
                        <View style={styles.restHeader}>
                            <Ionicons name="cafe" size={32} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.restTitle}>UP NEXT</Text>
                        </View>

                        <Text style={styles.restSubtitle}>{nextExercise?.name || "Finish"}</Text>

                        {nextExercise?.instructions && (
                            <View style={styles.tipContainer}>
                                <Ionicons name="information-circle-outline" size={20} color="#60A5FA" />
                                <Text style={styles.tipText}>{nextExercise.instructions}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* Controls */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.playBtn}
                    onPress={toggleTimer}
                    activeOpacity={0.8}
                >
                    <Ionicons name={isActive ? "pause" : "play"} size={40} color={backgroundColor} />
                </TouchableOpacity>

                {/* Skip button only when paused or resting to prevent accidental skips */}
                <TouchableOpacity style={styles.skipBtn} onPress={handlePhaseTransition}>
                    <Text style={styles.skipText}>SKIP</Text>
                    <Ionicons name="play-skip-forward" size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textWhite: { color: "#fff" },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    iconBtn: {
        width: 40,
        alignItems: 'center',
    },
    pill: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pillText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    stepText: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: 'bold',
    },

    // Timer Section
    timerContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    timerText: {
        fontSize: 90,
        fontWeight: '900',
        color: '#fff',
        fontVariant: ['tabular-nums'],
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    exerciseTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        paddingHorizontal: 20,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },

    // Card Area
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
    },
    activeCard: {
        width: '100%',
        flex: 1,
        backgroundColor: '#222',
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    restCard: {
        width: '100%',
        aspectRatio: 0.9,
        backgroundColor: '#0F172A', // Dark Blue bg
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 30,
    },
    restHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        opacity: 0.7,
    },
    restTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
        letterSpacing: 2,
    },
    restSubtitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 30,
    },
    // New Tips
    tipContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // Blue tint
        padding: 20,
        borderRadius: 16,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    tipText: {
        color: '#93C5FD', // Light blue text
        fontSize: 15,
        marginLeft: 10,
        lineHeight: 22,
        flex: 1,
    },
    prepTipContainer: {
        marginTop: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        maxWidth: '90%',
    },
    prepTipText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },

    gif: {
        width: '100%',
        height: '100%',
        backgroundColor: '#333',
    },
    noGifContainer: {
        flex: 1,
        backgroundColor: '#1a1a1a', // More subtle dark
        justifyContent: 'center',
        alignItems: 'center',
    },
    noGifText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay for better text read
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    pausedText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 36, // Bigger
        marginTop: 20,
        letterSpacing: 3,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    tapText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 10,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 30,
        height: 100,
    },
    playBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 10,
    },
    skipBtn: {
        position: 'absolute',
        right: 30,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    skipText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        marginRight: 4,
    },

    // Finished
    centerContent: {
        alignItems: 'center',
    },
    finishedTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        marginTop: 20,
    },
    finishedSubtitle: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 10,
    },
    exitBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        marginBottom: 50,
    },
    exitBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
});
