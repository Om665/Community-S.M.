// الأصناف الرئيسية (قابلة للتعديل)
let categories = JSON.parse(localStorage.getItem('categories')) || [
    "ملابس", "كنب", "كب", "ادوات مطبخ", "مطبخ المنيوم", "دراجة", "أخرى"
];

function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
    renderCategoryListVertical();
}

function renderCategoryListVertical() {
    const list = document.getElementById('category-list-vertical');
    if (!list) return;
    list.innerHTML = '';
    categories.forEach(cat => {
        const box = document.createElement('div');
        box.className = 'category-vertical-box';
        box.textContent = cat;
        box.onclick = () => showCategory(cat);
        list.appendChild(box);
    });
}

// نافذة إدارة الأصناف
function openCategoryManager() {
    document.getElementById('category-manager-modal').style.display = 'block';
    renderCategoryList();
}
function closeCategoryManager() {
    document.getElementById('category-manager-modal').style.display = 'none';
}
function renderCategoryList() {
    const ul = document.getElementById('category-list');
    ul.innerHTML = '';
    categories.forEach((cat, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${cat}</span>
            <span>
                <button class="edit-btn" onclick="editCategory(${idx})">تعديل</button>
                <button onclick="deleteCategory(${idx})">حذف</button>
            </span>
        `;
        ul.appendChild(li);
    });
}
function addCategory() {
    const input = document.getElementById('new-category-input');
    const val = input.value.trim();
    if (val && !categories.includes(val)) {
        categories.push(val);
        saveCategories();
        renderCategoryList();
        input.value = '';
    }
}
function deleteCategory(idx) {
    categories.splice(idx, 1);
    saveCategories();
    renderCategoryList();
}
function editCategory(idx) {
    const newName = prompt('تعديل اسم الصنف:', categories[idx]);
    if (newName && newName.trim() && !categories.includes(newName.trim())) {
        categories[idx] = newName.trim();
        saveCategories();
        renderCategoryList();
    }
}

// عرض عناصر الصنف المختار فقط
function showCategory(category) {
    const itemsGrid = document.getElementById('items-grid');
    itemsGrid.innerHTML = '';

    if (!currentUser) {
        itemsGrid.innerHTML = '<p>سجل الدخول لرؤية الفوائض حسب حيّك.</p>';
        return;
    }

    // فلترة العناصر حسب النوع والحي
    let filtered = itemsData.filter(item =>
        (item.name.includes(category) || (item.type && item.type.includes(category)))
    );

    if (currentUser.type !== 'admin') {
        filtered = filtered.filter(item => item.district === currentUser.district);
    }

    // إزالة العناصر المطلوبة سابقاً
    filtered = filtered.filter(item => !requestedItems.some(r => r.itemId === item.id));

    if (filtered.length === 0) {
        itemsGrid.innerHTML = `<p>لا توجد عناصر متاحة في هذا الصنف حالياً في حيّك.</p>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-content">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
                <p class="item-name">${item.name}</p>
                <p>${item.description}</p>
                <p><strong>تاريخ الوضع:</strong> ${item.placed}</p>
                <span class="status-badge">متاح</span>
                <button onclick="requestItem(${item.id})">طلب</button>
                ${item.rating ? `<p>التقييم: ${item.rating.average} (${item.rating.count} تقييمات)</p>` : ''}
            </div>
        `;
        itemsGrid.appendChild(card);
    });
}
// قاعدة بيانات الأحياء حسب المدن
const cityData = {
    "جدة": [
        "حي الروضة",
        "حي الفيصلية",
        "حي الشاطئ",
        "حي الزهور",
        "حي النعيم",
        "حي المحمدية",
        "حي المرجان",
        "حي النسيم",
        "حي الحمدانية",
        "حي الخالدية",
        "حي الحفرة",
        "حي البلد",
        "حي الكندرة",
        "حي الأندلس",
        "حي الأمير فهد",
        "حي الجامعة",
        "حي الورود",
        "حي السامر",
        "حي الشرفية",
        "حي النزهة",
        "حي الصفا",
        "حي المروة",
        "حي السلامة",
        "حي البغدادية",
        "حي المعادي",
        "حي الصناعية",
        "حي العزيزية",
        "حي الواحة",
        "حي المنتزه",
        "حي الهانوفيل",
        "حي المحمدية الشمالية"
    ],
    "مكة": [
        "حي الجرافة",
        "حي المعابدة",
        "حي أجياد",
        "حي الحجون",
        "حي الشبيكة",
        "حي ذي الجناح",
        "حي الخالديين",
        "حي الكتيبة",
        "حي الكعكية",
        "حي الهجلة",
        "حي الريان",
        "حي العتيبية",
        "حي الزاهر",
        "حي بني مالك",
        "حي العزيزية",
        "حي بيعه",
        "حي الطرفية",
        "حي القشاشية",
        "حي قرضة",
        "حي المنطقة الصناعية",
        "حي الشرائع",
        "حي الهجرة",
        "حي الخالدية",
        "حي العدل",
        "حي العدل ثاني",
        "حي الشوقية"
    ]
};

const ADMIN_PASSWORD = 'admin123';

// قاعدة بيانات الأشياء
let itemsData = [
    { id: 1, name: "خبز طازج", type: "طعام", expiry: "2026-05-02", placed: "2026-04-30", district: "حي الروضة", priority: 1, description: "خبز عربي طازج" },
    { id: 2, name: "فواكه متنوعة", type: "طعام", expiry: "2026-05-03", placed: "2026-04-29", district: "حي الفيصلية", priority: 2, description: "تفاح وبرتقال" },
    { id: 3, name: "ملابس أطفال", type: "ملابس", expiry: "2026-12-31", placed: "2026-04-28", district: "حي الشاطئ", priority: 1, description: "ملابس بحالة جيدة" },
    { id: 4, name: "أدوات مدرسية", type: "أدوات", expiry: "2026-12-31", placed: "2026-04-27", district: "حي الجرافة", priority: 1, description: "أقلام ودفاتر" },
    { id: 5, name: "أرز", type: "طعام", expiry: "2026-05-10", placed: "2026-04-30", district: "حي المعابدة", priority: 1, description: "كيس أرز 5 كجم" }
];

let currentUser = null;
let requestedItems = [];
let sentItems = [];
let receivedItems = [];

// استعادة المستخدم من localStorage عند التحميل
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    document.getElementById('add-item-header-btn').style.display = 'none';
    document.getElementById('view-history-header-btn').style.display = 'none';
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('admin-login-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        document.getElementById('add-item-header-btn').style.display = 'inline-block';
        document.getElementById('manage-categories-btn').style.display = currentUser.type === 'admin' ? 'block' : 'none';
        document.getElementById('view-history-header-btn').style.display = currentUser.type === 'admin' ? 'inline-block' : 'none';
        if (currentUser.type === 'admin') {
            document.getElementById('user-info').textContent = `مرحباً ${currentUser.name} - الادمن - ${currentUser.phone}`;
        } else {
            document.getElementById('user-info').textContent = `مرحباً ${currentUser.name} (${currentUser.city} - ${currentUser.district}) - ${currentUser.phone}`;
        }
    } else {
        document.getElementById('login-btn').style.display = 'inline-block';
        document.getElementById('admin-login-btn').style.display = 'inline-block';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('manage-categories-btn').style.display = 'none';
    }
    renderCategoryListVertical();
});

function updateDistricts() {
    const citySelect = document.getElementById('city-select');
    const districtSelect = document.getElementById('district-select');
    const selectedCity = citySelect.value;

    // تفريغ قائمة الأحياء الحالية
    districtSelect.innerHTML = '<option value="">اختر الحي</option>';

    if (selectedCity && cityData[selectedCity]) {
        districtSelect.disabled = false; // تفعيل القائمة
        cityData[selectedCity].forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    } else {
        districtSelect.disabled = true; // تعطيلها إذا لم يتم اختيار مدينة
    }
    displayItems();
}

function displayItems() {
    const itemsGrid = document.getElementById('items-grid');
    itemsGrid.innerHTML = '';

    if (!currentUser) {
        itemsGrid.innerHTML = '<p>سجل الدخول لرؤية الفوائض حسب حيّك.</p>';
        return;
    }

    let filteredItems = itemsData;
    if (currentUser.type !== 'admin') {
        filteredItems = itemsData.filter(item => item.district === currentUser.district);
    }
    filteredItems = filteredItems.sort((a, b) => {
        const dateA = new Date(a.placed);
        const dateB = new Date(b.placed);
        if (dateA < dateB) return 1;
        if (dateA > dateB) return -1;
        return a.priority - b.priority;
    });

    const uniqueByType = new Map();
    filteredItems.forEach(item => {
        const typeKey = (item.type || item.name || '').trim().toLowerCase();
        if (!uniqueByType.has(typeKey)) {
            uniqueByType.set(typeKey, item);
        }
    });
    filteredItems = Array.from(uniqueByType.values());

    if (filteredItems.length === 0) {
        itemsGrid.innerHTML = '<p>لا توجد أشياء متاحة حالياً في حيّك.</p>';
        return;
    }

    filteredItems.forEach(item => {
        const requested = requestedItems.find(r => r.itemId === item.id && r.user === currentUser?.name);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-content">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
                <p class="item-name">${item.name}</p>
                <p>${item.description}</p>
                <p><strong>تاريخ الوضع:</strong> ${item.placed}</p>
                <span class="status-badge">متاح</span>
                ${currentUser ? `<button onclick="requestItem(${item.id})">طلب</button>` : '<p style="color:#c62828; margin-top: 10px;">سجل الدخول لطلب هذا الشيء.</p>'}
                ${item.rating ? `<p>التقييم: ${item.rating.average} (${item.rating.count} تقييمات)</p>` : ''}
            </div>
        `;
        itemsGrid.appendChild(card);
    });
}

