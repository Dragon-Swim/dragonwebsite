import { initializeApp } from "firebase/app";
import {
    getAuth,
    connectAuthEmulator,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import {
    getFirestore,
    connectFirestoreEmulator,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    writeBatch
} from "firebase/firestore";

// ============================================================
// Firebase 配置 — 从环境变量读取（不提交到 Git）
// 在项目根目录的 .env.local 中设置 VITE_FIREBASE_* 变量
// ============================================================

// 本地模拟器连接开关（opt-in）：
// 只有 VITE_USE_FIREBASE_EMULATOR=true 且运行在 localhost 的 dev 模式下才连接。
// Playwright 测试由 playwright.config.js 的 webServer.env 打开这个开关；
// 日常 `npm run dev` 不带该变量，仍然连真实项目，行为与以前一致。
const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

const USE_EMULATOR =
    isLocalhost &&
    import.meta.env.DEV &&
    import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    // 模拟器模式下固定使用 demo- 项目 ID：即使配置写错，也不可能碰到线上数据。
    projectId: USE_EMULATOR ? "demo-dragon-swim" : import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

// ============================================================
// 本地模拟器连接
// 端口与 firebase.json 中保持一致
// ============================================================
if (USE_EMULATOR) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");

    connectFirestoreEmulator(db, "127.0.0.1", 8080);

    console.log("[Firebase] 已连接到本地模拟器 (project demo-dragon-swim)");
    console.log("[Firebase]   Auth:      http://127.0.0.1:9099");
    console.log("[Firebase]   Firestore: http://127.0.0.1:8080");
}

// ============================================================
// 连接测试工具（写入一条测试文档到 members 集合）
// 仅用于验证 Firebase 连线是否正常
// ============================================================
export async function testWriteMember() {
    try {
        const docRef = await addDoc(collection(db, "members"), {
            name: "xiaohai",
            age: 12,
            stroke: "Freestyle",
            joinedAt: new Date(),
            status: "active",
        });
        console.log("testWriteMember succeeded. Doc ID:", docRef.id);
        alert(`Write succeeded!\nDoc ID: ${docRef.id}`);
        return docRef.id;
    } catch (error) {
        console.error("testWriteMember failed:", error);
        alert(`Write failed: ${error.message}`);
        throw error;
    }
}

export {
    auth,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    googleProvider,
    onAuthStateChanged,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    writeBatch,
};
