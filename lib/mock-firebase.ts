
// Mock Firebase Config
export const firebaseConfig = {
    apiKey: "mock-api-key",
    authDomain: "mock-auth-domain",
    projectId: "mock-project-id",
    storageBucket: "mock-storage-bucket",
    messagingSenderId: "mock-messaging-sender-id",
    appId: "mock-app-id",
    measurementId: "mock-measurement-id",
};

// Types & Classes to satisfy TypeScript compiler
export const initializeApp = () => ({ name: "[MockFirebaseApp]" });
export const getApps = () => [];
export const getApp = () => ({ name: "[MockFirebaseApp]" });

export class FirebaseApp {}
export class Auth {}
export class Firestore {}

// LocalStorage helpers
const isClient = typeof window !== 'undefined';

const getStore = (key: string, defaultVal: any) => {
    if (!isClient) return defaultVal;
    const val = localStorage.getItem(`mock_db_${key}`);
    if (!val) {
        localStorage.setItem(`mock_db_${key}`, JSON.stringify(defaultVal));
        return defaultVal;
    }
    try {
        return JSON.parse(val);
    } catch {
        return defaultVal;
    }
};

const setStore = (key: string, val: any) => {
    if (!isClient) return;
    localStorage.setItem(`mock_db_${key}`, JSON.stringify(val));
};

// Data seeding
const defaultUsers: Record<string, any> = {
    "admin-uid": { uid: "admin-uid", email: "admin@sds.edu", name: "Principal Administrator", role: "admin", createdAt: Date.now() },
    "student-uid": { uid: "student-uid", email: "student@sds.edu", name: "Aarav Sharma", role: "student", createdAt: Date.now() }
};

const defaultStudents: Record<string, any> = {
    "ST-12345": { studentId: "ST-12345", name: "Aarav Sharma", class: "Class 10", parentEmail: "student@sds.edu", userId: "student-uid" }
};

const defaultFees: Record<string, any> = {
    "fees-Class 10": { className: "Class 10", tuitionFee: 15000, transportFee: 3000, examFee: 1500, totalFee: 19500 },
};

// Seed classes 1-12
for (let i = 1; i <= 12; i++) {
    const className = `Class ${i}`;
    const id = `fees-${className}`;
    if (!defaultFees[id]) {
        defaultFees[id] = {
            className,
            tuitionFee: 4000 + i * 1000,
            transportFee: 1500 + (i % 2) * 500,
            examFee: 500 + i * 100,
            totalFee: (4000 + i * 1000) + (1500 + (i % 2) * 500) + (500 + i * 100)
        };
    }
}

