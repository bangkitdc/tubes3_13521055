import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongoDB } from "@/lib/mongodb";
import QnA from "@/models/qna";
import mongoose from "mongoose";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  connectToMongoDB().catch((err) => res.json(err));

  if (req.method === "POST") {
    if (!req.body) {
      return res.status(400).json({ error: "Data is missing" });
    }
    const { question, answer } = req.body;

    if (question.length < 1) {
    return res
        .status(409)
        .json({ error: "Question should be at least 1 characters long" });
    }

    const messageExists = await QnA.findOne({ question });
    try {
        if (messageExists) {
            messageExists.answer = answer;
            await messageExists.save();
            const message = messageExists;

            return res.status(200).json({
                success: true,
                message,
            });
        } else {
            const createdQnA = await QnA.create({
                question,
                answer
            });

            const message = {
                question: createdQnA.question,
                answer: createdQnA.answer,
                _id: createdQnA._id,
            };

            return res.status(201).json({
                success: true,
                message,
            });
        }
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            for (let field in error.errors) {
            const msg = error.errors[field].message;

            return res.status(409).json({ error: msg });
            }
        }

        return res.status(500).json({ error: error });
    }
  } else if (req.method === "GET") {
    try {
        const string : string = req.query.string as string; // question from user
        const algo : string = req.query.algo as string;

        const qnas = await QnA.find(); // data from database
        
        const [method, ret] = getOutput(string, qnas, algo);
        // METHOD
        // none: kalkulator, tanggal, hapus tapi tidak ditemukan
        // get: searchdatabase
        // delete
        // add
        // update
        
        if (method === "add" || method === "update") {
            const regTambah = /^(tambahkan pertanyaan|tambah pertanyaan|tambahkan|tambah)\s(.+?)\s(dengan jawaban|jawaban|jawab)\s(.+)$/i;
            let question = ret.question;
            let answer = ret.answer;
            const exec = regTambah.exec(question);
            if (exec) {
                question = exec[2];
                answer = exec[4];
            }

            if (question.length < 1) {
                return res
                    .status(409)
                    .json({ error: "Question should be at least 1 characters long" });
            }

            let messageExists;
            const qnas = await QnA.find();
            if (method === "update") {
                for (const obj of qnas) {
                    const que: string = obj.question.toLowerCase().replace(/[^\w\s]|_/g, '');
                    if (matchPattern(algo, question, que)) {
                        messageExists = obj;
                    }
                }
            }


            if (messageExists) { // if exist, update instead
                messageExists.question = question;
                messageExists.answer = answer;
                await messageExists.save();
            } else {
                await QnA.create({
                    question,
                    answer
                });
            }
        } else if (method === "delete") {
            const regHapus = /^(hapus pertanyaan|hapus) (.+)$/i;
            
            let question = ret.question;
            const execDel = regHapus.exec(question);
            
            if (execDel) {
                question = execDel[2].toLowerCase().replace(/[^\w\s]|_/g, '');
            }
            
            let id:string = "";

            const qnas = await QnA.find();
            for (const obj of qnas) {
                const que: string = obj.question.toLowerCase().replace(/[^\w\s]|_/g, '');
                if (matchPattern(algo, question, que)) {
                    id = obj._id;
                }
            }

            const messageExists = await QnA.findOne({ _id: id });

            if (messageExists) { // if exist, delete
                await messageExists.deleteOne();
            }
        }

        return res.status(200).json({
            success: true,
            ret
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
          for (let field in error.errors) {
            const msg = error.errors[field].message;

            return res.status(409).json({ error: msg });
          }
        }
        return res.status(500).json({ error: error });
    }
  } else {
    res.status(405).json({ error: "Method's not allowed" });
  }
};



interface QAObject {
    _id: string;
    question: string;
    answer: string;
    __v: number;
}

