'use client';

import { useEffect, useState, Fragment } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, query, orderBy } from 'firebase/firestore';
import { StudentProfile } from '@/types';
import { useRouter } from 'next/navigation';
import { TrashIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

export default function StudentsPage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    
    const [newStudent, setNewStudent] = useState({
        name: '',
        parentEmail: '',
        class: 'Class 1'
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

    const handleDelete = async (studentId: string) => {
        if (confirm(`Are you sure you want to delete student ${studentId}?`)) {
            try {
                
                
                
                const q = query(collection(db, 'students'), orderBy('studentId')); 
                
                
                

                await deleteDoc(doc(db, 'students', studentId));
                fetchStudents();
            } catch (error: any) {
                console.error("Delete failed:", error);

                
                
                if (error.code === 'not-found' || true) {
                    
                    
                }
            }
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            
            const studentId = 'ST-' + Date.now().toString().slice(-6);

            
            
            
            
            
            

            
            
            
            
            

            
            

            
        } catch (error) {
            console.error("Add Student Error:", error);
            alert("Failed to add student.");
        }
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { setDoc } = await import('firebase/firestore'); 

            const studentId = 'ST-' + Math.floor(100000 + Math.random() * 900000); 

            await setDoc(doc(db, 'students', studentId), {
                studentId,
                name: newStudent.name,
                class: newStudent.class,
                parentEmail: newStudent.parentEmail,
                userId: null 
            });

            
            await setDoc(doc(db, 'fees', 'fees-' + studentId), {
                className: newStudent.class,
                tuitionFee: 5000,
                transportFee: 1000,
                examFee: 500,
                totalFee: 6500
            });

            setIsAddModalOpen(false);
            setNewStudent({ name: '', parentEmail: '', class: 'Class 1' });
            fetchStudents();
        } catch (error) {
            console.error("Creation failed", error);
            alert("Error creating student");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <Sidebar>
            <div className="sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-3xl font-bold leading-7 text-white tracking-tight">Students</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Manage student enrollments. Adding a student here allows them to log in with their Google Email.
                    </p>
                </div>
                <div className="mt-4 sm:flex-none">
                    <button
                        type="button"
                        className="block rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-center text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105 transition-all"
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
                                        <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-bold text-slate-300 sm:pl-6">Name</th>
                                        <th scope="col" className="px-3 py-4 text-left text-sm font-bold text-slate-300">Student ID</th>
                                        <th scope="col" className="px-3 py-4 text-left text-sm font-bold text-slate-300">Class</th>
                                        <th scope="col" className="px-3 py-4 text-left text-sm font-bold text-slate-300">Parent Email</th>
                                        <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-transparent">
                                    {students.map((student) => (
                                        <tr key={student.studentId} className="hover:bg-white/5 transition-colors group">
                                            <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-inner ring-1 ring-emerald-500/30">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-400 font-mono tracking-wide">{student.studentId}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-400">
                                                <span className="inline-flex items-center rounded-lg bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-300 ring-1 ring-inset ring-white/10 group-hover:bg-white/10 transition-colors">
                                                    {student.class}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-400">{student.parentEmail}</td>
                                            <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={() => handleDelete(student.studentId)}
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

            {}
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
                        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" />
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
                                <Dialog.Panel className="relative transform overflow-hidden rounded-3xl glass-card border border-white/10 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-8">
                                    <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                        <button
                                            type="button"
                                            className="rounded-lg bg-transparent text-slate-400 hover:text-white focus:outline-none transition-colors"
                                            onClick={() => setIsAddModalOpen(false)}
                                        >
                                            <span className="sr-only">Close</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 sm:mx-0 sm:h-12 sm:w-12 shadow-inner ring-1 ring-emerald-500/20">
                                            <UserPlusIcon className="h-6 w-6 text-emerald-500" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white">
                                                Add New Student
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-sm text-slate-400">
                                                    Enter the student's details. They will be able to log in using the email provided.
                                                </p>
                                                <form onSubmit={submitForm} className="mt-6 space-y-4">
                                                    <div>
                                                        <label htmlFor="name" className="block text-sm font-bold leading-6 text-slate-300">Full Name</label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            id="name"
                                                            required
                                                            placeholder="John Doe"
                                                            className="mt-1 block w-full rounded-xl border-0 bg-slate-900/50 py-3 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all"
                                                            value={newStudent.name}
                                                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="email" className="block text-sm font-bold leading-6 text-slate-300">Parent/Student Google Email</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            id="email"
                                                            required
                                                            placeholder="parent@example.com"
                                                            className="mt-1 block w-full rounded-xl border-0 bg-slate-900/50 py-3 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all"
                                                            value={newStudent.parentEmail}
                                                            onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="class" className="block text-sm font-bold leading-6 text-slate-300">Class</label>
                                                        <select
                                                            id="class"
                                                            name="class"
                                                            className="mt-1 block w-full rounded-xl border-0 bg-slate-900/50 py-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all"
                                                            value={newStudent.class}
                                                            onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                                                        >
                                                            {[...Array(12)].map((_, i) => (
                                                                <option key={i + 1} value={`Class ${i + 1}`}>
                                                                    Class {i + 1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mt-8 sm:flex sm:flex-row-reverse gap-3">
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmitting}
                                                            className="inline-flex w-full justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all sm:w-auto disabled:opacity-50 disabled:transform-none"
                                                        >
                                                            {isSubmitting ? 'Adding...' : 'Add Student'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="mt-3 inline-flex w-full justify-center rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-white transition-all sm:mt-0 sm:w-auto"
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
