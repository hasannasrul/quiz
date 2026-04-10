#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function fail(message) {
    console.error(`\n[import-questions] ${message}\n`);
    process.exit(1);
}

function loadJson(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

function parseCsvLine(line) {
    const cells = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            cells.push(current);
            current = '';
            continue;
        }

        current += char;
    }

    cells.push(current);
    return cells;
}

function loadCsv(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) fail('CSV file must include a header row and at least one data row.');

    const headers = parseCsvLine(lines[0]).map((header) => header.trim());
    return lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        return headers.reduce((acc, header, index) => {
            acc[header] = values[index] ?? '';
            return acc;
        }, {});
    });
}

function loadQuestions(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.json') return loadJson(filePath);
    if (ext === '.csv') return loadCsv(filePath);
    fail('Only .json and .csv files are supported.');
}

function normalizeQuestions(input) {
    if (!Array.isArray(input)) fail('Input file must contain a JSON array of question objects.');

    return input.map((item, index) => {
        let options = [];
        if (Array.isArray(item.options)) {
            options = item.options;
        } else if (typeof item.options === 'string') {
            options = item.options.split('|').map((value) => value.trim()).filter(Boolean);
        } else {
            options = [item.optionA, item.optionB, item.optionC, item.optionD]
                .map((value) => String(value || '').trim())
                .filter(Boolean);
        }

        const question = {
            text: String(item.text || '').trim(),
            options,
            correctIndex: Number(item.correctIndex),
            category: String(item.category || '').trim(),
            categoryId: String(item.categoryId || '').trim(),
            subCategory: String(item.subCategory || '').trim(),
            difficulty: String(item.difficulty || 'easy').trim().toLowerCase(),
            explanation: String(item.explanation || '').trim(),
            roast: String(item.roast || '').trim(),
            imageUrl: String(item.imageUrl || '').trim(),
        };

        if (!question.text) fail(`Question #${index + 1} is missing text.`);
        if (question.options.length < 2) fail(`Question #${index + 1} must have at least 2 options.`);
        if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.options.length) {
            fail(`Question #${index + 1} has invalid correctIndex.`);
        }
        if (!question.category) fail(`Question #${index + 1} is missing category.`);
        if (!question.categoryId) fail(`Question #${index + 1} is missing categoryId.`);
        if (!question.subCategory) fail(`Question #${index + 1} is missing subCategory.`);

        return question;
    });
}

async function main() {
    const inputArg = process.argv[2];
    const mode = process.argv[3] || '--merge';

    if (!inputArg) {
        fail('Usage: node scripts/import-questions.js <path-to-json-or-csv> [--merge|--replace]');
    }

    const inputPath = path.resolve(process.cwd(), inputArg);
    if (!fs.existsSync(inputPath)) fail(`Input file not found: ${inputPath}`);

    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    }

    const db = admin.firestore();
    const questions = normalizeQuestions(loadQuestions(inputPath));

    if (mode === '--replace') {
        const existing = await db.collection('Questions').select().get();
        let batch = db.batch();
        let counter = 0;
        for (const doc of existing.docs) {
            batch.delete(doc.ref);
            counter += 1;
            if (counter === 400) {
                await batch.commit();
                batch = db.batch();
                counter = 0;
            }
        }
        if (counter > 0) await batch.commit();
    }

    let batch = db.batch();
    let counter = 0;

    for (const question of questions) {
        const ref = db.collection('Questions').doc();
        batch.set(ref, {
            ...question,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        counter += 1;

        if (counter === 400) {
            await batch.commit();
            batch = db.batch();
            counter = 0;
        }
    }

    if (counter > 0) await batch.commit();

    console.log(`[import-questions] Imported ${questions.length} questions from ${path.basename(inputPath)}.`);
}

main().catch((error) => {
    if (error?.code === 5 || String(error?.message || '').includes('NOT_FOUND')) {
        fail(
            'Firestore database was not found for this Firebase project. Open Firebase Console -> Build -> Firestore Database and create the database first, then rerun the import.'
        );
    }
    fail(error.message || String(error));
});