// FUNGSI SEARCH DATABASE
function searchDatabase(query: string, data: QAObject[], algo: string): QAObject {
    let result: QAObject = { _id: "", question: query, answer: "", __v: 0 };
    let bestMatch: QAObject | undefined, exactMatch: QAObject | undefined;

    // assign maxScore 90%, yaitu kemiripan minimal
    let maxScore: number = 90;

    // ubah query menjadi lowercase dan hilangkan karakter yang tidak dibutuhkan
    query = query.toLowerCase().replace(/[^\w\s]|_/g, '');

    
    for (const obj of data) {
        // inisiasi question menjadi lowercase dan hilangkan karakter yang tidak dibutuhkan
        const question: string = obj.question.toLowerCase().replace(/[^\w\s]|_/g, '');

        // jika pertanyaan cocok dengan pola, maka assign object sebagai exactmatch
        if (matchPattern(algo, question, query)) {
            exactMatch = obj;
            break;
        }

        // hitung persentase kesamaan pertanyaan
        const score: number = similarityPercentage(query, question);

        // reassign maxscore dan bestmatch jika score >= maxScore
        if (score >= maxScore) {
            maxScore = score;
            bestMatch = obj;
        }
    }

    // simpan result berdasarkan match yang ditemukan
    if (exactMatch) {
        result = exactMatch;
    } else if (bestMatch) {
        result = bestMatch;
    } else {
        // jika tidak ditemukan bestmatch, berikan 3 pertanyaan termirip sebagai answer
        const sortedResults: QAObject[] = data.sort((a: QAObject, b: QAObject) => similarityPercentage(query, b.question) - similarityPercentage(query, a.question));
        const top3: QAObject[] = sortedResults.slice(0, 3);
        result.answer = `Pertanyaan tidak ditemukan. Mungkin maksud anda: ${top3.map((obj, i) => `\n${i + 1}. ${obj.question}`).join('')}`;
    }

    return result;
}


// Melakukan match pattern berdasar algoritma parameter
function matchPattern(algo: string, pattern: string, text: string): boolean {
    if (algo == 'kmp') {
        return kmpMatch(pattern, text);
    }
    if (algo == 'bm') {
        return bmMatch(pattern, text);
    }
    throw new Error('Algoritma pencocokan tidak dikenali');
}

// KMP
function kmpMatch(pattern: string, text: string): boolean {
    // inisiasi variabel dan array
    // n: panjang pattern, m: panjang text, lps: array penyimpan nilai
    const n: number = pattern.length;
    const m: number = text.length;
    const lps: number[] = computeLPS(pattern);

    // i: pointer text, j: pointer pattern
    let i: number = 0;
    let j: number = 0;

    // melakukan pencarian pattern pada text
    while (i < m) {

        // increment i,j jika pattern[j] == text[i]
        if (pattern[j] === text[i]) {
            i++;
            j++;
        }

        // seluruh karakter text sama dengan pattern
        if (j === n) {
            return true;
        } 
        // Jika pattern[j] != text[i]
        else if (i < m && pattern[j] !== text[i]) {
            // Menggeser pointer j ke index pada pattern yang sebelumnya memiliki nilai LPS yang sama 
            // dengan nilai LPS pada index j saat ini
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    // return false
    return false;
};

function computeLPS(pattern: string): number[] {
    // inisiasi variabel
    const n: number = pattern.length;
    const lps: number[] = new Array(n).fill(0);
    let len: number = 0;
    let i: number = 1;

    while (i < n) {
        // jika karakter cocok, increment len dan simpan nilainya di index
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } 
        // karakter tidak cocok
        else {
            // update len menjadi value lps dari index sebelumnya jika len != 0
            if (len !== 0) {
                len = lps[len - 1];
            } 
            // set lps menjadi 0 jika len == 0
            else {
                lps[i] = 0;
                i++;
            }
        }
    }
    return lps;
}

// BM
function bmMatch(pattern: string, text: string): boolean {
    // inisiasi variabel
    const n: number = text.length;
    const m: number = pattern.length;

    // object untuk menyimpan indeks dari setiap karakter terakhir pada pattern
    const last: {[key: string]: number} = {};
    for (let i: number = 0; i < m; i++) {
        last[pattern[i]] = i;
    }

    // return false jika panjang pattern > panjang teks
    let i: number = m - 1;
    if (i > n - 1) {
        return false;
    }


    let j: number = m - 1;
    while (i <= n - 1) {
        // jika karakter pada pattern sama dengan karakter pada teks pada indeks yang sama
        if (pattern[j] === text[i]) {
            // jika j == 0, artinya pattern sudah ditemukan, return true
            if (j === 0) {
                return true;
            }
            i--;
            j--;
        } else {
            // mencari indeks karakter terakhir pada pattern yang sama dengan karakter pada teks pada indeks i
            // Jika tidak ditemukan, indeksnya -1.
            const lastChar: number = last[text[i]] || -1;
            i = i + m - Math.min(j, 1 + lastChar);
            j = m - 1;
        }
    }
    return false;
}

// Fungsi mencari jarak perbedaan antara 2 string
function levenshteinDistance(s: string, t: string): number {
    // inisialisasi matriks dengan ukuran (s.length + 1) x (t.length + 1)
    const d: number[][] = [];
    for (let i = 0; i <= s.length; i++) {
        d[i] = [];
        for (let j = 0; j <= t.length; j++) {
            d[i][j] = 0;
        }
        d[i][0] = i;
    }
    for (let j = 0; j <= t.length; j++) {
        d[0][j] = j;
    }

    // menghitung jarak Levenshtein
    for (let j = 1; j <= t.length; j++) {
        for (let i = 1; i <= s.length; i++) {
            const cost = (s[i - 1] === t[j - 1]) ? 0 : 1;
            d[i][j] = Math.min(
                d[i - 1][j] + 1,  // penghapusan karakter di s
                d[i][j - 1] + 1,  // penambahan karakter di s
                d[i - 1][j - 1] + cost  // substitusi karakter di s
            );
        }
    }

    // mengembalikan jarak Levenshtein antara s dan t
    return d[s.length][t.length];
}

// Fungsi untuk mencari persentase kemiripan menggunakan levenshtein
function similarityPercentage(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }

    const distance = levenshteinDistance(longer, shorter);
    return (1.0 - distance / longerLength) * 100;
}