const defaultFeeStructures: Record<string, any> = {};
const seedClasses = ["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
seedClasses.forEach((cls, i) => {
    const key = `fs-${cls}-2025-26`;
    const tuition = 5000 + i * 1000;
    const admission = 2000 + i * 500;
    const exam = 500 + i * 100;
    const library = 300 + i * 50;
    const computer = 500 + i * 100;
    const transport = 1500 + (i % 2) * 500;
    const sports = 400 + i * 50;
    const misc = 800 + i * 100;
    
    defaultFeeStructures[key] = {
        id: key,
        className: cls,
        session: "2025-26",
        admissionFee: admission,
        tuitionFee: tuition,
        examFee: exam,
        libraryFee: library,
        computerFee: computer,
        transportFee: transport,
        sportsFee: sports,
        miscFee: misc,
        totalFee: admission + tuition + exam + library + computer + transport + sports + misc,
        feeType: "yearly",
        enabledComponents: {
            admissionFee: true,
            tuitionFee: true,
            examFee: true,
            libraryFee: true,
            computerFee: true,
            transportFee: true,
            sportsFee: true,
            miscFee: true
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
});

const defaultPayments: Record<string, any> = {
    "PAY-99001": { paymentId: "PAY-99001", studentId: "ST-12345", userId: "student-uid", amount: 18200, status: "paid", paymentStatus: "success", stripeSessionId: "sess_99001", createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000 },
    "PAY-99002": { paymentId: "PAY-99002", studentId: "ST-12345", userId: "student-uid", amount: 1500, status: "paid", paymentStatus: "success", stripeSessionId: "sess_99002", createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, updatedAt: Date.now() - 60 * 24 * 60 * 60 * 1000 }
};

const defaultReceipts: Record<string, any> = {
    "receipt-99001": {
        receiptId: "receipt-99001",
        receiptNumber: "REC-99001",
        studentId: "ST-12345",
        userId: "student-uid",
        studentName: "Aarav Sharma",
        class: "Class 10",
        feeType: "Tuition & Terms",
        amountPaid: 18200,
        paymentMode: "Stripe Online",
        transactionId: "sess_99001",
        paymentStatus: "paid",
        paidAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        generatedBy: "System Auto"
    },
    "receipt-99002": {
        receiptId: "receipt-99002",
        receiptNumber: "REC-99002",
        studentId: "ST-12345",
        userId: "student-uid",
        studentName: "Aarav Sharma",
        class: "Class 10",
        feeType: "Tuition & Terms",
        amountPaid: 1500,
        paymentMode: "Stripe Online",
        transactionId: "sess_99002",
        paymentStatus: "paid",
        paidAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        generatedBy: "System Auto"
    }
};

// Seed stores if empty
if (isClient) {
    getStore("users", defaultUsers);
    getStore("students", defaultStudents);
    getStore("fees", defaultFees);
    getStore("payments", defaultPayments);
    getStore("receipts", defaultReceipts);
    
    // Self-healing merge for feeStructures to inject newly added class defaults into existing localStorage
    const currentFeeStructures = getStore("feeStructures", {});
    let hasChanges = false;
    Object.entries(defaultFeeStructures).forEach(([key, val]) => {
        if (!currentFeeStructures[key]) {
            currentFeeStructures[key] = val;
            hasChanges = true;
        }
    });
    if (hasChanges) {
        setStore("feeStructures", currentFeeStructures);
    }
}

// MOCK AUTH STATE
let currentUser: any = null;
if (isClient) {
    const saved = localStorage.getItem('mock_auth_user');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
        } catch {}
    }
}

const authListeners: Array<(user: any) => void> = [];

export const auth = {
    get currentUser() {
        return currentUser;
    },
    signOut: async () => {
        triggerAuthListeners(null);
    }
};

export const getAuth = () => auth;

const triggerAuthListeners = (user: any) => {
    currentUser = user;
    if (isClient) {
        if (user) {
            localStorage.setItem('mock_auth_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('mock_auth_user');
        }
    }
    authListeners.forEach(cb => cb(user));
};

export class GoogleAuthProvider {
    customParameters: Record<string, string> = {};
    setCustomParameters(params: Record<string, string>) {
        this.customParameters = { ...this.customParameters, ...params };
    }
}

export const signInWithPopup = async (authObj: any, provider: any) => {
    const selectedEmail = provider?.customParameters?.selectedEmail;
    
    let isStudent = true;
    let customUserEmail = "";
    
    if (selectedEmail) {
        if (selectedEmail === 'student@sds.edu') {
            isStudent = true;
        } else if (selectedEmail === 'admin@sds.edu') {
            isStudent = false;
        } else {
            customUserEmail = selectedEmail;
        }
    } else {
        isStudent = confirm("Log in as STUDENT (Aarav Sharma)?\nClick 'OK' for Student, 'Cancel' for Administrator.");
    }
    
    let user;
    if (customUserEmail) {
        const emailLower = customUserEmail.toLowerCase();
        const users = getStore("users", {});
        const foundEntry = Object.entries(users).find(([uid, u]: any) => u.email.toLowerCase() === emailLower);
        
        if (foundEntry) {
            const [uid, foundUser] = foundEntry as [string, any];
            const studentsStore = getStore("students", {});
            const foundStudent = Object.values(studentsStore).find((s: any) => 
                (s.email && s.email.toLowerCase() === emailLower) || 
                (s.parentEmail && s.parentEmail.toLowerCase() === emailLower) || 
                s.userId === uid
            ) as any;
            const displayName = foundStudent?.name || foundUser.name || foundUser.displayName || customUserEmail.split('@')[0];
            
            user = {
                uid: uid,
                email: foundUser.email,
                displayName: displayName
            };
        } else {
            const uid = 'usr_' + Math.random().toString(36).substring(2, 9);
            const displayName = customUserEmail.split('@')[0];
            const isNewAdmin = emailLower.includes('admin');
            const studentName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            user = { uid, email: customUserEmail, displayName: studentName };
            
            users[uid] = { 
                uid, 
                email: customUserEmail, 
                name: studentName, 
                role: isNewAdmin ? "admin" : "student", 
                createdAt: Date.now() 
            };
            setStore("users", users);

            if (!isNewAdmin) {
                // Create student profile doc
                const studentsStore = getStore("students", {});
                const studentId = 'ST-' + Math.floor(10000 + Math.random() * 90000);
                studentsStore[studentId] = {
                    studentId,
                    name: studentName,
                    class: "Class 10",
                    parentEmail: customUserEmail,
                    userId: uid,
                    createdAt: Date.now()
                };
                setStore("students", studentsStore);

                // Also create fee structure
                const fees = getStore("fees", {});
                fees['fees-' + studentId] = {
                    className: "Class 10",
                    tuitionFee: 15000,
                    transportFee: 3000,
                    examFee: 1500,
                    totalFee: 19500
                };
                setStore("fees", fees);
            }
        }
    } else if (isStudent) {
        user = { uid: "student-uid", email: "student@sds.edu", displayName: "Aarav Sharma" };
        const users = getStore("users", {});
        users["student-uid"] = { uid: "student-uid", email: "student@sds.edu", name: "Aarav Sharma", role: "student", createdAt: Date.now() };
        setStore("users", users);
    } else {
        user = { uid: "admin-uid", email: "admin@sds.edu", displayName: "Principal Administrator" };
        const users = getStore("users", {});
        users["admin-uid"] = { uid: "admin-uid", email: "admin@sds.edu", name: "Principal Administrator", role: "admin", createdAt: Date.now() };
        setStore("users", users);
    }
    triggerAuthListeners(user);
    return { user };
};

export const signInWithEmailAndPassword = async (authObj: any, email: string, pass: string) => {
    const emailLower = email.toLowerCase();
    const users = getStore("users", {});
    
    // Find in users store
    const foundEntry = Object.entries(users).find(([uid, u]: any) => u.email.toLowerCase() === emailLower);
    
    let user;
    if (foundEntry) {
        const [uid, foundUser] = foundEntry as [string, any];
        // Find name in students store if possible
        const studentsStore = getStore("students", {});
        const foundStudent = Object.values(studentsStore).find((s: any) => 
            (s.email && s.email.toLowerCase() === emailLower) || 
            (s.parentEmail && s.parentEmail.toLowerCase() === emailLower) || 
            s.userId === uid
        ) as any;
        const displayName = foundStudent?.name || foundUser.name || foundUser.displayName || email.split('@')[0];
        
        user = {
            uid: uid,
            email: foundUser.email,
            displayName: displayName
        };
    } else {
        // Not found in users store, let's create a user
        const isNewAdmin = emailLower.includes('admin') || emailLower === 'newraj990@gmail.com';
        
        if (isNewAdmin) {
            const uid = "admin-uid";
            user = { uid, email: email, displayName: "Principal Administrator" };
            users[uid] = { uid, email: email, name: "Principal Administrator", role: "admin", createdAt: Date.now() };
            setStore("users", users);
        } else {
            // New student
            const uid = 'usr_' + Math.random().toString(36).substring(2, 9);
            const displayName = email.split('@')[0];
            const studentName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            
            user = { uid, email: email, displayName: studentName };
            
            users[uid] = { uid, email: email, name: studentName, role: "student", createdAt: Date.now() };
            setStore("users", users);
            
            // Create student profile
            const studentsStore = getStore("students", {});
            const studentId = 'ST-' + Math.floor(10000 + Math.random() * 90000);
            studentsStore[studentId] = {
                studentId,
                name: studentName,
                class: "Class 10",
                parentEmail: email,
                userId: uid,
                createdAt: Date.now()
            };
            setStore("students", studentsStore);

            // Create fee structure
            const fees = getStore("fees", {});
            fees['fees-' + studentId] = {
                className: "Class 10",
                tuitionFee: 15000,
                transportFee: 3000,
                examFee: 1500,
                totalFee: 19500
            };
            setStore("fees", fees);
        }
    }
    
    triggerAuthListeners(user);
    return { user };
};

export const createUserWithEmailAndPassword = async (authObj: any, email: string, pass: string) => {
    const uid = 'usr_' + Math.random().toString(36).substring(2, 9);
    const user = { uid, email, displayName: email.split('@')[0] };
    
    // Add to users store
    const users = getStore("users", {});
    users[uid] = { uid, email, name: user.displayName, role: "student", createdAt: Date.now() };
    setStore("users", users);
    
    triggerAuthListeners(user);
    return { user };
};

export const signOut = async (authObj: any) => {
    triggerAuthListeners(null);
};

export const onAuthStateChanged = (authObj: any, callback: (user: any) => void) => {
    authListeners.push(callback);
    // Call back instantly
    setTimeout(() => callback(currentUser), 0);
    return () => {
        const idx = authListeners.indexOf(callback);
        if (idx !== -1) authListeners.splice(idx, 1);
    };
};

// MOCK FIRESTORE
export const db = { name: "[MockFirestore]" };
export const getFirestore = () => db;
export const initializeFirestore = () => db;

const snapshotListeners: Array<{ collectionName: string, queryRef: any, callback: (snap: any) => void }> = [];

export const collection = (dbObj: any, path: string) => {
    return { collectionName: path };
};

export const doc = (dbOrCol: any, pathOrId?: string, ...more: string[]) => {
    if (dbOrCol && dbOrCol.collectionName) {
        return { collectionName: dbOrCol.collectionName, id: pathOrId };
    }
    if (more.length > 0) {
        return { collectionName: pathOrId, id: more[0] };
    }
    if (pathOrId) {
        const parts = pathOrId.split('/');
        return { collectionName: parts[0], id: parts[1] };
    }
    return { collectionName: 'unknown', id: 'unknown' };
};

export const setDoc = async (docRef: any, data: any, options?: { merge?: boolean }) => {
    const store = getStore(docRef.collectionName, {});
    store[docRef.id] = { ...store[docRef.id], ...data };
    setStore(docRef.collectionName, store);
    triggerSnapshotListeners(docRef.collectionName);
    return docRef;
};

export const getDoc = async (docRef: any) => {
    const store = getStore(docRef.collectionName, {});
    const data = store[docRef.id];
    return {
        exists: () => !!data,
        data: () => data,
        id: docRef.id
    };
};

export const addDoc = async (colRef: any, data: any) => {
    const id = 'doc_' + Math.random().toString(36).substring(2, 9);
    const store = getStore(colRef.collectionName, {});
    store[id] = { ...data, id };
    setStore(colRef.collectionName, store);
    triggerSnapshotListeners(colRef.collectionName);
    return { id };
};

export const updateDoc = async (docRef: any, data: any) => {
    const store = getStore(docRef.collectionName, {});
    if (store[docRef.id]) {
        store[docRef.id] = { ...store[docRef.id], ...data };
        setStore(docRef.collectionName, store);
        triggerSnapshotListeners(docRef.collectionName);
    }
};

export const deleteDoc = async (docRef: any) => {
    const store = getStore(docRef.collectionName, {});
    delete store[docRef.id];
    setStore(docRef.collectionName, store);
    triggerSnapshotListeners(docRef.collectionName);
};

export const query = (colRef: any, ...constraints: any[]) => {
    return { collectionName: colRef.collectionName, constraints };
};

export const where = (field: string, op: string, val: any) => {
    return { type: 'where', field, op, val };
};

export const orderBy = (field: string, dir?: string) => {
    return { type: 'orderBy', field, dir };
};

export const serverTimestamp = () => Date.now();

export const getDocs = async (queryRef: any) => {
    const collectionName = queryRef.collectionName;
    const constraints = queryRef.constraints || [];
    const store = getStore(collectionName, {});
    let docs = Object.keys(store).map(id => ({
        id,
        ...store[id]
    }));

    for (const c of constraints) {
        if (c.type === 'where') {
            const { field, op, val } = c;
            docs = docs.filter(doc => {
                const itemVal = doc[field];
                if (op === '==') return itemVal === val;
                if (op === '>=') return itemVal >= val;
                if (op === '<=') return itemVal <= val;
                if (op === 'array-contains') return Array.isArray(itemVal) && itemVal.includes(val);
                return true;
            });
        } else if (c.type === 'orderBy') {
            const { field, dir } = c;
            docs.sort((a, b) => {
                const valA = a[field];
                const valB = b[field];
                if (valA < valB) return dir === 'desc' ? 1 : -1;
                if (valA > valB) return dir === 'desc' ? -1 : 1;
                return 0;
            });
        }
    }

    const docObjects = docs.map(d => ({
        id: d.id,
        exists: () => true,
        data: () => d
    }));

    return {
        empty: docObjects.length === 0,
        docs: docObjects,
        forEach: (cb: (doc: any) => void) => docObjects.forEach(cb)
    };
};

export const onSnapshot = (queryRef: any, callback: (snap: any) => void) => {
    const listener = { collectionName: queryRef.collectionName, queryRef, callback };
    snapshotListeners.push(listener);
    
    // Initial fetch
    getDocs(queryRef).then(snap => {
        callback(snap);
    });

    return () => {
        const idx = snapshotListeners.indexOf(listener);
        if (idx !== -1) snapshotListeners.splice(idx, 1);
    };
};

const triggerSnapshotListeners = (collectionName: string) => {
    const active = snapshotListeners.filter(l => l.collectionName === collectionName);
    active.forEach(async (l) => {
        const snap = await getDocs(l.queryRef);
        l.callback(snap);
    });
};