function requestItem(itemId) {
    if (!currentUser) {
        alert('يجب تسجيل الدخول قبل طلب أي شيء.');
        return;
    }
    const existing = requestedItems.find(r => r.itemId === itemId && r.user === currentUser.name);
    if (!existing) {
        // افتح محادثة لتأكيد التوفر
        openChat(itemId);
    } else {
        alert('لقد طلبت هذا الشيء بالفعل.');
    }
}

function openChat(itemId) {
    const item = itemsData.find(i => i.id === itemId);
    if (!item) return;

    // افتح نافذة محادثة وهمية
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.style.position = 'fixed';
    chatWindow.style.top = '50%';
    chatWindow.style.left = '50%';
    chatWindow.style.transform = 'translate(-50%, -50%)';
    chatWindow.style.background = 'white';
    chatWindow.style.border = '1px solid #ccc';
    chatWindow.style.padding = '20px';
    chatWindow.style.zIndex = '1000';
    chatWindow.innerHTML = `
        <h3>محادثة مع المعروض</h3>
        <div id="chat-messages" style="height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
            <p><strong>أنت:</strong> هل الشيء "${item.name}" متاح؟</p>
            <p><strong>المعروض:</strong> نعم، الشيء متاح. يمكنك طلبه.</p>
        </div>
        <button onclick="confirmRequest(${itemId})">تأكيد الطلب</button>
        <button onclick="closeChat()">إلغاء</button>
    `;
    document.body.appendChild(chatWindow);
}