// FITUR TANGGAL
function getDayFromDate(input: string): string {
    const days =    ['Minggu', 'Senin', 'Selasa',                 
                    'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months =  [' Januari ', ' Februari ', ' Maret ', ' April ',
                    ' Mei ', ' Juni ', ' Juli ', ' Agustus ',
                    ' September ', ' Oktober ', ' November ', ' Desember '];

    const parts = input.split(/[\/\-\s]+/);

    let year = parseInt(parts[2], 10);
    if (year < 100) {
        year += year < 50 ? 2000 : 1901;
    }
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[0], 10);
    
    if (!validateDate(day, month+1, year)) {
        return "Tanggal tidak valid";
    }

    // Algoritma Zeller's Congruence
    let h: number, d: number, m: number, y: number, k: number, j: number;
    d = day;
    m = month + 1;
    y = year;
    if (m < 3) {
        m += 12;
        y--;
    }
    k = y % 100;
    j = Math.floor(y / 100);
    h = (d + Math.floor((13 * (m + 1)) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) + 5 * j - 1) % 7;

    const msg = parts[0] + months[month] + year.toString() + " adalah Hari " + days[h];

    return msg;
}

// VALIDASI TANGGAL
function validateDate(date: number, month: number, year: number): boolean {
    if (month < 1 || month > 12) {
        return false;
    }

    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const maxDays = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return date > 0 && date <= maxDays[month - 1];
}

// FITUR KALKULATOR
function calculateMathExpression(expression: string): number | undefined {
    const stack: number[] = [];
    const operators: string[] = [];

    const precedence: { [key: string]: number } = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        '^': 3,
    };

    const evaluateExpression = (operator: string | undefined, operand1: number | undefined, operand2: number | undefined) => {
        if (operator == undefined || operand1 == undefined || operand2 == undefined) {
            return undefined;
        }
        let result = 0;
    
        switch (operator) {
            case '+':
                result = operand1 + operand2;
                break;
            case '-':
                result = operand2 - operand1;
                break;
            case '*':
                result = operand1 * operand2;
                break;
            case '/':
                if (operand1 == 0) return undefined;
                result = operand2 / operand1;
                break;
            case '^':
                result = Math.pow(operand2, operand1);
                break;
        }
    
        stack.push(result);
    };

    for (let i = 0; i < expression.length; i++) {
        const token = expression[i];
    
        if (/[\d\.]/.test(token)) {
            let number = token;
            while (/[\d\.]/.test(expression[i + 1])) {
                i++;
                number += expression[i];
            }
            stack.push(parseFloat(number));
        } else if (token === '(') {
            operators.push(token);
        } else if (token === ')') {
            while (operators[operators.length - 1] !== '(') {
                evaluateExpression(operators.pop(), stack.pop(), stack.pop());
            }
            operators.pop();
        } else if (/[\+\-\*\/\^]/.test(token)) {
            const currentPrecedence = precedence[token];
            while (operators.length > 0 && operators[operators.length - 1] !== '(' && currentPrecedence <= precedence[operators[operators.length - 1]]) {
                evaluateExpression(operators.pop(), stack.pop(), stack.pop());
            }
            operators.push(token);
        }
    }

    while (operators.length > 0) {
        evaluateExpression(operators.pop(), stack.pop(), stack.pop());
    }

    if (stack[0] != parseFloat(stack[0].toFixed(4))) {
        stack[0] = parseFloat(stack[0].toFixed(4));
    }
    return stack[0];
}

