'use client';

import { useEffect, useState, Fragment } from 'react';
import Sidebar from '../../../components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { StudentProfile } from '@/types';
import { useRouter } from 'next/navigation';
import { TrashIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { CLASSES } from '@/lib/schoolConfig';

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
            } catch (error: any) {
                console.error("Delete failed:", error);
                alert(`Error deleting student: ${error.message}`);
            }
        }
    };


    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { setDoc, serverTimestamp } = await import('firebase/firestore');
            const { initializeApp, getApp, getApps } = await import('firebase/app');
            const { getAuth, createUserWithEmailAndPassword, signOut } = await import('firebase/auth');
            const { firebaseConfig } = await import('@/lib/firebase');

            // 1. Initialize secondary app to create user without signing out admin
            const secondaryApp = getApps().length > 1
                ? getApp('Secondary')
                : initializeApp(firebaseConfig, 'Secondary');
            const secondaryAuth = getAuth(secondaryApp);

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
                email: newStudent.email,
                role: 'student'
            });

            // STEP 4: Create students/{uid} document
            await setDoc(doc(db, 'students', uid), {
                name: newStudent.name,
                email: newStudent.email,
                class: newStudent.class,
                section: newStudent.section,
                transportFee: Number(newStudent.transportFee),
                userId: uid,
                createdAt: serverTimestamp()
            });

            // Initialize Fee document as well (optional but good for consistency)
            await setDoc(doc(db, 'fees', 'fees-' + uid), {
                className: newStudent.class,
                tuitionFee: 5000,
                transportFee: Number(newStudent.transportFee),
                examFee: 500,
                totalFee: 5500 + Number(newStudent.transportFee)
            });

            alert("Student account created successfully!");
            setIsAddModalOpen(false);
            setNewStudent({
                name: '',
                email: '',
                password: '',
                class: CLASSES[0],
                section: '',
                transportFee: 0
            });
            fetchStudents();
        } catch (error: any) {
            console.error("Creation failed", error);
            alert(`Error creating student: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <Sidebar>
            <div className="sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-3xl font-bold leading-7 text-white tracking-tight">Students</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Manage student enrollments. Adding a student here creates their official login credentials.
                    </p>
                </div>
                <div className="mt-4 sm:flex-none">
                    <button
                        type="button"
                        className="block rounded-xl bg-white px-6 py-3 text-center text-sm font-bold text-black shadow-lg border border-yellow-500/30 hover:bg-gray-100 hover:scale-105 transition-all"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <span className="flex items-center gap-2">
                            <UserPlusIcon className="h-5 w-5" />
                            Add Student
                        </span>
                    </button>
                </div>
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-2xl rounded-3xl glass-card">
                            <table className="min-w-full divide-y divide-white/5">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th scope="col" className="py-4 pl-4 pr-3 text-left text-[10px] font-black text-white/40 uppercase tracking-widest sm:pl-6">Name</th>
                                        <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Student ID</th>
                                        <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Class</th>
                                        <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Email</th>
                                        <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-yellow-500/10 bg-transparent">
                                    {students.map((student) => (
                                        <tr key={student.studentId} className="hover:bg-white/5 transition-colors group">
                                            <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-black font-bold text-sm shadow-inner border border-yellow-500/30">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-white/40 font-mono tracking-wide italic">{student.userId || (student as any).studentId}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-white/60">
                                                <span className="inline-flex items-center rounded-lg bg-white/5 px-2.5 py-1 text-xs font-black text-white/40 border border-yellow-500/10 group-hover:bg-white/10 transition-colors">
                                                    {student.class} {(student as any).section ? `- ${(student as any).section}` : ''}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-white/60 font-medium">{student.email || (student as any).parentEmail}</td>
                                            <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={() => handleDelete(student.userId || (student as any).studentId)}
                                                    className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-xl"
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
                </div>
            </div>

            { }
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
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" />
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
                                <Dialog.Panel className="relative transform overflow-hidden rounded-3xl glass-card border border-yellow-500/20 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-8">
                                    <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                        <button
                                            type="button"
                                            className="rounded-lg bg-transparent text-white/40 hover:text-white focus:outline-none transition-colors"
                                            onClick={() => setIsAddModalOpen(false)}
                                        >
                                            <span className="sr-only">Close</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white border border-yellow-500/30 sm:mx-0 sm:h-12 sm:w-12 shadow-inner">
                                            <UserPlusIcon className="h-6 w-6 text-black" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white">
                                                Add New Student
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-sm text-white/40 italic">
                                                    Enter the student&apos;s details. They will be able to log in using the email provided.
                                                </p>
                                                <form onSubmit={submitForm} className="mt-6 space-y-4">
                                                    <div>
                                                        <label htmlFor="name" className="block text-sm font-bold leading-6 text-white/60">Full Name</label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            id="name"
                                                            required
                                                            placeholder="John Doe"
                                                            className="mt-1 block w-full rounded-xl border-0 bg-white/5 py-3 text-white shadow-sm ring-1 ring-inset ring-yellow-500/20 placeholder:text-white/20 focus:ring-2 focus:ring-inset focus:ring-yellow-500/50 sm:text-sm sm:leading-6 transition-all"
                                                            value={newStudent.name}
                                                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="email" className="block text-sm font-bold leading-6 text-white/60">Student Email</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            id="email"
                                                            required
                                                            placeholder="student@example.com"
                                                            className="mt-1 block w-full rounded-xl border-0 bg-white/5 py-3 text-white shadow-sm ring-1 ring-inset ring-yellow-500/20 placeholder:text-white/20 focus:ring-2 focus:ring-inset focus:ring-yellow-500/50 sm:text-sm sm:leading-6 transition-all"
                                                            value={newStudent.email}
                                                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="class" className="block text-sm font-bold leading-6 text-white/60">Class</label>
                                                        <select
                                                            id="class"
                                                            name="class"
                                                            className="mt-1 block w-full rounded-xl border-0 bg-white/5 py-3 text-white shadow-sm ring-1 ring-inset ring-yellow-500/20 focus:ring-2 focus:ring-inset focus:ring-yellow-500/50 sm:text-sm sm:leading-6 transition-all"
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
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label htmlFor="section" className="block text-sm font-bold leading-6 text-white/60">Section</label>
                                                            <input
                                                                type="text"
                                                                name="section"
                                                                id="section"
                                                                required
                                                                placeholder="A"
                                                                className="mt-1 block w-full rounded-xl border-0 bg-white/5 py-3 text-white shadow-sm ring-1 ring-inset ring-yellow-500/20 placeholder:text-white/20 focus:ring-2 focus:ring-inset focus:ring-yellow-500/50 sm:text-sm sm:leading-6 transition-all"
                                                                value={newStudent.section}
                                                                onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="transportFee" className="block text-sm font-bold leading-6 text-white/60">Transport Fee</label>
                                                            <input
                                                                type="number"
                                                                name="transportFee"
                                                                id="transportFee"
                                                                placeholder="1000"
                                                                className="mt-1 block w-full rounded-xl border-0 bg-white/5 py-3 text-white shadow-sm ring-1 ring-inset ring-yellow-500/20 placeholder:text-white/20 focus:ring-2 focus:ring-inset focus:ring-yellow-500/50 sm:text-sm sm:leading-6 transition-all"
                                                                value={newStudent.transportFee}
                                                                onChange={(e) => setNewStudent({ ...newStudent, transportFee: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="password" className="block text-sm font-bold leading-6 text-white/60">Initial Password</label>
                                                        <input
                                                            type="password"
                                                            name="password"
                                                            id="password"
                                                            required
                                                            minLength={6}
                                                            placeholder="••••••••"
                                                            className="mt-1 block w-full rounded-xl border-0 bg-white/5 py-3 text-white shadow-sm ring-1 ring-inset ring-yellow-500/20 placeholder:text-white/20 focus:ring-2 focus:ring-inset focus:ring-yellow-500/50 sm:text-sm sm:leading-6 transition-all"
                                                            value={newStudent.password}
                                                            onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="mt-8 sm:flex sm:flex-row-reverse gap-3">
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmitting}
                                                            className="inline-flex w-full justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-black border border-yellow-500/30 shadow-lg hover:bg-gray-100 hover:scale-[1.02] transition-all sm:w-auto disabled:opacity-50 disabled:transform-none"
                                                        >
                                                            {isSubmitting ? 'Adding...' : 'Add Student'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="mt-3 inline-flex w-full justify-center rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-white/60 shadow-sm border border-white/10 hover:bg-white/10 hover:text-white transition-all sm:mt-0 sm:w-auto"
                                                            onClick={() => setIsAddModalOpen(false)}
                                                            style={{ marginTop: 0 }}
                                                        >
                                                            Cancel
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
        </Sidebar>
    );
}
