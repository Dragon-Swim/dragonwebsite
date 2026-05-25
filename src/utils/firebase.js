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
    updateProfile
} from "firebase/auth";
import {
    getFirestore,
    connectFirestoreEmulator,
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy
} from "firebase/firestore";

// ============================================================
// Firebase 配置 — 从环境变量读取（不提交到 Git）
// 在项目根目录的 .env.local 中设置 VITE_FIREBASE_* 变量
// ============================================================
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
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
// 本地模拟器自动连接
// 检测条件：hostname 为 localhost / 127.0.0.1 且 Vite 处于 dev 模式
// vite build / vite preview 时 import.meta.env.DEV 为 false，不会触发
// ============================================================
const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

if (isLocalhost && import.meta.env.DEV) {
    // Auth 模拟器 — 端口与 firebase.json 中保持一致
    connectAuthEmulator(auth, "http://127.0.0.1:9099");

    // Firestore 模拟器 — 端口与 firebase.json 中保持一致
    connectFirestoreEmulator(db, "127.0.0.1", 8080);

    console.log("[Firebase] 已连接到本地模拟器");
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
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
};
