// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD36JBSE7fD6gMcSy5TZLGPnPexrhE91Wo",
    authDomain: "loginapp-ee061.firebaseapp.com",
    projectId: "loginapp-ee061",
    storageBucket: "loginapp-ee061.firebasestorage.app",
    messagingSenderId: "21230356454",
    appId: "1:21230356454:web:783fda72a0ed35a47fb827",
    measurementId: "G-BNL0XVCR7N"
};

import { Platform } from "react-native";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let auth: any;

if (Platform.OS === 'web') {
    // Web uses browser session persistence by default when using getAuth()
    // or explicit browserLocalPersistence with initializeAuth
    const { getAuth } = require('firebase/auth');
    auth = getAuth(app);
} else {
    // Native (Android/iOS) requires AsyncStorage adapter
    if (getReactNativePersistence) {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
    } else {
        // Fallback if import fails (rare on native, but safe)
        const { getAuth } = require('firebase/auth');
        auth = getAuth(app);
        console.warn("getReactNativePersistence not found, falling back to default persistence");
    }
}

export { app, auth };
