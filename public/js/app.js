// Form fields configuration based on Excel structure
const formFields = [
    { num: 1, name: "שם היועץ התרמי", type: "text", required: true },
    { num: 2, name: "שם החברה ליעוץ תרמי", type: "text", required: true },
    { num: 3, name: "מס' בניין", type: "text", required: false },
    { num: 4, name: "שם הבניין", type: "text", required: true },
    { num: 5, name: "גוש", type: "text", required: true },
    { num: 6, name: "חלקה", type: "text", required: true },
    { num: 7, name: "מגרש", type: "text", required: false },
    { num: 8, name: "כתובת (רחוב + מספר)", type: "text", required: true },
    { num: 9, name: "רשות", type: "text", required: true },
    { num: 10, name: "מס' בקשה להיתר", type: "text", required: true },
    { num: 11, name: "תאריך הגשת הבקשה להיתר", type: "date", required: true },
    { num: 12, name: "מס' היתר", type: "text", required: false },
    { num: 13, name: "יעוד", type: "select", required: true, options: ["בנייני מגורים", "משרדים", "מסחר", "תעשייה", "מוסדות ציבור", "אחר"] },
    { num: 14, name: "האם קיימים יעודים נוספים?", type: "select", required: true, options: ["כן", "לא"] },
    { num: 15, name: "שיטת בידוד קיר חוץ", type: "select", required: true, options: ["בטון + בידוד חיצוני", "בטון + בידוד פנימי", "בלוק מבודד", "אחר"] },
    { num: 16, name: "ערך U קיר חוץ לפי דו\"ח תרמי", type: "number", required: false, step: "0.01" },
    { num: 17, name: "אלמנט", type: "text", required: false },
    { num: 18, name: "קיר חוץ- בידוד פנימי", type: "text", required: false },
    { num: 19, name: "קיר חוץ- בלוק מבודד", type: "text", required: false },
    { num: 20, name: "קיר חוץ- בידוד חיצוני", type: "text", required: false },
    { num: 21, name: "קיר חוץ ממ\"ד (במידה ויש בידוד חיצוני ופנימי, יש לסכום יחד את העובי לפי החומר עם המוליכות הגבוהה יותר)", type: "text", required: false },
    { num: 22, name: "קיר הפרדה  (במידה וישנם קטעים לא מבודדים במסגרת החרגת חלל קומתי כלוא, יש לבחור \"ללא בידוד\")", type: "text", required: false },
    { num: 23, name: "תקרה עליונה", type: "text", required: false },
    { num: 24, name: "תקרת הפרדה", type: "text", required: false },
    { num: 25, name: "רצפה מעל חללים פתוחים", type: "text", required: false },
    { num: 26, name: "רצפת הפרדה", type: "text", required: false },
    { num: 27, name: "הנחייה לבידוד מלא של גשרים תרמיים עפ\"י הגישה המרשמית בת\"י 1045", type: "text", required: false },
    { num: 28, name: "הערכת אחוז גשרים תרמיים מתוך קיר חוץ", type: "number", required: false, step: "0.1" },
    { num: 29, name: "מערכת זיגוג עבור חלונות מעל 1 מ\"ר ומתחת 2.5 מ\"ר", type: "text", required: false },
    { num: 30, name: "מערכת זיגוג עבור חלונות מעל 2.5 מ\"ר", type: "text", required: false },
    { num: 31, name: "אופציונאלי- הגדרת נתוני זיגוג מדוייקים", type: "text", required: false },
    { num: 32, name: "זיגוג חלונות מעל 1 מ\"ר ומתחת 2.5 מ\"ר", type: "text", required: false },
    { num: 33, name: "זיגוג חלונות מעל 2.5 מ\"ר", type: "text", required: false },
    { num: 34, name: "הצללה על מכלולי זיגוג", type: "text", required: false },
    { num: 35, name: "מיקום אמצעי הצללה לעיל", type: "text", required: false },
    { num: 36, name: "לכל החלונות אפשרות פתיחה מתוך יחידת הדיור?", type: "select", required: false, options: ["כן", "לא"] },
    { num: 37, name: "שם מעבדה בודקת", type: "text", required: false }
];

// Group fields into sections for better UX
const fieldSections = [
    {
        title: "פרטי היועץ והפרויקט",
        fields: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    {
        title: "פרטי ההיתר",
        fields: [10, 11, 12, 13, 14]
    },
    {
        title: "בידוד קירות",
        fields: [15, 16, 17, 18, 19, 20, 21, 22]
    },
    {
        title: "תקרות ורצפות",
        fields: [23, 24, 25, 26]
    },
    {
        title: "גשרים תרמיים",
        fields: [27, 28]
    },
    {
        title: "זיגוג וחלונות",
        fields: [29, 30, 31, 32, 33, 34, 35, 36]
    },
    {
        title: "פרטים נוספים",
        fields: [37]
    }
];

// API Base URL
const API_URL = 'http://localhost:3000/api';

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    buildOrderForm();
});