// validasi persamaan matematika
function validateMathExpression(expression: string): boolean {
    const mathRegex = /(\d+(\.\d+)?|\([^\(\)]*\))(?:\s*[\+\-\*\/\^]\s*(\d+(\.\d+)?|\([^\(\)]*\)))*/;
    // Cari indeks kurung buka pertama
    let openIndex = expression.indexOf('(');

    // Jika tidak ditemukan, langsung validasi menggunakan regex
    if (openIndex === -1) {
        return mathRegex.test(expression);
    }

    // Cari indeks kurung tutup yang berpasangan dengan kurung buka pertama
    let closeIndex = -1;
    let openCount = 1;
    for (let i = openIndex + 1; i < expression.length; i++) {
        if (expression[i] === '(') {
            openCount++;
        } else if (expression[i] === ')') {
            openCount--;
            if (openCount === 0) {
                closeIndex = i;
                break;
            }
        }
    }

    // Jika tidak ditemukan kurung tutup yang berpasangan, invalid
    if (closeIndex === -1) {
        return false;
    }

    // Validasi substring di antara kurung, lalu rekursi untuk substring sebelum dan setelahnya
    const insideParentheses = expression.slice(openIndex + 1, closeIndex);
    const isValidInside = validateMathExpression(insideParentheses);
    return isValidInside && mathRegex.test(expression);
}

// NGECEK PERTANYAAN ADA DALAM DATABASE ATAU TIDAK
function checkExist(que: string, data: QAObject[], algo: string): string | undefined {
    que = que.toLowerCase().replace(/[^\w\s]|_/g, '');
    for (const obj of data) {
        const question: string = obj.question.toLowerCase().replace(/[^\w\s]|_/g, '');
        if (matchPattern(algo, question, que)) {
            return obj.question;
        }
    }
}



// FUNGSI UTAMA
function getOutput(input: string, data: QAObject[], algo: string): [string, QAObject] {

    // regex untuk menentukan format pertanyaan
    const regTanggal = /\b\d{1,2}[\/\-\ ]\d{1,2}[\/\-\ ]\d{2}(?:\d{2})?\b/;
    const matchTanggal = input.match(regTanggal);
    const regCekMat = /\d+\s*[\+\-\*\/\^\(\)]\s*\d+/;
    const regMat = /(\d+(\.\d+)?|\([^\(\)]*\))(?:\s*[\+\-\*\/\^]\s*(\d+(\.\d+)?|\([^\(\)]*\)))*/;
    const regTambah = /^(tambahkan pertanyaan|tambah pertanyaan|tambahkan|tambah)\s(.+?)\s(dengan jawaban|jawaban|jawab)\s(.+)$/i;
    const matchTambah = regTambah.exec(input);
    const regHapus = /^(hapus pertanyaan|hapus) (.+)$/i;
    const matchHapus = regHapus.exec(input);

    // inisiasi return object
    let result: QAObject = { _id: "", question: input, answer: "", __v: 0 };
    let method: string;

    // input format tanggal
    if (matchTanggal) {
        method = "none";
        result.answer = getDayFromDate(matchTanggal[0]);
    } 

    // input format kalkulator
    else if (regCekMat.test(input)) {
        method = "none";
        const matchMat = input.replace(/[^0-9+\-*/().\^]/g,"").match(regMat);
        
        if (matchMat) {
            if (!validateMathExpression(matchMat[0])) {
                result.answer = "Sintaks persamaan tidak valid"
            }
            else {
                // kalkulasi ekspresi jika sintaks valid
                const res = calculateMathExpression(matchMat[0]);
                let msg = "Hasil dari " + matchMat[0].replace(/\s+/g, "") + " adalah ";
                if (res == undefined) {
                    msg +=  "tidak terdefinisi";
                }
                else {
                    msg += res.toString();
                }
                result.answer = msg;
            }
            
        }
    } 
    
    // input format tambah pertanyaan
    else if (matchTambah) {
        const qAdd: string = matchTambah[2];
        const aAdd: string = matchTambah[4];
        const que = checkExist(qAdd, data, algo);

        // update jawaban jika pertanyaan sudah ada
        if (que) {
            method = "update";
            result.answer = "Pertanyaan \"" + que + "\" sudah ada! jawaban diupdate ke \"" + aAdd + "\"";
        } 
        // tambah pertanyaan dan jawaban jika pertanyaan belum ada
        else {
            method = "add";
            result.answer = "Pertanyaan \"" + qAdd + "\" telah ditambahkan!";
        }
    } 
    
    // input format hapus pertanyaan
    else if (matchHapus) {
        method = "delete";
        const qDel: string = matchHapus[2];
        const que = checkExist(qDel, data, algo);
        // hapus pertanyaan jika terdapat dalam database
        if (que) {
            method = "delete";
            result.answer = "Pertanyaan \"" + que + "\" telah dihapus!";
        }
        else {
            method = "none";
            result.answer = "Pertanyaan \"" + qDel + "\" tidak ada dalam database!";
        }
        
    }

    // input format pertanyaan dari database
    else {
        method = "get";
        result = searchDatabase(input, data, algo);
    }

    // return method serta result
    return [method, result];
}


export default handler;