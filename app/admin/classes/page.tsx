'use client';

import { useEffect, useState, Fragment } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { StudentProfile, FeeStructure, Payment } from '@/types';
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { CLASSES, SESSIONS } from '@/lib/schoolConfig';
import {
    AdjustmentsHorizontalIcon,
    BuildingLibraryIcon,
    UserGroupIcon,
    CurrencyRupeeIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

interface ClassMetric {
    className: string;
    studentCount: number;
    expectedFee: number;
    collectedFee: number;
    pendingFee: number;
}

export default function ClassesPage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter and action states
    const [selectedSession, setSelectedSession] = useState<string>('2025-26');
    const [selectedClass, setSelectedClass] = useState<string>(CLASSES[0]);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    
    // Bulk action Form states
    const [bulkClass, setBulkClass] = useState<string>(CLASSES[0]);
    const [bulkSession, setBulkSession] = useState<string>('2025-26');
    const [bulkStructureId, setBulkStructureId] = useState<string>('');
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.push('/login');
            else if (role !== 'admin') router.push('/student/dashboard');
        }
    }, [user, role, authLoading, router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const studentsSnap = await getDocs(collection(db, 'students'));
            const studentsList = studentsSnap.docs.map(d => ({
                id: d.id,
                ...d.data()
            })) as StudentProfile[];
            setStudents(studentsList);

            const paymentsSnap = await getDocs(collection(db, 'payments'));
            const paymentsList = paymentsSnap.docs.map(d => d.data() as Payment);
            setPayments(paymentsList);

            const structuresSnap = await getDocs(collection(db, 'feeStructures'));
            const structuresList = structuresSnap.docs.map(d => ({
                id: d.id,
                ...d.data()
            })) as FeeStructure[];
            setFeeStructures(structuresList);

            // Pre-select first structure if available
            if (structuresList.length > 0) {
                setBulkStructureId(structuresList[0].id || '');
            }
        } catch (error) {
            console.error("Error fetching class management data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && role === 'admin') {
            fetchData();
        }
    }, [user, role]);

    // Calculate metrics per class for the selected session
    const getClassMetrics = (): ClassMetric[] => {
        return CLASSES.map(clsName => {
            const classStudents = students.filter(s => s.class === clsName && (s.session || '2025-26') === selectedSession);
            const studentIds = new Set(classStudents.map(s => s.studentId || s.userId));

            // Sum student totalPayable
            let expectedFee = 0;
            classStudents.forEach(s => {
                expectedFee += s.totalPayable !== undefined ? s.totalPayable : 19500; // fallback to legacy
            });

            // Sum payments
            const collectedFee = payments
                .filter(p => studentIds.has(p.studentId) && (p.paymentStatus === 'success' || (p as any).status === 'paid'))
                .reduce((sum, p) => sum + p.amount, 0);

            const pendingFee = Math.max(0, expectedFee - collectedFee);

            return {
                className: clsName,
                studentCount: classStudents.length,
                expectedFee,
                collectedFee,
                pendingFee
            };
        }).filter(m => m.studentCount > 0); // Show only active classes
    };

    const activeMetrics = getClassMetrics();

    // Summary totals for HUD
    const totalExpected = activeMetrics.reduce((sum, m) => sum + m.expectedFee, 0);
    const totalCollected = activeMetrics.reduce((sum, m) => sum + m.collectedFee, 0);
    const totalPending = activeMetrics.reduce((sum, m) => sum + m.pendingFee, 0);
    const totalStudents = activeMetrics.reduce((sum, m) => sum + m.studentCount, 0);

    // List of students in the selected class + session
    const classStudentsList = students.filter(s => s.class === selectedClass && (s.session || '2025-26') === selectedSession);

    const getStudentFinancials = (student: StudentProfile) => {
        const expected = student.totalPayable !== undefined ? student.totalPayable : 19500;
        const paid = payments
            .filter(p => (p.studentId === student.studentId || p.userId === student.userId) && (p.paymentStatus === 'success' || (p as any).status === 'paid'))
            .reduce((sum, p) => sum + p.amount, 0);
        const dues = Math.max(0, expected - paid);
        return { expected, paid, dues };
    };

    const handleBulkApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bulkStructureId) {
            alert("Please select a target fee structure.");
            return;
        }

        const selectedStructure = feeStructures.find(fs => fs.id === bulkStructureId);
        if (!selectedStructure) {
            alert("Selected fee structure not found.");
            return;
        }

        const targetStudents = students.filter(s => s.class === bulkClass && (s.session || '2025-26') === bulkSession);

        if (targetStudents.length === 0) {
            alert(`No students found in ${bulkClass} for academic session ${bulkSession}.`);
            return;
        }

        const confirmMsg = `Are you sure you want to bulk-apply the "${selectedStructure.className} (${selectedStructure.session})" fee structure to all ${targetStudents.length} students of ${bulkClass} in session ${bulkSession}?\n\nThis will update their total payable fees to ₹${selectedStructure.totalFee.toLocaleString()}.`;
        
        if (!confirm(confirmMsg)) return;

        setIsApplying(true);

        try {
            // Firestore batch updates
            for (const student of targetStudents) {
                // Key is student.userId (or id)
                const docId = student.userId || student.studentId || '';
                if (docId) {
                    // Update student doc
                    await setDoc(doc(db, 'students', docId), {
                        feeStructure: selectedStructure,
                        totalPayable: selectedStructure.totalFee,
                        session: bulkSession
                    }, { merge: true });

                    // Update fees doc for backwards-compatibility
                    await setDoc(doc(db, 'fees', 'fees-' + docId), {
                        className: bulkClass,
                        admissionFee: selectedStructure.admissionFee,
                        tuitionFee: selectedStructure.tuitionFee,
                        examFee: selectedStructure.examFee,
                        libraryFee: selectedStructure.libraryFee,
                        computerFee: selectedStructure.computerFee,
                        transportFee: selectedStructure.transportFee,
                        sportsFee: selectedStructure.sportsFee,
                        miscFee: selectedStructure.miscFee,
                        totalFee: selectedStructure.totalFee
                    }, { merge: true });
                }
            }

            alert("Bulk structure application completed successfully!");
            setIsBulkOpen(false);
            fetchData();
        } catch (error) {
            console.error("Bulk apply failed:", error);
            alert("An error occurred during bulk structure updates.");
        } finally {
            setIsApplying(false);
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
            <div className="font-sans text-[#0f172a] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="sm:flex sm:items-center justify-between mb-8">
                    <div className="sm:flex-auto">
                        <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">Class Management</h1>
                        <p className="mt-2 text-sm text-[#64748b] font-medium">
                            Overview of student distributions, collection targets, actual revenue, and bulk fee reassignments.
                        </p>
                    </div>
                    <div className="mt-4 sm:flex-none">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-br from-[#0ea5e9] to-[#2563eb] text-white text-sm font-bold rounded-xl shadow-sm hover:scale-[1.02] transition-transform animate-pulse"
                            onClick={() => setIsBulkOpen(true)}
                        >
                            <ArrowPathIcon className="h-5 w-5" />
                            Bulk Reassign Fees
                        </button>
                    </div>
                </div>

                {/* Session Filter */}
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs mb-8 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-sm text-[#64748b] font-semibold">
                        <AdjustmentsHorizontalIcon className="h-5 w-5" />
                        Selected Session:
                    </div>
                    <div>
                        <select
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                            className="bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] cursor-pointer"
                        >
                            {SESSIONS.map(ses => (
                                <option key={ses} value={ses}>Session {ses}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* KPI stats bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Active Students</span>
                            <UserGroupIcon className="h-5 w-5 text-indigo-500" />
                        </div>
                        <p className="text-3xl font-black text-[#0f172a]">{totalStudents}</p>
                        <p className="text-xs text-[#94a3b8] font-medium mt-1">Enrolled in {selectedSession}</p>
                    </div>
                    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Target Collection</span>
                            <CurrencyRupeeIcon className="h-5 w-5 text-[#0ea5e9]" />
                        </div>
                        <p className="text-3xl font-black text-[#0f172a]">₹{totalExpected.toLocaleString()}</p>
                        <p className="text-xs text-[#94a3b8] font-medium mt-1">Expected gross fees</p>
                    </div>
                    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Total Collected</span>
                            <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-black text-emerald-600">₹{totalCollected.toLocaleString()}</p>
                        <p className="text-xs text-[#94a3b8] font-medium mt-1">Fulfillment status active</p>
                    </div>
                    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Outstanding Dues</span>
                            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                        </div>
                        <p className="text-3xl font-black text-amber-500">₹{totalPending.toLocaleString()}</p>
                        <p className="text-xs text-[#94a3b8] font-medium mt-1">Remaining to be collected</p>
                    </div>
                </div>

                {/* Active Classes Grid */}
                <h2 className="text-xl font-bold text-[#0f172a] mb-5 flex items-center gap-2">
                    <BuildingLibraryIcon className="h-6 w-6 text-[#0ea5e9]" />
                    Class summaries ({selectedSession})
                </h2>
                
                {activeMetrics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {activeMetrics.map((metric) => {
                            const percent = metric.expectedFee > 0 ? (metric.collectedFee / metric.expectedFee) * 100 : 0;
                            return (
                                <div 
                                    key={metric.className} 
                                    className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold text-[#0f172a] tracking-tight">{metric.className}</h3>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                                                {metric.studentCount} Students
                                            </span>
                                        </div>

                                        <div className="space-y-3 mt-4 text-xs font-medium text-[#64748b]">
                                            <div className="flex justify-between">
                                                <span>Expected Amount:</span>
                                                <span className="font-semibold text-[#0f172a]">₹{metric.expectedFee.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Collected Amount:</span>
                                                <span className="font-semibold text-emerald-600">₹{metric.collectedFee.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Outstanding Dues:</span>
                                                <span className="font-semibold text-amber-500">₹{metric.pendingFee.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 border-t border-[#f1f5f9] pt-4">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                                            <span>Collection rate</span>
                                            <span className="text-[#0ea5e9]">{percent.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                                            <div className="bg-[#0ea5e9] h-full" style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white border border-[#e2e8f0] rounded-3xl shadow-xs mb-12">
                        <BuildingLibraryIcon className="h-12 w-12 text-[#94a3b8] mx-auto mb-4" />
                        <p className="text-[#64748b] font-semibold">No students registered in session {selectedSession} yet.</p>
                    </div>
                )}

                {/* Class Student Detail Section */}
                <div className="bg-white border border-[#e2e8f0] rounded-3xl shadow-xs overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-[#e2e8f0]">
                        <div>
                            <h2 className="text-lg font-bold text-[#0f172a]">Class Auditing</h2>
                            <p className="text-xs text-[#64748b] font-medium mt-1">Audit individual student fee sheets for a specific grade.</p>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] cursor-pointer"
                            >
                                {CLASSES.map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                                    <th className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider">Student Name</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider">Session</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider text-right">Expected</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider text-right">Collected</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider text-right">Outstanding</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider">Active Fee Structure</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9]">
                                {classStudentsList.length > 0 ? (
                                    classStudentsList.map((student) => {
                                        const { expected, paid, dues } = getStudentFinancials(student);
                                        return (
                                            <tr key={student.studentId || student.userId} className="hover:bg-[#f8fafc] transition-colors">
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <div className="font-bold text-sm text-[#0f172a]">{student.name}</div>
                                                        <div className="text-[10px] text-[#94a3b8] font-mono mt-0.5">#{student.studentId || student.userId}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-xs text-[#64748b] font-semibold">{student.session || '2025-26'}</span>
                                                </td>
                                                <td className="py-4 px-6 text-right font-bold text-sm text-[#0f172a]">
                                                    ₹{expected.toLocaleString()}
                                                </td>
                                                <td className="py-4 px-6 text-right font-bold text-sm text-emerald-600">
                                                    ₹{paid.toLocaleString()}
                                                </td>
                                                <td className="py-4 px-6 text-right font-bold text-sm text-amber-500">
                                                    ₹{dues.toLocaleString()}
                                                </td>
                                                <td className="py-4 px-6">
                                                    {student.feeStructure ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#f0f9ff] text-[#0ea5e9] border border-[#e0f2fe]">
                                                            {student.feeStructure.className} Structure (₹{student.feeStructure.totalFee.toLocaleString()})
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                                            Legacy Standard
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-[#64748b] text-sm">
                                            No students found in {selectedClass} for academic session {selectedSession}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* BULK ACTION MODAL */}
                <Transition.Root show={isBulkOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={setIsBulkOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" />
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
                                                onClick={() => setIsBulkOpen(false)}
                                            >
                                                <span className="sr-only">Close</span>
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>

                                        <div className="sm:flex sm:items-start">
                                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#f0f9ff] sm:mx-0 sm:h-12 sm:w-12 shadow-xs">
                                                <ArrowPathIcon className="h-6 w-6 text-[#0ea5e9]" aria-hidden="true" />
                                            </div>
                                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                                <Dialog.Title as="h3" className="text-2xl font-bold text-[#0f172a]">
                                                    Bulk Reassign Fee Structure
                                                </Dialog.Title>
                                                <p className="text-sm text-[#64748b] font-medium mt-1">
                                                    Reassign a configured fee structure to all students of a selected class grade for a specific session.
                                                </p>

                                                <form onSubmit={handleBulkApply} className="mt-6 space-y-5">
                                                    <div>
                                                        <label htmlFor="bulk-class" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Class Grade</label>
                                                        <select
                                                            id="bulk-class"
                                                            className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                            value={bulkClass}
                                                            onChange={(e) => setBulkClass(e.target.value)}
                                                        >
                                                            {CLASSES.map((cls) => (
                                                                <option key={cls} value={cls}>{cls}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="bulk-session" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Academic Session</label>
                                                        <select
                                                            id="bulk-session"
                                                            className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                            value={bulkSession}
                                                            onChange={(e) => setBulkSession(e.target.value)}
                                                        >
                                                            {SESSIONS.map((ses) => (
                                                                <option key={ses} value={ses}>{ses}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="bulk-struct" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Target Fee Structure</label>
                                                        <select
                                                            id="bulk-struct"
                                                            className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                            value={bulkStructureId}
                                                            onChange={(e) => setBulkStructureId(e.target.value)}
                                                        >
                                                            <option value="" disabled>-- Select Fee Structure --</option>
                                                            {feeStructures.map((struct) => (
                                                                <option key={struct.id} value={struct.id}>
                                                                    {struct.className} - {struct.session} (₹{struct.totalFee.toLocaleString()})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="flex gap-3 pt-4">
                                                        <button
                                                            type="button"
                                                            className="flex-1 py-3 px-4 bg-white border border-[#e2e8f0] text-[#0f172a] rounded-xl font-bold hover:bg-[#f8fafc] transition-colors shadow-xs"
                                                            onClick={() => setIsBulkOpen(false)}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={isApplying}
                                                            className="flex-1 py-3 px-4 bg-linear-to-br from-[#0ea5e9] to-[#2563eb] text-white rounded-xl font-bold shadow-xs hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                                        >
                                                            {isApplying ? 'Applying...' : 'Apply to Class'}
                                                        </button>
                                                    </div>
                                                </form>
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
