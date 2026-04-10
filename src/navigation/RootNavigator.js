import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import GoogleLoginScreen from '../screens/GoogleLoginScreen';
import SignupScreen from '../screens/SignupScreen';
import UsernameScreen from '../screens/UsernameScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QuizPlayScreen from '../screens/QuizPlayScreen';
import ResultsScreen from '../screens/ResultsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator({ user, needsUsername }) {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: '#0B1020' },
                    headerTintColor: '#EAF0FF',
                    contentStyle: { backgroundColor: '#0B1020' },
                }}
            >
                {!user ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Quiz App' }} />
                        <Stack.Screen name="GoogleLogin" component={GoogleLoginScreen} options={{ title: 'Google' }} />
                        <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Create account' }} />
                    </>
                ) : (
                    <>
                        {needsUsername ? (
                            <Stack.Screen
                                name="Username"
                                component={UsernameScreen}
                                options={{ title: 'Choose Username', headerBackVisible: false }}
                            />
                        ) : null}
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{ title: 'Quiz App' }}
                        />
                        <Stack.Screen name="QuizPlay" component={QuizPlayScreen} options={{ title: 'Quiz' }} />
                        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Results' }} />
                        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Leaderboard' }} />
                        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
                        <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: 'Quest Pass' }} />
                        <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
