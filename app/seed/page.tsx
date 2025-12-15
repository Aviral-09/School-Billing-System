'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SeedPage() {
    const [status, setStatus] = useState('');

    const createAdmin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                role: 'admin',
                createdAt: Date.now()
            });

            setStatus('Success! You are now an Admin. Go to /login');
        } catch (error: any) {
            setStatus('Error: ' + error.message);
        }
    };

    const createStudent = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                role: 'student',
                createdAt: Date.now()
            });

            
            await setDoc(doc(db, 'students', 'ST-' + user.uid.slice(0, 5)), {
                studentId: 'ST-' + user.uid.slice(0, 5),
                name: user.displayName,
                class: 'Class 10',
                parentEmail: user.email, 
                userId: user.uid
            });

            
            await setDoc(doc(db, 'fees', 'fees-' + user.uid), {
                className: 'Class 10',
                tuitionFee: 5000,
                transportFee: 1000,
                examFee: 500,
                totalFee: 6500
            });

            setStatus('Success! Created Student + Fee Record. Go to /login');
        } catch (error: any) {
            setStatus('Error: ' + error.message);
        }
    };

    return (
        <div className="p-10 space-y-5">
            <h1 className="text-2xl font-bold">Database Seeder (DEV ONLY)</h1>
            <p className="text-red-500">Delete this file before production!</p>

            <div className="space-x-4">
                <button
                    onClick={createAdmin}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                >
                    Login & Make Me ADMIN
                </button>

                <button
                    onClick={createStudent}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Login & Make Me STUDENT
                </button>
            </div>

            <p className="mt-4 font-mono">{status}</p>
        </div>
    );
}
