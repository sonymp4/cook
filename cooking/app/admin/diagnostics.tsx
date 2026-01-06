import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function DiagnosticsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [logs, setLogs] = useState<string[]>([]);
    const [testResults, setTestResults] = useState<any>(null);

    const log = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    const runDiagnostics = async () => {
        setLogs([]);
        setTestResults(null);
        log("🚀 Starting Diagnostics...");

        try {
            // 1. Check User Context
            log(`👤 User Context: ${user ? 'Logged In' : 'Null'}`);
            if (user) {
                log(`   ID: ${user._id}`);
                log(`   Email: ${user.email}`);
                log(`   Role: ${user.role || 'undefined'}`);
            }

            // 2. Test Public API
            log("📡 Testing Public API...");
            const health = await api.get('/recipes?_limit=1'); // Just meaningful endpoint
            if (health.success) {
                log("✅ Public API: OK");
            } else {
                log(`❌ Public API Failed: ${health.error}`);
            }

            // 3. Test Protected Admin API
            log("🛡️ Testing Admin Access...");
            // We'll try to fetch users or something restricted, or just verify capability
            try {
                // Assuming we can just fetch recipes as a proxy for connection, 
                // but let's try to hit the create endpoint with invalid data to force a middleware check
                // or simpler: just list recipes is public.
                // Let's rely on the user role log above for now.
                if (user?.role === 'admin') {
                    log("✅ Client thinks you are ADMIN");
                } else {
                    log("⚠️ Client thinks you are NOT ADMIN");
                }
            } catch (e) {
                log("❌ Admin Check Failed");
            }

            // 4. Fetch Recent Recipes
            log("🍳 Fetching Recent Recipes...");
            const recipesRes = await api.get<any[]>('/recipes?_t=' + Date.now());
            if (recipesRes.success && recipesRes.data) {
                log(`✅ Fetched ${recipesRes.data.length} recipes`);
                setTestResults(recipesRes.data.slice(0, 5)); // Show top 5
            } else {
                log("❌ Failed to fetch recipes");
            }

        } catch (error: any) {
            log(`💥 CRITICAL ERROR: ${error.message}`);
        }
    };

    useFocusEffect(
        useCallback(() => {
            runDiagnostics();
        }, [])
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🛠️ System Diagnostics</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>status Log</Text>
                    <View style={styles.logBox}>
                        {logs.map((L, i) => <Text key={i} style={styles.logText}>{L}</Text>)}
                    </View>
                </View>

                {testResults && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Database Entries</Text>
                        {testResults.map((r: any) => (
                            <View key={r._id} style={styles.resultItem}>
                                <Text style={styles.resName}>{r.name}</Text>
                                <Text style={styles.resMeta}>ID: {r._id}</Text>
                                <Text style={styles.resMeta}>Role: {r.category} | Cal: {r.totalCalories}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity style={styles.runBtn} onPress={runDiagnostics}>
                    <Text style={styles.runBtnText}>Rerun Diagnostics</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
    title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    closeBtn: { padding: 8, backgroundColor: '#333', borderRadius: 8 },
    closeText: { color: '#fff' },
    content: { padding: 20 },
    section: { marginBottom: 30 },
    sectionTitle: { color: '#4ADE80', fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
    logBox: { backgroundColor: '#111', padding: 15, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#4ADE80' },
    logText: { color: '#ddd', fontSize: 14, marginBottom: 5, fontFamily: 'monospace' },
    resultItem: { backgroundColor: '#222', padding: 15, borderRadius: 8, marginBottom: 10 },
    resName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    resMeta: { color: '#888', fontSize: 12 },
    runBtn: { backgroundColor: '#2563EB', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 50 },
    runBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
