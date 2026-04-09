import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../config/theme';
import QuestionCard from '../components/QuestionCard';
import AnswerButton from '../components/AnswerButton';
import RoastPopup from '../components/RoastPopup';
import { fetchQuestions, getQuestionTimeLimitSeconds, getQuizCount } from '../services/quiz';
import { computePoints } from '../utils/scoring';
import { getCategoryById } from '../config/categories';

const MODE_LABELS = {
    daily: 'Daily Quiz',
    category: 'Category Run',
    practice: 'Practice Mode',
    adventure: 'Adventure Mode',
};

export default function QuizPlayScreen({ navigation, route }) {
    const { mode = 'daily', categoryId = 'history', subCategoryId = null } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [lives, setLives] = useState(mode === 'daily' ? 3 : 3);
    const [selected, setSelected] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState('');
    const [popupBody, setPopupBody] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(null);
    const timerRef = useRef(null);

    const timeLimit = useMemo(() => getQuestionTimeLimitSeconds(mode), [mode]);
    const quizCount = useMemo(() => getQuizCount(mode), [mode]);
    const category = useMemo(() => getCategoryById(categoryId), [categoryId]);

    const current = questions[index];

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setLoadError('');
                const qs = await fetchQuestions({ categoryId, subCategoryId, count: quizCount, mode });
                if (!mounted) return;
                setQuestions(qs);
                setIndex(0);
                setScore(0);
                setStreak(0);
                setSelected(null);
                setLives(mode === 'daily' ? 3 : 3);
            } catch (e) {
                if (mounted) {
                    setQuestions([]);
                    setLoadError(e?.message || 'Failed to load questions');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [mode, categoryId, subCategoryId, quizCount]);

    useEffect(() => {
        // Timer
        if (!timeLimit) {
            setSecondsLeft(null);
            return;
        }
        setSecondsLeft(timeLimit);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setSecondsLeft((s) => {
                if (s === null) return null;
                if (s <= 1) return 0;
                return s - 1;
            });
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [index, timeLimit]);

    useEffect(() => {
        if (!timeLimit) return;
        if (secondsLeft === 0 && selected === null && current) {
            onAnswer(-1);
        }
    }, [secondsLeft, selected, current, timeLimit]);

    function nextOrFinish(finalScore) {
        const nextIndex = index + 1;
        if (nextIndex >= questions.length) {
            navigation.replace('Results', {
                score: finalScore,
                mode,
                categoryId,
                categoryName: category?.name || 'Mixed',
                subCategoryId,
                total: questions.length,
            });
            return;
        }
        setIndex(nextIndex);
        setSelected(null);
    }

    function showExplanation(isCorrect) {
        if (!current) return;
        const title = isCorrect ? 'Correct!' : 'Wrong!';
        const body = isCorrect
            ? current.explanation || 'Nice work. Keep going.'
            : `${current.roast || 'Oof.'}\n\nExplanation: ${current.explanation || 'No explanation yet.'}`;
        setPopupTitle(title);
        setPopupBody(body);
        setShowPopup(true);
    }

    function onAnswer(choiceIndex) {
        if (!current) return;
        if (selected !== null) return;
        setSelected(choiceIndex);

        const isCorrect = choiceIndex === current.correctIndex;
        const nextStreak = isCorrect ? streak + 1 : 0;
        const gained = computePoints({ isCorrect, streak: nextStreak });
        const nextScore = score + gained;

        setStreak(nextStreak);
        setScore(nextScore);

        if (!isCorrect) {
            const nextLives = lives - 1;
            setLives(nextLives);
            if (nextLives <= 0) {
                showExplanation(false);
                return;
            }
        }

        showExplanation(isCorrect);
    }

    function onClosePopup() {
        setShowPopup(false);
        if (lives <= 0) {
            navigation.replace('Results', {
                score,
                mode,
                categoryId,
                categoryName: category?.name || 'Mixed',
                subCategoryId,
                total: questions.length || 10,
            });
            return;
        }
        nextOrFinish(score);
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={styles.muted}>Loading questions…</Text>
            </View>
        );
    }

    if (!current) {
        return (
            <View style={styles.center}>
                <Text style={styles.muted}>No questions available yet.</Text>
                {!!loadError && <Text style={styles.error}>{loadError}</Text>}
                <Text style={styles.help}>
                    Add questions into Firestore (collection: Questions) or expand the bundled sample bank.
                </Text>
                <Text style={styles.help}>Required fields: text, options[4], correctIndex, category, categoryId, subCategory.</Text>
            </View>
        );
    }

    const showTimer = timeLimit && secondsLeft !== null;

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.topText}>{MODE_LABELS[mode] || 'Quiz'}</Text>
                <Text style={styles.topText}>Score: {score}</Text>
                <Text style={styles.topText}>Lives: {lives}</Text>
                {showTimer ? <Text style={styles.topText}>⏱ {secondsLeft}s</Text> : <Text style={styles.topText}>Practice</Text>}
            </View>

            <QuestionCard
                question={current}
                metaText={`${index + 1}/${questions.length} • ${category?.name || current.category} • ${subCategoryId || current.subCategory}`}
            />

            {current.options.map((opt, i) => {
                const variant =
                    selected === null
                        ? 'default'
                        : i === current.correctIndex
                            ? 'correct'
                            : selected === i
                                ? 'wrong'
                                : 'default';

                return (
                    <AnswerButton
                        key={`${current.id}:${i}`}
                        text={opt}
                        onPress={() => onAnswer(i)}
                        disabled={selected !== null}
                        variant={variant}
                    />
                );
            })}

            <RoastPopup visible={showPopup} title={popupTitle} body={popupBody} onClose={onClosePopup} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    topText: {
        color: theme.colors.muted,
        fontWeight: '800',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
        gap: 10,
    },
    muted: {
        color: theme.colors.muted,
    },
    error: {
        color: theme.colors.danger,
        marginTop: 8,
        textAlign: 'center',
    },
    help: {
        color: theme.colors.muted,
        textAlign: 'center',
        lineHeight: 18,
    },
});
