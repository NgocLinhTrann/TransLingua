const XLSX = require('xlsx');
const path = require('path');

// Sample vocabulary data
const data = [
    {
        "Word": "学习",
        "Meaning": "Học tập (Study/Learn)",
        "Pronunciation": "xué xí",
        "Part of Speech": "Verb",
        "Notes": "Essential daily verb. Example: 我喜欢学习汉语 (I like studying Chinese)."
    },
    {
        "Word": "电脑",
        "Meaning": "Máy tính (Computer)",
        "Pronunciation": "diàn nǎo",
        "Part of Speech": "Noun",
        "Notes": "Literal meaning: electric brain."
    },
    {
        "Word": "朋友",
        "Meaning": "Bạn bè (Friend)",
        "Pronunciation": "péng you",
        "Part of Speech": "Noun",
        "Notes": "Can be combined, e.g., 好朋友 (good friend)."
    },
    {
        "Word": "漂亮",
        "Meaning": "Đẹp (Beautiful/Pretty)",
        "Pronunciation": "piào liang",
        "Part of Speech": "Adjective",
        "Notes": "Used to describe people, places, or things."
    },
    {
        "Word": "高兴",
        "Meaning": "Vui vẻ (Happy/Glad)",
        "Pronunciation": "gāo xìng",
        "Part of Speech": "Adjective",
        "Notes": "Example: 很高兴认识你 (Nice to meet you)."
    }
];

// Create a new workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(wb, ws, "Vocabulary List");

// Define output path
const outputPath = path.join(__dirname, '..', '..', 'sample_vocabulary.xlsx');

// Write workbook to file
XLSX.writeFile(wb, outputPath);
console.log(`Successfully generated sample Excel at: ${outputPath}`);
