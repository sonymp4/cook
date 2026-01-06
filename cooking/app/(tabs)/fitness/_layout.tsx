import { Stack } from 'expo-router';

export default function FitnessLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Fitness & Nutrition',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="workout/[id]"
                options={{
                    title: 'Workout Details',
                    headerBackTitle: 'Back'
                }}
            />
        </Stack>
    );
}