// Authentication Functions
function checkAuth() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('authButtons').style.display = 'none';
        document.getElementById('userMenu').style.display = 'flex';
        document.getElementById('userName').textContent = user.name;
    } else {
        document.getElementById('authButtons').style.display = 'flex';
        document.getElementById('userMenu').style.display = 'none';
    }
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegister() {
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function register(event) {
    event.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    if (password !== passwordConfirm) {
        alert('הסיסמאות אינן תואמות');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('ההרשמה בוצעה בהצלחה!');
            closeModal('registerModal');
            showLogin();
        } else {
            alert(data.message || 'שגיאה בהרשמה');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('שגיאה בהתחברות לשרת');
    }
}

async function login(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            setCurrentUser(data.user);
            checkAuth();
            closeModal('loginModal');
            alert('התחברת בהצלחה!');
        } else {
            alert(data.message || 'שגיאה בהתחברות');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('שגיאה בהתחברות לשרת');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    checkAuth();
    alert('התנתקת בהצלחה');
    window.location.reload();
}

// Order Form Functions
function buildOrderForm() {
    const container = document.getElementById('formContainer');

    fieldSections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'form-section';

        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = section.title;
        sectionDiv.appendChild(sectionTitle);

        const rowDiv = document.createElement('div');
        rowDiv.className = 'form-row';

        section.fields.forEach(fieldNum => {
            const field = formFields.find(f => f.num === fieldNum);
            if (field) {
                const formGroup = createFormField(field);
                rowDiv.appendChild(formGroup);
            }
        });

        sectionDiv.appendChild(rowDiv);
        container.appendChild(sectionDiv);
    });
}

function createFormField(field) {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = field.name + (field.required ? ' *' : '');
    label.setAttribute('for', `field_${field.num}`);
    formGroup.appendChild(label);

    let input;

    if (field.type === 'select') {
        input = document.createElement('select');
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'בחר...';
        input.appendChild(defaultOption);

        field.options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            input.appendChild(opt);
        });
    } else if (field.type === 'textarea') {
        input = document.createElement('textarea');
    } else {
        input = document.createElement('input');
        input.type = field.type;
        if (field.step) {
            input.step = field.step;
        }
    }

    input.id = `field_${field.num}`;
    input.name = `field_${field.num}`;
    input.required = field.required;

    formGroup.appendChild(input);
    return formGroup;
}

function showOrderForm() {
    const user = getCurrentUser();
    if (!user) {
        alert('יש להתחבר כדי להזמין חישוב');
        showLogin();
        return;
    }

    document.getElementById('orderFormModal').style.display = 'block';
}

async function submitOrder(event) {
    event.preventDefault();

    const user = getCurrentUser();
    if (!user) {
        alert('יש להתחבר כדי להזמין חישוב');
        return;
    }

    const formData = {};
    formFields.forEach(field => {
        const input = document.getElementById(`field_${field.num}`);
        if (input) {
            formData[field.name] = input.value;
        }
    });

    const order = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        data: formData,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });

        const data = await response.json();

        if (response.ok) {
            alert('ההזמנה נשלחה בהצלחה! צוות המודלים יתחיל לעבוד על החישוב.');
            closeModal('orderFormModal');
            document.getElementById('orderForm').reset();
        } else {
            alert(data.message || 'שגיאה בשליחת ההזמנה');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('שגיאה בהתחברות לשרת');
    }
}

// Orders List Functions
async function showOrders() {
    const user = getCurrentUser();
    if (!user) {
        alert('יש להתחבר כדי לצפות בהזמנות');
        showLogin();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/orders/user/${user.id}`);
        const orders = await response.json();

        displayOrders(orders);
        document.getElementById('ordersModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert('שגיאה בטעינת ההזמנות');
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersList');

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>עדיין לא ביצעת הזמנות</p>
                <button class="btn btn-primary" onclick="closeModal('ordersModal'); showOrderForm()">
                    בצע הזמנה ראשונה
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = '<div class="orders-list"></div>';
    const ordersList = container.querySelector('.orders-list');

    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';

    const date = new Date(order.createdAt).toLocaleDateString('he-IL');
    const buildingName = order.data['שם הבניין'] || 'ללא שם';
    const address = order.data['כתובת (רחוב + מספר)'] || '';

    card.innerHTML = `
        <div class="order-header">
            <div>
                <div class="order-title">${buildingName}</div>
                <div class="order-date">${date}</div>
            </div>
            <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
        </div>
        <div class="order-details">
            <div class="order-detail"><strong>כתובת:</strong> ${address}</div>
            <div class="order-detail"><strong>יועץ:</strong> ${order.data['שם היועץ התרמי'] || ''}</div>
            <div class="order-detail"><strong>חברה:</strong> ${order.data['שם החברה ליעוץ תרמי'] || ''}</div>
        </div>
        <div class="order-actions">
            <button class="btn btn-outline" onclick='duplicateOrder(${JSON.stringify(order).replace(/'/g, "\\'")})'>
                שכפל הזמנה
            </button>
        </div>
    `;

    return card;
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'ממתין',
        'processing': 'בטיפול',
        'completed': 'הושלם'
    };
    return statusMap[status] || status;
}

function duplicateOrder(order) {
    closeModal('ordersModal');
    showOrderForm();

    // Wait for modal to open and then fill the form
    setTimeout(() => {
        formFields.forEach(field => {
            const input = document.getElementById(`field_${field.num}`);
            if (input && order.data[field.name]) {
                input.value = order.data[field.name];
            }
        });
    }, 100);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