function confirmRequest(itemId) {
    const item = itemsData.find(i => i.id === itemId);
    if (!item) return;
    
    requestedItems.push({ user: currentUser.name, itemId, status: 'requested' });
    localStorage.setItem('requestedItems', JSON.stringify(requestedItems));
    
    // إزالة العنصر من الصفحة الرئيسية
    itemsData = itemsData.filter(i => i.id !== itemId);
    localStorage.setItem('itemsData', JSON.stringify(itemsData));
    
    // تحديث السجل المرسل (عند صاحب الفائض)
    const sentItem = sentItems.find(s => s.id === itemId);
    if (sentItem) {
        sentItem.status = 'تم التسليم';
        sentItem.recipient = currentUser.name;
        sentItem.recipientPhone = currentUser.phone;
        sentItem.deliveryDate = new Date().toISOString().split('T')[0];
    }
    localStorage.setItem('sentItems', JSON.stringify(sentItems));
    
    // إضافة إلى السجل المستلم
    receivedItems.push({
        id: Date.now(),
        itemName: item.name,
        description: item.description,
        requester: currentUser.name,
        requesterPhone: currentUser.phone,
        provider: item.provider || 'غير محدد',
        providerPhone: item.providerPhone || 'غير محدد',
        date: new Date().toISOString().split('T')[0],
        status: 'مستلم',
        rating: null
    });
    localStorage.setItem('receivedItems', JSON.stringify(receivedItems));
    
    closeChat();
    displayItems();
    alert('تم تأكيد الطلب بنجاح! يمكن التواصل على: ' + (item.providerPhone || 'لا يوجد رقم مقدم'));
}

function closeChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        document.body.removeChild(chatWindow);
    }
}

function confirmDelivery(itemId) {
    const request = requestedItems.find(r => r.itemId === itemId && r.user === currentUser.name);
    if (request) {
        request.status = 'delivered';
        localStorage.setItem('requestedItems', JSON.stringify(requestedItems));
        displayItems();
    }
}

function rateItem(itemId) {
    const ratingForm = document.createElement('div');
    ratingForm.id = 'rating-form';
    ratingForm.style.position = 'fixed';
    ratingForm.style.top = '50%';
    ratingForm.style.left = '50%';
    ratingForm.style.transform = 'translate(-50%, -50%)';
    ratingForm.style.background = 'white';
    ratingForm.style.border = '1px solid #ccc';
    ratingForm.style.padding = '20px';
    ratingForm.style.zIndex = '1000';
    ratingForm.innerHTML = `
        <h3>تقييم المنتج</h3>
        <label>التقييم (1-5):</label>
        <input type="number" id="rating-input" min="1" max="5" required>
        <button onclick="submitRating(${itemId})">إرسال</button>
        <button onclick="closeRating()">إلغاء</button>
    `;
    document.body.appendChild(ratingForm);
}

function submitRating(itemId) {
    const rating = parseInt(document.getElementById('rating-input').value);
    if (rating >= 1 && rating <= 5) {
        const item = itemsData.find(i => i.id === itemId);
        if (item) {
            if (!item.ratings) item.ratings = [];
            item.ratings.push(rating);
            item.rating = {
                average: (item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length).toFixed(1),
                count: item.ratings.length
            };
            localStorage.setItem('itemsData', JSON.stringify(itemsData));
            closeRating();
            displayItems();
        }
    } else {
        alert('يرجى إدخال تقييم صحيح من 1 إلى 5.');
    }
}

function closeRating() {
    const ratingForm = document.getElementById('rating-form');
    if (ratingForm) {
        document.body.removeChild(ratingForm);
    }
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    // لا نحتاج لـ populateDistrictOptions هنا لأنها تعتمد على المدينة
}

function showAdminLoginForm() {
    document.getElementById('admin-login-form').style.display = 'block';
}

