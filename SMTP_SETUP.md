# הגדרת SMTP מותאם אישית ב-Supabase

## שלב 1: יצירת App Password ב-Gmail

1. **לך ל-Google Account Settings**: https://myaccount.google.com/
2. **Security** (אבטחה) → **2-Step Verification** (אימות דו-שלבי)
   - אם לא מופעל, הפעל אותו תחילה
3. **App Passwords** (סיסמאות אפליקציה) בתחתית העמוד
4. **Select app**: Mail
5. **Select device**: Other (Custom name) → כתוב "MyKeto Supabase"
6. **Generate** → **העתק את הסיסמה** (16 תווים)

## שלב 2: הגדרת SMTP ב-Supabase

1. **לך ל-Supabase Dashboard**: https://supabase.com/dashboard
2. **בחר את הפרויקט שלך** (ketoapp)
3. **Settings** (בתפריט השמאלי) → **Authentication**
4. **SMTP Settings** (גלול למטה)
5. **Enable Custom SMTP** - הפעל
6. **מלא את הפרטים הבאים**:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: roykere@gmail.com
SMTP Password: [הסיסמה שיצרת בשלב 1]
Sender Email: roykere@gmail.com
Sender Name: MyKeto
```

7. **Save** (שמור)

## שלב 3: בדיקה

1. **חזור לאפליקציה** באייפון
2. **לך למסך Login**
3. **הכנס את האימייל שלך**: roykere@gmail.com
4. **לחץ "שכחתי סיסמה"**
5. **בדוק את תיבת הדואר** - אמור להגיע מייל מ-roykere@gmail.com

---

## חשוב לדעת:

- Gmail מגביל ל-**500 מיילים ליום** עם SMTP
- אם תצטרך יותר, תצטרך שירות כמו SendGrid או AWS SES
- הסיסמה היא **App Password** ולא הסיסמה הרגילה שלך

## אם יש בעיה:

- ודא ש-2-Step Verification מופעל
- ודא שהעתקת את ה-App Password נכון (ללא רווחים)
- נסה Port 465 במקום 587 אם 587 לא עובד
