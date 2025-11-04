# התחלה מהירה - NEXA Energy Rating Portal

## הפעלה מהירה (5 דקות)

### שלב 1: הפעל את השרת

```bash
npm start
```

אמור להופיע:
```
╔════════════════════════════════════════════╗
║   NEXA Energy Rating Portal Server         ║
║   Server running on http://localhost:3000  ║
╚════════════════════════════════════════════╝
```

### שלב 2: פתח בדפדפן

פתח את הכתובת: **http://localhost:3000**

### שלב 3: צור משתמש

1. לחץ על "הרשמה"
2. מלא פרטים
3. התחבר

### שלב 4: בצע הזמנה

1. לחץ "הזמן חישוב עכשיו"
2. מלא את השדות
3. שלח

זהו! ההזמנה נשמרה ב-`data/orders.json`

---

## הגדרת Google Sheets (אופציונאלי)

אם אתה רוצה לשלוח הזמנות ל-Google Sheets:

### 1. הכן Google Sheet

צור גיליון חדש ב-Google Sheets

### 2. הורד אישורים

1. גש ל-https://console.cloud.google.com/
2. צור פרויקט
3. הפעל Google Sheets API
4. צור Service Account
5. הורד JSON

### 3. הגדר בקוד

העתק את הקובץ:
```bash
# שים את google-credentials.json בתיקיית server/
```

ערוך `server/server.js`:
```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
// ↓ החלף ב-ID של הגיליון שלך
const SPREADSHEET_ID = '1SdXjWS7A9scJ3VQRnm0sMBwnmAhUZZUpZvrEdG3VFzk';
```

### 4. שתף את הגיליון

שתף את הגיליון עם המייל של ה-Service Account (מופיע בקובץ ה-JSON)

### 5. הפעל מחדש

```bash
npm start
```

עכשיו כל הזמנה חדשה תישלח גם ל-Google Sheets! 🎉

---

## פקודות שימושיות

```bash
# הפעלה רגילה
npm start

# הפעלה עם auto-reload (דורש nodemon)
npm run dev

# התקנת תלויות
npm install
```

---

## קבצים חשובים

| קובץ | תיאור |
|------|--------|
| `public/index.html` | דף הנחיתה |
| `public/css/style.css` | עיצוב |
| `public/js/app.js` | לוגיקת Frontend |
| `server/server.js` | שרת Backend |
| `data/users.json` | משתמשים |
| `data/orders.json` | הזמנות |

---

## שאלות נפוצות

**ש: איפה הנתונים נשמרים?**
ת: בתיקיית `data/` - קבצי JSON

**ש: האם המשתמשים רואים הזמנות של אחרים?**
ת: לא! כל משתמש רואה רק את ההזמנות שלו

**ש: מה אם אין לי Google Sheets?**
ת: זה אופציונאלי. המערכת תעבוד בלי זה

**ש: איך משנים את הפורט?**
ת: ערוך את `server/server.js` - שנה `const PORT = 3000;`

---

**צריך עזרה? קרא את README.md המלא**
