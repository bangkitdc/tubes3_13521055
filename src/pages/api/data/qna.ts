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

    const messageExists = await QnA.findOne({ question });

    if (question.length < 1) {
    return res
        .status(409)
        .json({ error: "Question should be at least 1 characters long" });
    }
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
    let result: QAObject = { _id: "", question: "", answer: "", __v: 0 };
    let maxScore: number = 90;
    let bestMatch: QAObject | undefined, exactMatch: QAObject | undefined;
    const q = query;
    query = query.toLowerCase().replace(/[^\w\s]|_/g, '');
    // console.log(query);

    for (const obj of data) {
        const question: string = obj.question.toLowerCase().replace(/[^\w\s]|_/g, '');
        if (matchPattern(algo, question, query)) {
            exactMatch = obj;
            maxScore = 100;
            break;
        }

        const score: number = similarityPercentage(query, question);
        if (score >= maxScore) {
            maxScore = score;
            bestMatch = obj;
        }
    }

    if (exactMatch) {
        result = exactMatch;
    } else if (bestMatch) {
        result = bestMatch;
    } else {
        const sortedResults: QAObject[] = data.sort((a: QAObject, b: QAObject) => similarityPercentage(query, b.question) - similarityPercentage(query, a.question));
        const top3: QAObject[] = sortedResults.slice(0, 3);
        result.question = q;
        result.answer = `Pertanyaan tidak ditemukan. Mungkin maksud anda: ${top3.map(obj => `\n${obj.question}`).join('')}`;
    }

    return result;
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


// FUNGSI BUAT KMP / BM
function matchPattern(algo: string, pattern: string, text: string): boolean {
  if (algo == 'kmp') {
      return kmpMatch(pattern, text);
  }
  if (algo == 'bm') {
      return bmMatch(pattern, text);
  }
  throw new Error('Algoritma pencocokan tidak dikenali');
}

function kmpMatch(pattern: string, text: string): boolean {
  const n: number = pattern.length;
  const m: number = text.length;
  const lps: number[] = computeLPS(pattern);
  let i: number = 0;
  let j: number = 0;
  while (i < m) {
      if (pattern[j] === text[i]) {
          i++;
          j++;
      }
      if (j === n) {
          return true;
      } else if (i < m && pattern[j] !== text[i]) {
          if (j !== 0) {
              j = lps[j - 1];
          } else {
              i++;
          }
      }
  }
  return false;
};

function computeLPS(pattern: string): number[] {
  const n: number = pattern.length;
  const lps: number[] = new Array(n).fill(0);
  let len: number = 0;
  let i: number = 1;
  while (i < n) {
      if (pattern[i] === pattern[len]) {
          len++;
          lps[i] = len;
          i++;
      } else {
          if (len !== 0) {
              len = lps[len - 1];
          } else {
              lps[i] = 0;
              i++;
          }
      }
  }
  return lps;
}

function bmMatch(pattern: string, text: string): boolean {
  const n: number = text.length;
  const m: number = pattern.length;
  const last: {[key: string]: number} = {};
  for (let i: number = 0; i < m; i++) {
      last[pattern[i]] = i;
  }
  let i: number = m - 1;
  if (i > n - 1) {
      return false;
  }
  let j: number = m - 1;
  while (i <= n - 1) {
      if (pattern[j] === text[i]) {
          if (j === 0) {
          return true;
          }
          i--;
          j--;
      } else {
          const lastChar: number = last[text[i]] || -1;
          i = i + m - Math.min(j, 1 + lastChar);
          j = m - 1;
      }
  }
  return false;
}

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

function similarityPercentage(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  const longerLength = longer.length;
  const shorterLength = shorter.length;
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
    const date = new Date(year, month, day);

    // Algoritma Zeller's Congruence
    let h: number, q: number, m: number, k: number, j: number;
    q = day;
    m = month + 1;
    if (m < 3) {
        m += 12;
        year--;
    }
    k = year % 100;
    j = Math.floor(year / 100);
    h = (q + Math.floor((13 * (m + 1)) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) + 5 * j - 1) % 7;

    const msg = parts[0] + months[month] + year.toString() + " adalah Hari " + days[h];

    return msg;
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
  
      if (/\d/.test(token)) {
          let number = token;
          while (/\d/.test(expression[i + 1])) {
              i++;
              number += expression[i];
          }
          stack.push(parseInt(number));
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

  return stack[0];
}

function validateMathExpression(expression: string): boolean {
    console.log(expression);
    const mathRegex = /^(\d+|\([^\(\)]*\))(?:\s*[\+\-\*\/\^]\s*(\d+|\([^\(\)]*\)))*$/;
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



// FUNGSI UTAMA
function getOutput(input: string, data: QAObject[], algo: string): [string, QAObject] {
    const regTanggal = /\b\d{1,2}[\/\-\ ]\d{1,2}[\/\-\ ]\d{2}(?:\d{2})?\b/;
    const matchTanggal = input.match(regTanggal);
    const regCekMat = /\d+\s*[\+\-\*\/\^\(\)]\s*\d+/;
    const regMat = /^(\d+|\([^\(\)]*\))(?:\s*[\+\-\*\/\^]\s*(\d+|\([^\(\)]*\)))*$/;
    const regTambah = /^(tambahkan pertanyaan|tambah pertanyaan|tambahkan|tambah)\s(.+?)\s(dengan jawaban|jawaban|jawab)\s(.+)$/;
    const matchTambah = regTambah.exec(input);
    const regHapus = /^(hapus pertanyaan|hapus) (.+)$/i;
    const matchHapus = regHapus.exec(input);

    let result: QAObject = { _id: "", question: input, answer: "", __v: 0 };
    let method: string;

    if (matchTanggal) {
        method = "none";
        result.answer = getDayFromDate(matchTanggal[0]);
    } else if (regCekMat.test(input)) {
        method = "none";
        const matchMat = input.replace(/[^0-9+\-*/()\^ ]/g,"").match(regMat);
        
        if (!validateMathExpression(input)) {
            result.answer = "Sintaks persamaan tidak valid"
        } else if (matchMat) {
            console.log(matchMat[0]);
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
    } else if (matchTambah) {
        const qAdd: string = matchTambah[2];
        const aAdd: string = matchTambah[4];
        const que = checkExist(qAdd, data, algo);
        if (que) {
            method = "update";
            result.answer = "Pertanyaan \"" + que + "\" sudah ada! jawaban diupdate ke " + aAdd;
        } else {
            method = "add";
            result.answer = "Pertanyaan \"" + qAdd + "\" telah ditambahkan!";
        }
    } else if (matchHapus) {
        method = "delete";
        const qDel: string = matchHapus[2];
        const que = checkExist(qDel, data, algo);
        if (que) {
            method = "delete";
            result.answer = "Pertanyaan \"" + que + "\" telah dihapus!";
        }
        else {
            method = "none";
            result.answer = "Pertanyaan \"" + qDel + "\" tidak ada dalam database!";
        }
        
    }
    else {
        method = "get";
        result = searchDatabase(input, data, algo);
    }

    return [method, result];
}


export default handler;