function adminLogin() {
    const name = document.getElementById('admin-name').value.trim();
    const phone = document.getElementById('admin-phone').value.trim();
    const password = document.getElementById('admin-password').value;

    if (!name || !phone || !password) {
        alert('يرجى ملء جميع حقل الادمن.');
        return;
    }
    if (password !== ADMIN_PASSWORD) {
        alert('كلمة مرور الادمن غير صحيحة.');
        return;
    }

    currentUser = { name, phone, city: 'الادمن', district: '', type: 'admin' };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('admin-login-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'block';
    document.getElementById('add-item-header-btn').style.display = 'inline-block';    document.getElementById('view-history-header-btn').style.display = 'none';    document.getElementById('view-history-header-btn').style.display = 'inline-block';
    document.getElementById('manage-categories-btn').style.display = 'block';
    document.getElementById('user-info').textContent = `مرحباً ${name} - الادمن - ${phone}`;
    document.getElementById('admin-login-form').style.display = 'none';
    document.getElementById('provider-actions').style.display = 'none';
    displayItems();
}

function updateLoginDistricts() {
    const citySelect = document.getElementById('user-city');
    const districtSelect = document.getElementById('user-district');
    const selectedCity = citySelect.value;

    // تفريغ قائمة الأحياء الحالية
    districtSelect.innerHTML = '<option value="">اختر الحي</option>';

    if (selectedCity && cityData[selectedCity]) {
        districtSelect.disabled = false; // تفعيل القائمة
        cityData[selectedCity].forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    } else {
        districtSelect.disabled = true; // تعطيلها إذا لم يتم اختيار مدينة
    }
}

function login() {
    const name = document.getElementById('user-name').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    const city = document.getElementById('user-city').value;
    const district = document.getElementById('user-district').value;
    if (name && phone && city && district) {
        currentUser = { name, phone, city, district, type: 'user' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('admin-login-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        document.getElementById('add-item-header-btn').style.display = 'inline-block';
        document.getElementById('manage-categories-btn').style.display = 'none';
        document.getElementById('user-info').textContent = `مرحباً ${name} (${city} - ${district}) - ${phone}`;
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('provider-actions').style.display = 'none';
        displayItems();
    } else {
        alert('يرجى ملء جميع الحقول');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('login-btn').style.display = 'inline-block';
    document.getElementById('admin-login-btn').style.display = 'inline-block';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('add-item-header-btn').style.display = 'none';
    document.getElementById('view-history-header-btn').style.display = 'none';
    document.getElementById('manage-categories-btn').style.display = 'none';
    document.getElementById('user-info').textContent = '';
    document.getElementById('provider-actions').style.display = 'none';
    document.getElementById('history-view').style.display = 'none';
    displayItems();
}

function showAddItemForm() {
    document.getElementById('add-item-form').style.display = 'block';
    updateItemTypeOptions();
    document.getElementById('item-image').addEventListener('change', previewImage);
}

function updateItemTypeOptions() {
    const typeSelect = document.getElementById('item-type');
    typeSelect.innerHTML = '<option value="">اختر النوع</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        typeSelect.appendChild(option);
    });
}

function previewImage() {
    const file = document.getElementById('item-image').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('image-preview').src = e.target.result;
            document.getElementById('image-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function addItem() {
    const description = document.getElementById('item-description').value;
    const type = document.getElementById('item-type').value;
    const imageFile = document.getElementById('item-image').files[0];

    if (description && type && currentUser) {
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = e.target.result;
                saveItem(imageData);
            };
            reader.readAsDataURL(imageFile);
        } else {
            saveItem(null);
        }
    } else {
        alert('يرجى تعبئة نوع ووصف المنتج وتسجيل الدخول.');
    }
}

function saveItem(imageData) {
    const description = document.getElementById('item-description').value;
    const type = document.getElementById('item-type').value;

    const newItem = {
        id: Date.now(),
        name: type,
        type,
        placed: new Date().toISOString().split('T')[0],
        city: currentUser.city,
        district: currentUser.district,
        priority: 1,
        description,
        image: imageData,
        provider: currentUser.name,
        providerPhone: currentUser.phone
    };
    itemsData.push(newItem);
    localStorage.setItem('itemsData', JSON.stringify(itemsData));
    
    // إضافة إلى السجل المرسل
    sentItems.push({
        id: newItem.id,
        itemName: type,
        description: description,
        type,
        dateAdded: newItem.placed,
        provider: currentUser.name,
        providerPhone: currentUser.phone,
        district: currentUser.district,
        status: 'معروض',
        recipient: null,
        recipientPhone: null,
        deliveryDate: null,
        recipientRating: null
    });
    localStorage.setItem('sentItems', JSON.stringify(sentItems));
    
    // تنظيف النموذج
    document.getElementById('item-type').value = '';
    document.getElementById('item-description').value = '';
    document.getElementById('item-image').value = '';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('add-item-form').style.display = 'none';
    displayItems();
}

function viewHistory() {
    if (!currentUser || currentUser.type !== 'admin') {
        alert('السجل متاح للادمن فقط.');
        return;
    }
    const sentList = document.getElementById('sent-items-list');
    const receivedList = document.getElementById('received-items-list');
    
    // إعداد التخطيط كـ grid للبطاقات
    // sentList.style.display = 'grid';
    // sentList.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
    // sentList.style.gap = '10px';
    
    // receivedList.style.display = 'grid';
    // receivedList.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
    // receivedList.style.gap = '10px';
    
    // ترتيب الفوائض المرسلة حسب التاريخ (الأحدث أولاً) - فقط المسلمة
    const sortedSentItems = [...sentItems]
        .filter(item => item.status === 'تم التسليم')
        .map(item => ({
        ...item,
        itemName: item.itemName || item.name || 'بدون اسم',
        description: item.description || '-',
        provider: item.provider || '-',
        providerPhone: item.providerPhone || '-',
        district: item.district || '-',
        dateAdded: item.dateAdded || item.date || new Date().toISOString().split('T')[0]
    })).sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    
    sentList.innerHTML = '<h4>الفوائض المسلمة:</h4><div id="sent-cards-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;"></div>';
    if (sortedSentItems.length === 0) {
        document.getElementById('sent-cards-container').innerHTML = '<div style="background: #e3f2fd; padding: 10px; border-radius: 6px; border-right: 3px solid #1976d2;"><p style="margin: 0; color: #1976d2;">لم يتم تسليم أي فوائض بعد.</p></div>';
    } else {
        sortedSentItems.forEach(item => {
            document.getElementById('sent-cards-container').innerHTML += `
                <div style="background: #e3f2fd; padding: 10px; border-radius: 6px; border-right: 3px solid #1976d2;">
                    <h5 style="margin-top: 0; margin-bottom: 6px; color: #1976d2; font-size: 1em;">${item.itemName}</h5>
                    <p style="margin: 4px 0; font-size: 0.9em;"><strong>الوصف:</strong> ${item.description}</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.85em; margin: 6px 0;">
                        <span><strong>من (العارض):</strong> ${item.provider}</span>
                        <span><strong>رقم الجوال:</strong> ${item.providerPhone}</span>
                        <span><strong>الحي:</strong> ${item.district}</span>
                        <span><strong>تاريخ الإضافة:</strong> ${item.dateAdded}</span>
                    </div>
                    <p style="margin: 6px 0; padding: 6px; background: #c8e6c9; border-radius: 3px; color: #2e7d32; font-size: 0.9em;">
                        <strong>الحالة:</strong> تم التسليم
                    </p>
                    <div style="background: #f5f5f5; padding: 8px; border-radius: 3px; margin-top: 8px; font-size: 0.85em;">
                        <p style="margin: 4px 0;"><strong>إلى (المستقبل):</strong> ${item.recipient}</p>
                        <p style="margin: 4px 0;"><strong>رقم الجوال:</strong> ${item.recipientPhone}</p>
                        <p style="margin: 4px 0;"><strong>تاريخ التسليم:</strong> ${item.deliveryDate}</p>
                        ${item.recipientRating ? `<p style="margin: 4px 0;"><strong>تقييم المستقبل:</strong> ${'⭐'.repeat(item.recipientRating)}</p>` : ''}
                    </div>
                </div>
            `;
        });
    }
    
    // ترتيب الفوائض المستلمة حسب التاريخ (الأحدث أولاً) - فقط المستقبلة
    const sortedReceivedItems = [...receivedItems]
        .filter(item => item.status === 'مستلم')
        .map(item => ({
        ...item,
        itemName: item.itemName || 'بدون اسم',
        description: item.description || '-',
        provider: item.provider || '-',
        providerPhone: item.providerPhone || '-',
        requester: item.requester || item.user || '-',
        requesterPhone: item.requesterPhone || '-',
        date: item.date || new Date().toISOString().split('T')[0]
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    receivedList.innerHTML = '<h4>الفوائض المستقبلة:</h4><div id="received-cards-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;"></div>';
    if (sortedReceivedItems.length === 0) {
        document.getElementById('received-cards-container').innerHTML = '<div style="background: #e8f5e9; padding: 10px; border-radius: 6px; border-right: 3px solid #2e7d32;"><p style="margin: 0; color: #2e7d32;">لم يتم استقبال أي فوائض بعد.</p></div>';
    } else {
        sortedReceivedItems.forEach(item => {
            document.getElementById('received-cards-container').innerHTML += `
                <div style="background: #e8f5e9; padding: 10px; border-radius: 6px; border-right: 3px solid #2e7d32;">
                    <h5 style="margin-top: 0; margin-bottom: 6px; color: #2e7d32; font-size: 1em;">${item.itemName}</h5>
                    <p style="margin: 4px 0; font-size: 0.9em;"><strong>الوصف:</strong> ${item.description}</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.85em; margin: 6px 0;">
                        <span><strong>من (العارض):</strong> ${item.provider}</span>
                        <span><strong>رقم الجوال:</strong> ${item.providerPhone}</span>
                        <span><strong>المستقبل:</strong> ${item.requester}</span>
                        <span><strong>رقم الجوال:</strong> ${item.requesterPhone}</span>
                    </div>
                    <p style="margin: 6px 0; padding: 6px; background: #c8e6c9; border-radius: 3px; color: #2e7d32; font-size: 0.9em;">
                        <strong>الحالة:</strong> مستلم
                    </p>
                    <p style="margin: 4px 0; font-size: 0.85em;"><strong>تاريخ الاستقبال:</strong> ${item.date}</p>
                    <button onclick="rateReceivedItem(${item.id})" style="background: #ff6b35; color: white; border: none; padding: 6px 10px; border-radius: 3px; cursor: pointer; margin-top: 8px; font-size: 0.85em;">
                        ${item.rating ? `تقييم: ${'⭐'.repeat(item.rating)}` : 'أضف تقييماً'}
                    </button>
                </div>
            `;
        });
    }
    
    document.getElementById('history-view').style.display = 'block';
}


function closeHistory() {
    document.getElementById('history-view').style.display = 'none';
}

function confirmReceivedItem(itemId) {
    const item = receivedItems.find(i => i.id === itemId);
    if (item) {
        item.status = 'مستلم';
        localStorage.setItem('receivedItems', JSON.stringify(receivedItems));
        viewHistory();
    }
}

function rateReceivedItem(itemId) {
    const ratingForm = document.createElement('div');
    ratingForm.id = 'rating-form';
    ratingForm.style.position = 'fixed';
    ratingForm.style.top = '50%';
    ratingForm.style.left = '50%';
    ratingForm.style.transform = 'translate(-50%, -50%)';
    ratingForm.style.background = 'white';
    ratingForm.style.border = '1px solid #ccc';
    ratingForm.style.padding = '20px';
    ratingForm.style.zIndex = '2000';
    ratingForm.innerHTML = `
        <h3>تقييم المنتج</h3>
        <label>التقييم (1-5):</label>
        <input type="number" id="rating-input" min="1" max="5" required>
        <button onclick="submitReceivedRating(${itemId})">إرسال</button>
        <button onclick="closeRating()">إلغاء</button>
    `;
    document.body.appendChild(ratingForm);
}

function submitReceivedRating(itemId) {
    const rating = parseInt(document.getElementById('rating-input').value);
    if (rating >= 1 && rating <= 5) {
        const item = receivedItems.find(i => i.id === itemId);
        if (item) {
            item.rating = rating;
            localStorage.setItem('receivedItems', JSON.stringify(receivedItems));
            
            // تحديث التقييم في sentItems أيضاً
            const sentItem = sentItems.find(s => s.itemName === item.itemName && s.provider === item.provider);
            if (sentItem) {
                sentItem.recipientRating = rating;
                localStorage.setItem('sentItems', JSON.stringify(sentItems));
            }
            
            closeRating();
            viewHistory();
        }
    } else {
        alert('يرجى إدخال تقييم صحيح من 1 إلى 5.');
    }
}

window.onload = function() {
    const savedItems = localStorage.getItem('itemsData');
    if (savedItems) {
        itemsData = JSON.parse(savedItems);
    }
    const savedRequested = localStorage.getItem('requestedItems');
    if (savedRequested) {
        requestedItems = JSON.parse(savedRequested);
    }
    const savedSentItems = localStorage.getItem('sentItems');
    if (savedSentItems) {
        sentItems = JSON.parse(savedSentItems);
    }
    const savedReceivedItems = localStorage.getItem('receivedItems');
    if (savedReceivedItems) {
        receivedItems = JSON.parse(savedReceivedItems);
    }
    const savedUser = localStorage.getItem('currentUser');
    document.getElementById('add-item-header-btn').style.display = 'none';
    document.getElementById('view-history-header-btn').style.display = 'none';
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('admin-login-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        document.getElementById('add-item-header-btn').style.display = 'inline-block';
        document.getElementById('manage-categories-btn').style.display = currentUser.type === 'admin' ? 'block' : 'none';
        document.getElementById('view-history-header-btn').style.display = currentUser.type === 'admin' ? 'inline-block' : 'none';
        if (currentUser.type === 'admin') {
            document.getElementById('user-info').textContent = `مرحباً ${currentUser.name} - الادمن - ${currentUser.phone}`;
        } else {
            document.getElementById('user-info').textContent = `مرحباً ${currentUser.name} (${currentUser.city} - ${currentUser.district}) - ${currentUser.phone}`;
        }
    } else {
        document.getElementById('login-btn').style.display = 'inline-block';
        document.getElementById('admin-login-btn').style.display = 'inline-block';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('manage-categories-btn').style.display = 'none';
    }
    displayItems();
};