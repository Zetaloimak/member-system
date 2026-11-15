const memberContent = document.getElementById('memberContent');
const status = document.getElementById('status');
const displayName = document.getElementById('displayName');
const displayEmail = document.getElementById('displayEmail');
const displayCreatedAt = document.getElementById('displayCreatedAt');
const logoutBtn = document.getElementById('logoutBtn');

let db;

function showStatus(text, error = false) {
    status.textContent = text;
    status.className = `message ${error ? 'error' : 'success'}`;
}

function clearMemberContent() {
    memberContent.hidden = true;
    displayName.textContent = '';
    displayEmail.textContent = '';
    displayCreatedAt.textContent = '';
}

function goToLogin() {
    clearMemberContent();
    window.location.replace('./index.html');
}

async function loadMember() {
    try {
        ({ db } = await import('./config.js?v=2'));

        // ตอบสนองเมื่อออกจากระบบในแท็บอื่นด้วย
        db.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                goToLogin();
            }
        });

        const {
            data: sessionData,
            error: sessionError
        } = await db.auth.getSession();

        if (sessionError) throw sessionError;

        if (!sessionData.session) {
            goToLogin();
            return;
        }

        logoutBtn.hidden = false;

        // ตรวจสอบบัญชีกับ Supabase ก่อนแสดงข้อมูล
        const {
            data: userData,
            error: userError
        } = await db.auth.getUser();

        if (userError) throw userError;

        const user = userData.user;

        if (!user) {
            goToLogin();
            return;
        }

        // ฐานข้อมูลมี RLS ควบคุมว่าอ่านได้เฉพาะแถวของตนเอง
        const {
            data: profile,
            error: profileError
        } = await db
            .from('profiles')
            .select('full_name, created_at')
            .eq('id', user.id)
            .single();

        if (profileError) {
            throw new Error(
                'อ่านโปรไฟล์ไม่สำเร็จ กรุณาตรวจตาราง profiles, Trigger และ RLS: ' +
                profileError.message
            );
        }

        // ใช้ textContent เพื่อแสดงข้อมูลเป็นข้อความ
        displayName.textContent = profile.full_name || 'สมาชิก';
        displayEmail.textContent = user.email || '-';

        displayCreatedAt.textContent = new Date(
            profile.created_at
        ).toLocaleString('th-TH', {
            dateStyle: 'long',
            timeStyle: 'short',
            timeZone: 'Asia/Bangkok'
        });

        memberContent.hidden = false;
        showStatus('เข้าสู่ระบบสำเร็จ');
    } catch (error) {
        clearMemberContent();
        showStatus(error.message || 'โหลดข้อมูลไม่สำเร็จ', true);
    }
}

logoutBtn.addEventListener('click', async () => {
    logoutBtn.disabled = true;
    showStatus('กำลังออกจากระบบ…');

    try {
        const { error } = await db.auth.signOut();
        if (error) throw error;

        goToLogin();
    } catch (error) {
        showStatus(error.message || 'ออกจากระบบไม่สำเร็จ', true);
        logoutBtn.disabled = false;
    }
});

// หากเบราว์เซอร์นำหน้าจากประวัติกลับมา ให้ตรวจสถานะใหม่
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

loadMember();
