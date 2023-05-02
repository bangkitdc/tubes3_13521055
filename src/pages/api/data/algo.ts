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
    const days = ['Minggu', 'Senin', 'Selasa',                 
                'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [' Januari ', ' Februari ', ' Maret ', ' April ',
                     ' Mei ', ' Juni ', ' Juli ', ' Agustus ',
                     ' September ', ' Oktober ', ' November ', ' Desember '];

    const parts = input.split('/');

    let year = parseInt(parts[2], 10);
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

    const msg = parts[0] + months[month] + parts[2] + " adalah Hari " + days[h];

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


// FUNGSI UTAMA
function getOutput(input: string): string {
    const regTanggal = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/;
    const matchTanggal = input.match(regTanggal);
    const regCekMat = /\d+\s*[\+\-\*\/\^\(\)]\s*\d+/;
    const regMat = /^.*\b(\d+|\([^\(\)]*\))(\s*[\+\-\*\/\^]\s*(\d+|\([^\(\)]*\)))+\b.*$/;
    const regTambah = /^tambahkan pertanyaan\s(.+?)\sdengan jawaban\s(.+)$/;
    const matchTambah = regTambah.exec(input);
    const regHapus = /^hapus pertanyaan (.+)$/i;
    const matchHapus = regHapus.exec(input);

    if (matchTanggal) {
        const msg = getDayFromDate(matchTanggal[0]);
        // console.log(msg);
        return msg;
    } else if (regCekMat.test(input)) {
        const matchMat = input.replace(/[^0-9+\-*/()\^]/g,"").match(regMat);
        if (!matchMat) {
            // console.log("Sintaks persamaan tidak valid");
            return "Sintaks persamaan tidak valid";
        }
        else {
            const res = calculateMathExpression(matchMat[0]);
            let msg = "Hasil dari " + matchMat[0].replace(/\s+/g, "") + " adalah ";
            if (res == undefined) {
                msg +=  "tidak terdefinisi";
            }
            else {
                msg += res.toString();
            }
            // console.log(msg);
            return msg;
        }
    } else if (matchTambah) {
        // tambah pertanyaan
        return "blm";
    } else if (matchHapus) {
        // hapus pertanyaan
        return "blm";
    }
    else {
        // search database
        return "blm";
    }
}
