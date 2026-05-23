'use client';

import { useEffect, useState, Fragment } from 'react';
import Sidebar from '../../../components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { db, firebaseConfig } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { StudentProfile, FeeStructure } from '@/types';
import { useRouter } from 'next/navigation';
import { TrashIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { CLASSES, SESSIONS } from '@/lib/schoolConfig';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export default function StudentsPage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);


    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        password: '',
        class: CLASSES[0],   // defaults to 'Class 1'
        session: SESSIONS[1] || '2025-26', // defaults to 2025-26 if available
        section: '',
        transportFee: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.push('/login');
            else if (role !== 'admin') router.push('/student/dashboard');
        }
    }, [user, role, authLoading, router]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'students'));
            const list = querySnapshot.docs.map(doc => ({
                ...doc.data()
            })) as StudentProfile[];
            setStudents(list);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && role === 'admin') {
            fetchStudents();
        }
    }, [user, role]);

    const handleDelete = async (id: string) => {
        if (confirm(`Are you sure you want to delete this student?`)) {
            try {
                await deleteDoc(doc(db, 'students', id));
                await deleteDoc(doc(db, 'users', id)); // Also remove role doc
                await deleteDoc(doc(db, 'fees', 'fees-' + id)); // Remove fees doc too
                fetchStudents();
            } catch (error: unknown) {
                const err = error as Error;
                console.error("Delete failed:", err);
                alert(`Error deleting student: ${err.message}`);
            }
        }
    };


    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {


            // 1. Initialize secondary app to create user without signing out admin
            const secondaryApp = (getApps() as any[]).find(app => app.name === 'Secondary')
                || (initializeApp as any)(firebaseConfig, 'Secondary');
            const secondaryAuth = (getAuth as any)(secondaryApp);

            // STEP 1 & 2: Create Auth User and get UID
            const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                newStudent.email,
                newStudent.password
            );
            const uid = userCredential.user.uid;

            // Immediately sign out of the secondary instance
            await signOut(secondaryAuth);

            // STEP 3: Create users/{uid} document
            await setDoc(doc(db, 'users', uid), {
                name: newStudent.name,
                email: newStudent.email,
                role: 'student'
            });

            const studentId = 'ST-' + uid.slice(0, 5);

            // Fetch matching fee structure for this class and session
            const feeStructuresSnap = await getDocs(
                query(
                    collection(db, 'feeStructures'),
                    where('className', '==', newStudent.class),
                    where('session', '==', newStudent.session)
                )
            );
            
            let matchedStructure = null;
            let totalPayable = 19500; // legacy fallback total
            if (!feeStructuresSnap.empty) {
                matchedStructure = feeStructuresSnap.docs[0].data() as FeeStructure;
                totalPayable = matchedStructure.totalFee;
            } else {
                // Fallback 1: Look for any fee structure for this class in another session
                const anyClassStructuresSnap = await getDocs(
                    query(
                        collection(db, 'feeStructures'),
                        where('className', '==', newStudent.class)
                    )
                );
                if (!anyClassStructuresSnap.empty) {
                    const found = anyClassStructuresSnap.docs[0].data() as FeeStructure;
                    matchedStructure = {
                        ...found,
                        session: newStudent.session
                    };
                    totalPayable = matchedStructure.totalFee;
                } else {
                    // Fallback 2: Query the legacy 'fees' collection for class defaults
                    const legacyFeesSnap = await getDocs(
                        query(
                            collection(db, 'fees'),
                            where('className', '==', newStudent.class)
                        )
                    );
                    if (!legacyFeesSnap.empty) {
                        const legacyData = legacyFeesSnap.docs[0].data();
                        matchedStructure = {
                            className: newStudent.class,
                            session: newStudent.session,
                            admissionFee: 0,
                            tuitionFee: Number(legacyData.tuitionFee || 0),
                            examFee: Number(legacyData.examFee || 0),
                            libraryFee: 0,
                            computerFee: 0,
                            transportFee: Number(legacyData.transportFee || 0),
                            sportsFee: 0,
                            miscFee: 0,
                            totalFee: Number(legacyData.totalFee || 0),
                            feeType: 'yearly' as any,
                            enabledComponents: {
                                admissionFee: false,
                                tuitionFee: true,
                                examFee: true,
                                libraryFee: false,
                                computerFee: false,
                                transportFee: true,
                                sportsFee: false,
                                miscFee: false
                            }
                        };
                        totalPayable = matchedStructure.totalFee;
                    }
                }
            }

            // STEP 4: Create students/{uid} document
            await setDoc(doc(db, 'students', uid), {
                studentId: studentId,
                name: newStudent.name,
                email: newStudent.email,
                class: newStudent.class,
                section: newStudent.section,
                transportFee: Number(newStudent.transportFee),
                userId: uid,
                session: newStudent.session,
                feeStructure: matchedStructure || undefined,
                totalPayable: totalPayable,
                createdAt: serverTimestamp()
            });

            // Initialize Fee document as well (optional but good for consistency)
            await setDoc(doc(db, 'fees', 'fees-' + uid), {
                className: newStudent.class,
                admissionFee: matchedStructure?.admissionFee || 2000,
                tuitionFee: matchedStructure?.tuitionFee || 15000,
                examFee: matchedStructure?.examFee || 1500,
                libraryFee: matchedStructure?.libraryFee || 500,
                computerFee: matchedStructure?.computerFee || 500,
                transportFee: matchedStructure?.transportFee || Number(newStudent.transportFee),
                sportsFee: matchedStructure?.sportsFee || 500,
                miscFee: matchedStructure?.miscFee || 1000,
                totalFee: totalPayable
            });

            alert("Student account created successfully!");
            setIsAddModalOpen(false);
            setNewStudent({
                name: '',
                email: '',
                password: '',
                class: CLASSES[0],
                session: SESSIONS[1] || '2025-26',
                section: '',
                transportFee: 0
            });
            fetchStudents();
        } catch (error: unknown) {
            const err = error as Error;
            console.error("Creation failed", err);
            alert(`Error creating student: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f7f9fc]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ea5e9]"></div>
            </div>
        );
    }

    return (
        <Sidebar>
            <div className="font-sans text-[#0f172a] max-w-7xl mx-auto">
                <div className="sm:flex sm:items-center justify-between mb-8">
                    <div className="sm:flex-auto">
                        <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">Students</h1>
                        <p className="mt-2 text-sm text-[#64748b] font-medium">
                            Manage student enrollments. Adding a student here creates their official login credentials.
                        </p>
                    </div>
                    <div className="mt-4 sm:flex-none">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-br from-[#0ea5e9] to-[#2563eb] text-white text-sm font-bold rounded-xl shadow-sm hover:scale-[1.02] transition-transform"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <UserPlusIcon className="h-5 w-5" />
                            Add Student
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-3xl shadow-sm overflow-hidden animate-fade-in-up">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                                    <th scope="col" className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider">Name</th>
                                    <th scope="col" className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider">Student ID</th>
                                    <th scope="col" className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider">Class</th>
                                    <th scope="col" className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider">Email</th>
                                    <th scope="col" className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9]">
                                {students.map((student) => (
                                    <tr key={student.studentId || student.userId} className="hover:bg-[#f8fafc] transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#f0f9ff] text-[#0ea5e9] font-bold text-sm flex items-center justify-center shrink-0">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-[#0f172a] text-sm">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-[#64748b] font-mono">
                                            {student.userId || (student as StudentProfile & { studentId?: string }).studentId}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                                                {student.class} {(student as StudentProfile & { section?: string }).section ? `- ${(student as StudentProfile & { section?: string }).section}` : ''}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-[#64748b] font-medium">
                                            {student.email || (student as StudentProfile & { parentEmail?: string }).parentEmail}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleDelete(student.userId || (student as StudentProfile & { studentId?: string }).studentId || '')}
                                                className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-xl"
                                                title="Delete Student"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── ADD MODAL ── */}
                <Transition.Root show={isAddModalOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={setIsAddModalOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
                        </Transition.Child>

                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                >
                                    <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-8 border border-[#e2e8f0]">
                                        <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                            <button
                                                type="button"
                                                className="rounded-full bg-slate-50 p-1 text-[#94a3b8] hover:text-[#0f172a] focus:outline-none transition-colors"
                                                onClick={() => setIsAddModalOpen(false)}
                                            >
                                                <span className="sr-only">Close</span>
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div className="sm:flex sm:items-start">
                                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#f0f9ff] sm:mx-0 sm:h-12 sm:w-12 shadow-sm">
                                                <UserPlusIcon className="h-6 w-6 text-[#0ea5e9]" aria-hidden="true" />
                                            </div>
                                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                                <Dialog.Title as="h3" className="text-2xl font-bold text-[#0f172a]">
                                                    Add New Student
                                                </Dialog.Title>
                                                <div className="mt-2">
                                                    <p className="text-sm text-[#64748b] font-medium">
                                                        Enter the student's details. They will be able to log in using the email provided.
                                                    </p>
                                                    <form onSubmit={submitForm} className="mt-6 space-y-5">
                                                        <div>
                                                            <label htmlFor="name" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Full Name</label>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                id="name"
                                                                required
                                                                placeholder="John Doe"
                                                                className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                                value={newStudent.name}
                                                                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="email" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Student Email</label>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                id="email"
                                                                required
                                                                placeholder="student@example.com"
                                                                className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                                value={newStudent.email}
                                                                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label htmlFor="class" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Class</label>
                                                                <select
                                                                    id="class"
                                                                    name="class"
                                                                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                                    value={newStudent.class}
                                                                    onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                                                                >
                                                                    {CLASSES.map((cls) => (
                                                                        <option key={cls} value={cls}>
                                                                            {cls}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="session" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Academic Session</label>
                                                                <select
                                                                    id="session"
                                                                    name="session"
                                                                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                                    value={newStudent.session}
                                                                    onChange={(e) => setNewStudent({ ...newStudent, session: e.target.value })}
                                                                >
                                                                    {SESSIONS.map((ses) => (
                                                                        <option key={ses} value={ses}>
                                                                            {ses}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label htmlFor="section" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Section</label>
                                                                <input
                                                                    type="text"
                                                                    name="section"
                                                                    id="section"
                                                                    required
                                                                    placeholder="A"
                                                                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                                    value={newStudent.section}
                                                                    onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label htmlFor="transportFee" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Transport Fee</label>
                                                                <input
                                                                    type="number"
                                                                    name="transportFee"
                                                                    id="transportFee"
                                                                    placeholder="1000"
                                                                    className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                                    value={newStudent.transportFee}
                                                                    onChange={(e) => setNewStudent({ ...newStudent, transportFee: Number(e.target.value) })}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label htmlFor="password" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Initial Password</label>
                                                            <input
                                                                type="password"
                                                                name="password"
                                                                id="password"
                                                                required
                                                                minLength={6}
                                                                placeholder="••••••••"
                                                                className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                                value={newStudent.password}
                                                                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                                                            />
                                                        </div>

                                                        <div className="mt-8 flex gap-3">
                                                            <button
                                                                type="button"
                                                                className="flex-1 py-3 px-4 bg-white border border-[#e2e8f0] text-[#0f172a] rounded-xl font-bold hover:bg-[#f8fafc] transition-colors shadow-sm"
                                                                onClick={() => setIsAddModalOpen(false)}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={isSubmitting}
                                                                className="flex-1 py-3 px-4 bg-linear-to-br from-[#0ea5e9] to-[#2563eb] text-white rounded-xl font-bold shadow-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                                            >
                                                                {isSubmitting ? 'Adding...' : 'Add Student'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition.Root>
            </div>
        </Sidebar>
    );
}
