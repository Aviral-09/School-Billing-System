'use client';

import { useEffect, useState, Fragment } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, setDoc, addDoc } from 'firebase/firestore';
import { FeeStructure } from '@/types';
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { CLASSES, SESSIONS } from '@/lib/schoolConfig';
import { 
    PlusIcon, 
    TrashIcon, 
    DocumentDuplicateIcon, 
    PencilSquareIcon,
    XMarkIcon,
    CheckIcon,
    AdjustmentsHorizontalIcon,
    CurrencyRupeeIcon,
    CalendarDaysIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

const INITIAL_MODAL_DATA: Omit<FeeStructure, 'id'> = {
    className: CLASSES[0],
    session: SESSIONS[0],
    admissionFee: 0,
    tuitionFee: 0,
    examFee: 0,
    libraryFee: 0,
    computerFee: 0,
    transportFee: 0,
    sportsFee: 0,
    miscFee: 0,
    totalFee: 0,
    feeType: 'yearly',
    enabledComponents: {
        admissionFee: true,
        tuitionFee: true,
        examFee: true,
        libraryFee: true,
        computerFee: true,
        transportFee: true,
        sportsFee: true,
        miscFee: true
    }
};

export default function FeeStructuresPage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'duplicate'>('create');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Filter states
    const [filterClass, setFilterClass] = useState<string>('All');
    const [filterSession, setFilterSession] = useState<string>('All');

    // Form states
    const [formData, setFormData] = useState<Omit<FeeStructure, 'id'>>({ ...INITIAL_MODAL_DATA });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.push('/login');
            else if (role !== 'admin') router.push('/student/dashboard');
        }
    }, [user, role, authLoading, router]);

    const fetchFeeStructures = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'feeStructures'));
            const list = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FeeStructure[];
            setFeeStructures(list);
        } catch (error) {
            console.error("Error fetching fee structures:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && role === 'admin') {
            fetchFeeStructures();
        }
    }, [user, role]);

    // Live total calculation whenever values or toggles change
    const calculateTotal = (data: typeof formData) => {
        let sum = 0;
        if (data.enabledComponents.admissionFee) sum += Number(data.admissionFee || 0);
        if (data.enabledComponents.tuitionFee) sum += Number(data.tuitionFee || 0);
        if (data.enabledComponents.examFee) sum += Number(data.examFee || 0);
        if (data.enabledComponents.libraryFee) sum += Number(data.libraryFee || 0);
        if (data.enabledComponents.computerFee) sum += Number(data.computerFee || 0);
        if (data.enabledComponents.transportFee) sum += Number(data.transportFee || 0);
        if (data.enabledComponents.sportsFee) sum += Number(data.sportsFee || 0);
        if (data.enabledComponents.miscFee) sum += Number(data.miscFee || 0);
        return sum;
    };

    const handleComponentToggle = (component: keyof FeeStructure['enabledComponents']) => {
        const updatedEnabled = {
            ...formData.enabledComponents,
            [component]: !formData.enabledComponents[component]
        };
        const updatedForm = {
            ...formData,
            enabledComponents: updatedEnabled
        };
        updatedForm.totalFee = calculateTotal(updatedForm);
        setFormData(updatedForm);
    };

    const handleNumberChange = (field: keyof Omit<FeeStructure, 'id' | 'className' | 'session' | 'feeType' | 'enabledComponents' | 'createdAt' | 'updatedAt'>, value: string) => {
        const numVal = Math.max(0, Number(value) || 0);
        const updatedForm = {
            ...formData,
            [field]: numVal
        };
        updatedForm.totalFee = calculateTotal(updatedForm);
        setFormData(updatedForm);
    };

    const handleDelete = async (id: string, name: string, session: string) => {
        if (confirm(`Are you sure you want to delete the fee structure for ${name} (${session})?`)) {
            try {
                await deleteDoc(doc(db, 'feeStructures', id));
                alert("Fee structure deleted successfully!");
                fetchFeeStructures();
            } catch (error) {
                console.error("Delete failed:", error);
                alert("Failed to delete fee structure.");
            }
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setEditingId(null);
        setFormData({ ...INITIAL_MODAL_DATA });
        setIsModalOpen(true);
    };

    const openEditModal = (struct: FeeStructure) => {
        setModalMode('edit');
        setEditingId(struct.id || null);
        setFormData({
            className: struct.className,
            session: struct.session,
            admissionFee: struct.admissionFee,
            tuitionFee: struct.tuitionFee,
            examFee: struct.examFee,
            libraryFee: struct.libraryFee,
            computerFee: struct.computerFee,
            transportFee: struct.transportFee,
            sportsFee: struct.sportsFee,
            miscFee: struct.miscFee,
            totalFee: struct.totalFee,
            feeType: struct.feeType,
            enabledComponents: { ...struct.enabledComponents }
        });
        setIsModalOpen(true);
    };

    const openDuplicateModal = (struct: FeeStructure) => {
        setModalMode('duplicate');
        setEditingId(null);
        setFormData({
            className: struct.className,
            session: struct.session,
            admissionFee: struct.admissionFee,
            tuitionFee: struct.tuitionFee,
            examFee: struct.examFee,
            libraryFee: struct.libraryFee,
            computerFee: struct.computerFee,
            transportFee: struct.transportFee,
            sportsFee: struct.sportsFee,
            miscFee: struct.miscFee,
            totalFee: struct.totalFee,
            feeType: struct.feeType,
            enabledComponents: { ...struct.enabledComponents }
        });
        setIsModalOpen(true);
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate duplicates: same class & session
            const isDuplicate = feeStructures.some(struct => 
                struct.className === formData.className &&
                struct.session === formData.session &&
                struct.id !== editingId
            );

            if (isDuplicate) {
                alert(`Error: A fee structure for ${formData.className} in Academic Session ${formData.session} already exists!`);
                setIsSubmitting(false);
                return;
            }

            const currentTimestamp = Date.now();
            const structureData = {
                ...formData,
                updatedAt: currentTimestamp,
                createdAt: modalMode === 'edit' ? undefined : currentTimestamp
            };

            // Remove undefined fields for Firestore compatibility
            if (modalMode === 'edit' && editingId) {
                await setDoc(doc(db, 'feeStructures', editingId), structureData, { merge: true });
                alert("Fee structure updated successfully!");
            } else {
                const uniqueId = `fs-${formData.className.replace(/\s+/g, '-')}-${formData.session}`;
                await setDoc(doc(db, 'feeStructures', uniqueId), {
                    ...structureData,
                    id: uniqueId,
                    createdAt: currentTimestamp
                });
                alert("Fee structure created successfully!");
            }

            setIsModalOpen(false);
            fetchFeeStructures();
        } catch (error) {
            console.error("Failed to save fee structure:", error);
            alert("An error occurred while saving. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter calculations
    const filteredStructures = feeStructures.filter(struct => {
        const matchesClass = filterClass === 'All' || struct.className === filterClass;
        const matchesSession = filterSession === 'All' || struct.session === filterSession;
        return matchesClass && matchesSession;
    });

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
                        <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">Fee Structure Management</h1>
                        <p className="mt-2 text-sm text-[#64748b] font-medium">
                            Configure, edit, and review academic session fee components and total amounts for each class grade.
                        </p>
                    </div>
                    <div className="mt-4 sm:flex-none">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-br from-[#0ea5e9] to-[#2563eb] text-white text-sm font-bold rounded-xl shadow-sm hover:scale-[1.02] transition-transform"
                            onClick={openCreateModal}
                        >
                            <PlusIcon className="h-5 w-5" />
                            Add Fee Structure
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs mb-8 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-sm text-[#64748b] font-semibold">
                        <AdjustmentsHorizontalIcon className="h-5 w-5" />
                        Filters:
                    </div>
                    <div>
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] cursor-pointer"
                        >
                            <option value="All">All Classes</option>
                            {CLASSES.map(cls => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={filterSession}
                            onChange={(e) => setFilterSession(e.target.value)}
                            className="bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] cursor-pointer"
                        >
                            <option value="All">All Sessions</option>
                            {SESSIONS.map(ses => (
                                <option key={ses} value={ses}>{ses}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Fee Structures Grid */}
                {filteredStructures.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStructures.map((struct) => (
                            <div 
                                key={struct.id} 
                                className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-xs hover:border-[#0ea5e9]/50 hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f0f9ff] text-[#0ea5e9] border border-[#e0f2fe] mb-2">
                                                {struct.session}
                                            </span>
                                            <h3 className="text-xl font-bold text-[#0f172a] tracking-tight">{struct.className}</h3>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] bg-slate-100 px-2 py-1 rounded">
                                            {struct.feeType}
                                        </span>
                                    </div>

                                    {/* Breakdown Mini List */}
                                    <div className="space-y-2.5 border-t border-[#f1f5f9] pt-4 mb-6">
                                        {Object.entries(struct.enabledComponents).map(([key, enabled]) => {
                                            if (!enabled) return null;
                                            const label = key.replace(/Fee$/, '').replace(/([A-Z])/g, ' $1');
                                            const valKey = key as keyof Omit<FeeStructure, 'id' | 'className' | 'session' | 'feeType' | 'enabledComponents' | 'createdAt' | 'updatedAt'>;
                                            return (
                                                <div key={key} className="flex justify-between text-xs font-medium text-[#64748b]">
                                                    <span className="capitalize">{label} Fee</span>
                                                    <span className="font-semibold text-[#0f172a]">₹{(struct[valKey] || 0).toLocaleString()}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center border-t border-[#f1f5f9] pt-4 mt-auto">
                                        <div>
                                            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Total Payable</p>
                                            <p className="text-2xl font-black text-[#0f172a]">₹{struct.totalFee.toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openEditModal(struct)}
                                                className="p-2 text-slate-400 hover:text-[#0ea5e9] hover:bg-slate-50 rounded-xl transition-all"
                                                title="Edit Structure"
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => openDuplicateModal(struct)}
                                                className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 rounded-xl transition-all"
                                                title="Duplicate Structure"
                                            >
                                                <DocumentDuplicateIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(struct.id || '', struct.className, struct.session)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-xl transition-all"
                                                title="Delete Structure"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-[#e2e8f0] rounded-3xl shadow-xs">
                        <AcademicCapIcon className="h-12 w-12 text-[#94a3b8] mx-auto mb-4" />
                        <p className="text-[#64748b] font-semibold">No fee structures found matching current filter values.</p>
                        <button
                            type="button"
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#f0f9ff] text-[#0ea5e9] text-xs font-bold rounded-xl border border-[#e0f2fe] hover:bg-[#e0f2fe]"
                            onClick={openCreateModal}
                        >
                            Create First Structure
                        </button>
                    </div>
                )}

                {/* MODAL */}
                <Transition.Root show={isModalOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={setIsModalOpen}>
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
                                    <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-8 border border-[#e2e8f0]">
                                        <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                            <button
                                                type="button"
                                                className="rounded-full bg-slate-50 p-1 text-[#94a3b8] hover:text-[#0f172a] focus:outline-none transition-colors"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                <span className="sr-only">Close</span>
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>

                                        <div className="sm:flex sm:items-start">
                                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#f0f9ff] sm:mx-0 sm:h-12 sm:w-12 shadow-xs">
                                                <AdjustmentsHorizontalIcon className="h-6 w-6 text-[#0ea5e9]" aria-hidden="true" />
                                            </div>
                                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                                <Dialog.Title as="h3" className="text-2xl font-bold text-[#0f172a]">
                                                    {modalMode === 'create' ? 'Create Fee Structure' : modalMode === 'edit' ? 'Edit Fee Structure' : 'Duplicate Fee Structure'}
                                                </Dialog.Title>
                                                <p className="text-sm text-[#64748b] font-medium mt-1">
                                                    Configure settings and configure which fee components are active for students in this class session.
                                                </p>

                                                <form onSubmit={submitForm} className="mt-6 space-y-6">
                                                    {/* Primary Class / Session Row */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <div>
                                                            <label htmlFor="modal-class" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Class Grade</label>
                                                            <select
                                                                id="modal-class"
                                                                className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                                value={formData.className}
                                                                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                                                                disabled={modalMode === 'edit'}
                                                            >
                                                                {CLASSES.map((cls) => (
                                                                    <option key={cls} value={cls}>{cls}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="modal-session" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Academic Session</label>
                                                            <select
                                                                id="modal-session"
                                                                className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                                value={formData.session}
                                                                onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                                                                disabled={modalMode === 'edit'}
                                                            >
                                                                {SESSIONS.map((ses) => (
                                                                    <option key={ses} value={ses}>{ses}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="modal-type" className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Fee Interval Type</label>
                                                            <select
                                                                id="modal-type"
                                                                className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                                                value={formData.feeType}
                                                                onChange={(e) => setFormData({ ...formData, feeType: e.target.value as any })}
                                                            >
                                                                <option value="monthly">Monthly</option>
                                                                <option value="quarterly">Quarterly</option>
                                                                <option value="yearly">Yearly</option>
                                                                <option value="one-time">One-Time</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Component Configuration Section */}
                                                    <div className="border-t border-[#f1f5f9] pt-6">
                                                        <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-4">Fee Component Configuration</h4>
                                                        
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                                            {/* Render fee inputs with enable/disable toggles */}
                                                            {[
                                                                { key: 'admissionFee', label: 'Admission Fee' },
                                                                { key: 'tuitionFee', label: 'Tuition Fee' },
                                                                { key: 'examFee', label: 'Examination Fee' },
                                                                { key: 'libraryFee', label: 'Library Fee' },
                                                                { key: 'computerFee', label: 'Computer Fee' },
                                                                { key: 'transportFee', label: 'Transport Fee' },
                                                                { key: 'sportsFee', label: 'Sports Fee' },
                                                                { key: 'miscFee', label: 'Miscellaneous Fee' }
                                                            ].map(({ key, label }) => {
                                                                const valKey = key as keyof Omit<FeeStructure, 'id' | 'className' | 'session' | 'feeType' | 'enabledComponents' | 'createdAt' | 'updatedAt'>;
                                                                const isEnabled = formData.enabledComponents[key as keyof FeeStructure['enabledComponents']];
                                                                return (
                                                                    <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                                        <div className="flex items-center gap-2.5">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleComponentToggle(key as keyof FeeStructure['enabledComponents'])}
                                                                                className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isEnabled ? 'bg-[#0ea5e9] border-[#0ea5e9] text-white' : 'bg-white border-[#cbd5e1] text-transparent'}`}
                                                                            >
                                                                                <CheckIcon className="w-3.5 h-3.5 stroke-[3px]" />
                                                                            </button>
                                                                            <span className={`text-xs font-semibold ${isEnabled ? 'text-[#0f172a]' : 'text-[#94a3b8] line-through'}`}>{label}</span>
                                                                        </div>
                                                                        <div className="relative w-32">
                                                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#94a3b8]">₹</span>
                                                                            <input
                                                                                type="number"
                                                                                disabled={!isEnabled}
                                                                                className="w-full pl-6 pr-3 py-1.5 bg-white border border-[#e2e8f0] text-right text-xs font-bold text-[#0f172a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] disabled:opacity-40"
                                                                                value={formData[valKey] || ''}
                                                                                onChange={(e) => handleNumberChange(valKey, e.target.value)}
                                                                                placeholder="0"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Total Calculation Panel */}
                                                    <div className="bg-[#f0f9ff] border border-[#e0f2fe] rounded-2xl p-5 flex justify-between items-center">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-wider">Calculated Total</p>
                                                            <p className="text-xs text-[#64748b] font-medium mt-0.5">Sum of all enabled components.</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-3xl font-black text-[#0f172a]">₹{formData.totalFee.toLocaleString()}</p>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-3 pt-4 border-t border-[#f1f5f9]">
                                                        <button
                                                            type="button"
                                                            className="flex-1 py-3 px-4 bg-white border border-[#e2e8f0] text-[#0f172a] rounded-xl font-bold hover:bg-[#f8fafc] transition-colors shadow-xs"
                                                            onClick={() => setIsModalOpen(false)}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmitting}
                                                            className="flex-1 py-3 px-4 bg-linear-to-br from-[#0ea5e9] to-[#2563eb] text-white rounded-xl font-bold shadow-xs hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                                        >
                                                            {isSubmitting ? 'Saving...' : 'Save Structure'}
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
