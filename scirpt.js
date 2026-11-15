const form = document.getElementById('authForm');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const submitBtn = document.getElementById('submitBtn');

const nameGroup = document.getElementById('nameGroup');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const message = document.getElementById('message');

let mode = 'login';
let busy = false;
let db;

function showMessage(text, error = false) {
    message.textContent = text;
    message.className = `message ${error ? 'error' : 'success'}`;
}

function setBusy(value) {
    busy = value;
    submitBtn.disabled = value;
    loginTab.disabled = value;
    registerTab.disabled = value;
}

function setMode(nextMode) {
    mode = nextMode;
    form.reset();
    showMessage('');

    const isRegister = mode === 'register';

    nameGroup.hidden = !isRegister;
    fullNameInput.required = isRegister;

    passwordInput.minLength = isRegister ? 8 : 1;
    passwordInput.autocomplete =
        isRegister ? 'new-password' : 'current-password';

    submitBtn.textContent =
        isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ';

    loginTab.classList.toggle('active', !isRegister);
    registerTab.classList.toggle('active', isRegister);
}

function readableError(error) {
    switch (error.code) {
        case 'invalid_credentials':
            return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';

        case 'email_not_confirmed':
            return 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ';

        case 'user_already_exists':
            return 'อีเมลนี้มีบัญชีแล้ว กรุณาเข้าสู่ระบบ';

        case 'weak_password':
            return 'รหัสผ่านไม่ผ่านเงื่อนไขความปลอดภัยของระบบ';

        case 'over_email_send_rate_limit':
            return 'ส่งอีเมลเกินจำนวนที่กำหนด กรุณาลองใหม่ภายหลัง';

        case 'email_address_not_authorized':
            return 'ระบบส่งอีเมลยังไม่อนุญาตผู้รับนี้ กรุณาติดต่อผู้ดูแล';

        default:
            return error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
    }
}

loginTab.addEventListener('click', () => {
    if (!busy) setMode('login');
});

registerTab.addEventListener('click', () => {
    if (!busy) setMode('register');
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (busy || !db) return;

    const submittedMode = mode;
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const fullName = fullNameInput.value.trim();

    if (submittedMode === 'register' && !fullName) {
        showMessage('กรุณากรอกชื่อ–นามสกุล', true);
        return;
    }

    setBusy(true);
    showMessage('กำลังดำเนินการ…');

    let navigating = false;

    try {
        if (submittedMode === 'register') {
            const { data, error } = await db.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    },
                    emailRedirectTo: new URL(
                        './page2.html',
                        window.location.href
                    ).href
                }
            });

            if (error) throw error;

            // เมื่อปิด Confirm email จะได้ session ทันที
            if (data.session) {
                navigating = true;
                window.location.replace('./page2.html');
                return;
            }

            // เมื่อเปิด Confirm email ให้ผู้ใช้ตรวจกล่องจดหมาย
            setMode('login');
            emailInput.value = email;

            showMessage(
                'ส่งคำขอสมัครแล้ว หากอีเมลนี้สมัครได้ ' +
                'โปรดตรวจกล่องจดหมายและจดหมายขยะเพื่อยืนยันอีเมล'
            );
        } else {
            const { error } = await db.auth.signInWithPassword({
                email,
                password
            });
        if (error) throw error;

            navigating = true;
            window.location.replace('./page2.html');
        }
    } catch (error) {
        showMessage(readableError(error), true);
    } finally {
        if (!navigating) setBusy(false);
    }
});

async function start() {
    setMode('login');
    setBusy(true);
    showMessage('กำลังเชื่อมต่อระบบ…');

    try {
        // โหลดแบบนี้เพื่อแสดงข้อความได้หาก config.js ตั้งค่าไม่ครบ
        ({ db } = await import('./config.js'));

        const { data, error } = await db.auth.getSession();
        if (error) throw error;

        if (data.session) {
            window.location.replace('./page2.html');
            return;
        }

        showMessage('');
        setBusy(false);
    } catch (error) {
        showMessage(
            `เชื่อมต่อระบบไม่สำเร็จ: ${readableError(error)}`,
            true
        );
    }
}

start();