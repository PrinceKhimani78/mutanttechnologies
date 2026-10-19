'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    Search, 
    Download, 
    RefreshCw, 
    FileText, 
    ExternalLink, 
    Mail, 
    Phone, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    AlertCircle, 
    Copy, 
    Check, 
    Eye, 
    Trash2, 
    UserCheck, 
    Briefcase, 
    X, 
    Users, 
    Info, 
    Send, 
    Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CareerApplication } from '@/lib/types';

interface EmailModalState {
    isOpen: boolean;
    type: 'rejection' | 'shortlist';
    candidate: CareerApplication;
    subject: string;
    message: string;
    sending: boolean;
}

export function CandidatesManager() {
    const [applications, setApplications] = useState<CareerApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [dismissNotice, setDismissNotice] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedCandidate, setSelectedCandidate] = useState<CareerApplication | null>(null);
    const [candidateNotes, setCandidateNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    
    // Email notification modal state
    const [emailModal, setEmailModal] = useState<EmailModalState | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async (sync = false) => {
        if (sync) setSyncing(true);
        else setLoading(true);

        try {
            const url = sync ? '/api/admin/careers/applications?sync=true' : '/api/admin/careers/applications';
            const res = await fetch(url);
            const data = await res.json();

            if (data.success && data.applications) {
                setApplications(data.applications);
                if (data.notice) setNotice(data.notice);
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
        } finally {
            setLoading(false);
            setSyncing(false);
        }
    };

    const handleDirectStatusUpdate = async (id: string, newStatus: CareerApplication['status']) => {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
        if (selectedCandidate && selectedCandidate.id === id) {
            setSelectedCandidate(prev => prev ? { ...prev, status: newStatus } : null);
        }

        try {
            await fetch('/api/admin/careers/applications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const initiateStatusChange = (candidate: CareerApplication, targetStatus: CareerApplication['status']) => {
        const firstName = (candidate.name || 'Candidate').split(' ')[0];

        if (targetStatus === 'rejected') {
            setEmailModal({
                isOpen: true,
                type: 'rejection',
                candidate,
                subject: `Update regarding your application for ${candidate.job_title} at Mutant Technologies`,
                message: `Thank you very much for taking the time to apply for the ${candidate.job_title} position at Mutant Technologies, and for your interest in joining our team.\n\nWe received a high volume of applications from talented individuals. While your background and qualifications are impressive, after thorough consideration, we have decided to move forward with other candidates whose experience more closely matches our immediate project needs for this specific role.\n\nThis was a difficult decision. We will gladly keep your resume on file, and should another suitable opportunity arise that aligns with your skillset, we would love to get in touch.\n\nWe sincerely appreciate your interest in Mutant Technologies and wish you the very best in your career pursuits.`,
                sending: false
            });
        } else if (targetStatus === 'shortlisted') {
            setEmailModal({
                isOpen: true,
                type: 'shortlist',
                candidate,
                subject: `Great news! You have been shortlisted for ${candidate.job_title} at Mutant Technologies`,
                message: `Thank you for applying for the ${candidate.job_title} role at Mutant Technologies!\n\nWe are pleased to let you know that our recruitment and technical team has reviewed your application and resume, and we have SHORTLISTED you for the next round of our hiring process!\n\nWe were very impressed by your qualifications and project background, and our team is enthusiastic to speak with you further.\n\nWhat's next?\nA member of our hiring team will reach out to you shortly via phone or email to schedule an introductory interview / technical conversation.\n\nIn the meantime, feel free to explore our recent work, client stories, and agency culture at mutanttechnologies.com.\n\nCongratulations again, and we look forward to speaking soon!`,
                sending: false
            });
        } else {
            handleDirectStatusUpdate(candidate.id, targetStatus);
        }
    };

    const handleSendEmailAndChangeStatus = async () => {
        if (!emailModal?.candidate) return;
        setEmailModal(prev => prev ? { ...prev, sending: true } : null);

        const { candidate, type, subject, message } = emailModal;

        try {
            const res = await fetch('/api/admin/careers/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId: candidate.id,
                    type,
                    candidateName: candidate.name,
                    candidateEmail: candidate.email,
                    jobTitle: candidate.job_title,
                    customSubject: subject,
                    customMessage: message
                })
            });

            const data = await res.json();
            if (data.success) {
                const newStatus = type === 'shortlist' ? 'shortlisted' : 'rejected';
                handleDirectStatusUpdate(candidate.id, newStatus);
                setToastMessage(`✓ ${type === 'shortlist' ? 'Shortlist' : 'Rejection'} email sent to ${candidate.email}!`);
                setTimeout(() => setToastMessage(null), 4000);
                setEmailModal(null);
            } else {
                alert('Failed to send email: ' + (data.error || 'Unknown error'));
                setEmailModal(prev => prev ? { ...prev, sending: false } : null);
            }
        } catch (err: any) {
            alert('Error sending email: ' + err.message);
            setEmailModal(prev => prev ? { ...prev, sending: false } : null);
        }
    };

    const handleUpdateStatusWithoutEmail = () => {
        if (!emailModal?.candidate) return;
        const newStatus = emailModal.type === 'shortlist' ? 'shortlisted' : 'rejected';
        handleDirectStatusUpdate(emailModal.candidate.id, newStatus);
        setEmailModal(null);
    };

    const handleSaveNotes = async () => {
        if (!selectedCandidate) return;
        setSavingNotes(true);
        try {
            await fetch('/api/admin/careers/applications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedCandidate.id, notes: candidateNotes })
            });
            setApplications(prev => prev.map(app => app.id === selectedCandidate.id ? { ...app, notes: candidateNotes } : app));
            setSelectedCandidate(prev => prev ? { ...prev, notes: candidateNotes } : null);
        } catch (err) {
            console.error('Failed to save notes:', err);
        } finally {
            setSavingNotes(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this application?')) return;
        setApplications(prev => prev.filter(app => app.id !== id));
        if (selectedCandidate?.id === id) setSelectedCandidate(null);

        try {
            await fetch(`/api/admin/careers/applications?id=${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
        } catch (err) {
            console.error('Failed to delete application:', err);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const openCandidateModal = (candidate: CareerApplication) => {
        setSelectedCandidate(candidate);
        setCandidateNotes(candidate.notes || '');
    };

    const uniqueRoles = useMemo(() => {
        const roles = new Set(applications.map(app => app.job_title).filter(Boolean));
        return Array.from(roles);
    }, [applications]);

    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const matchesSearch = 
                (app.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (app.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (app.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (app.job_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (app.cover_letter || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = roleFilter === 'all' || app.job_title === roleFilter;
            const matchesStatus = statusFilter === 'all' || (app.status || 'new') === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [applications, searchQuery, roleFilter, statusFilter]);

    const stats = useMemo(() => {
        const total = applications.length;
        const newApps = applications.filter(a => !a.status || a.status === 'new').length;
        const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
        const reviewed = applications.filter(a => a.status === 'reviewed').length;
        return { total, newApps, shortlisted, reviewed };
    }, [applications]);

    const exportToCsv = () => {
        if (applications.length === 0) return;
        const headers = ['Name', 'Email', 'Phone', 'Role Applied', 'Status', 'Date Applied', 'Resume URL', 'Cover Letter'];
        const rows = applications.map(app => [
            `"${(app.name || '').replace(/"/g, '""')}"`,
            `"${(app.email || '').replace(/"/g, '""')}"`,
            `"${(app.phone || '').replace(/"/g, '""')}"`,
            `"${(app.job_title || '').replace(/"/g, '""')}"`,
            `"${(app.status || 'new').replace(/"/g, '""')}"`,
            `"${new Date(app.created_at).toLocaleString()}"`,
            `"${(app.resume_url || '').replace(/"/g, '""')}"`,
            `"${(app.cover_letter || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `candidates_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusBadge = (status: string = 'new') => {
        switch (status) {
            case 'shortlisted':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Shortlisted
                    </span>
                );
            case 'reviewed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                        <Clock className="w-3.5 h-3.5" /> Reviewed
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                        <AlertCircle className="w-3.5 h-3.5" /> New Applicant
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading candidate applications...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-800 animate-in fade-in slide-in-from-bottom-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium">{toastMessage}</span>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Candidates</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-oswald text-foreground">{stats.total}</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] sm:text-xs font-semibold text-amber-500 uppercase tracking-wider">New Unreviewed</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-oswald text-foreground">{stats.newApps}</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] sm:text-xs font-semibold text-emerald-500 uppercase tracking-wider">Shortlisted</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-oswald text-foreground">{stats.shortlisted}</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] sm:text-xs font-semibold text-blue-500 uppercase tracking-wider">Roles Applied</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-oswald text-foreground">{uniqueRoles.length}</div>
                </div>
            </div>

            {/* Filter & Action Bar */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search & Dropdowns */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name, email, phone, role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-primary cursor-pointer truncate max-w-[170px]"
                        >
                            <option value="all">All Roles ({applications.length})</option>
                            {uniqueRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-primary cursor-pointer truncate"
                        >
                            <option value="all">All Statuses</option>
                            <option value="new">New</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-zinc-800">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fetchApplications(true)} 
                        disabled={syncing}
                        className="text-xs h-9 flex-1 sm:flex-initial"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? 'animate-spin text-primary' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Emails'}
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={exportToCsv}
                        className="text-xs h-9 flex-1 sm:flex-initial"
                    >
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Notice banner */}
            {notice && !dismissNotice && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <Info className="w-4 h-4 shrink-0 text-amber-600" />
                        <span className="leading-snug">{notice}</span>
                    </div>
                    <button onClick={() => setDismissNotice(true)} className="p-1 hover:text-foreground shrink-0 text-amber-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Candidates List Header */}
            <div className="flex items-center justify-between px-1 text-xs text-gray-500 font-medium">
                <span>Showing {filteredApplications.length} of {applications.length} candidates</span>
            </div>

            {/* Candidates List */}
            <div className="space-y-4">
                {filteredApplications.map((candidate) => {
                    const initials = (candidate.name || 'Candidate')
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map(n => n[0].toUpperCase())
                        .join('');

                    return (
                        <div 
                            key={candidate.id}
                            className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-primary/40 hover:shadow-md transition-all p-5 sm:p-6 space-y-4"
                        >
                            {/* Top Section: Avatar + Info + Actions */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                {/* Left Info: Avatar + Details */}
                                <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 text-primary border border-primary/20 flex items-center justify-center font-bold text-base shrink-0 font-oswald">
                                        {initials}
                                    </div>

                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 
                                                className="font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors cursor-pointer truncate" 
                                                onClick={() => openCandidateModal(candidate)}
                                            >
                                                {candidate.name}
                                            </h3>
                                            {getStatusBadge(candidate.status)}
                                        </div>

                                        <p className="text-xs sm:text-sm font-semibold text-primary flex items-center gap-1.5">
                                            <Briefcase className="w-3.5 h-3.5 shrink-0" /> {candidate.job_title}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-zinc-400 pt-0.5">
                                            <a 
                                                href={`mailto:${candidate.email}`} 
                                                className="flex items-center gap-1 hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-none"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{candidate.email}</span>
                                            </a>

                                            {candidate.phone && (
                                                <a 
                                                    href={`tel:${candidate.phone}`} 
                                                    className="flex items-center gap-1 hover:text-primary transition-colors shrink-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Phone className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{candidate.phone}</span>
                                                </a>
                                            )}

                                            <span className="flex items-center gap-1 text-gray-400 shrink-0">
                                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                <span>{new Date(candidate.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Actions */}
                                <div className="flex items-center gap-2 shrink-0 self-start pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-zinc-800 w-full md:w-auto justify-between md:justify-end">
                                    {candidate.resume_url ? (
                                        <a
                                            href={candidate.resume_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary/90 transition-all shadow-xs hover:shadow-primary/20 shrink-0"
                                        >
                                            <FileText className="w-3.5 h-3.5 mr-1.5" /> View Resume
                                        </a>
                                    ) : null}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openCandidateModal(candidate)}
                                        className="text-xs h-9 px-3 shrink-0"
                                    >
                                        <Eye className="w-3.5 h-3.5 mr-1" /> Details
                                    </Button>

                                    {/* Status Selector triggering automated email popup */}
                                    <select
                                        value={candidate.status || 'new'}
                                        onChange={(e) => initiateStatusChange(candidate, e.target.value as any)}
                                        className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-2.5 py-2 text-xs font-medium focus:outline-none focus:border-primary cursor-pointer h-9 shrink-0"
                                    >
                                        <option value="new">Mark New</option>
                                        <option value="reviewed">Mark Reviewed</option>
                                        <option value="shortlisted">Shortlist ⭐</option>
                                        <option value="rejected">Reject</option>
                                    </select>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(candidate.id)}
                                        className="h-9 w-9 p-0 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl shrink-0"
                                        title="Delete Application"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Bottom Section: Full-width Cover Letter */}
                            {candidate.cover_letter && (
                                <div className="pt-2 border-t border-gray-100/80 dark:border-zinc-800/60">
                                    <div className="bg-gray-50/70 dark:bg-zinc-950/70 p-3.5 rounded-xl border border-gray-100 dark:border-zinc-800/80 text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
                                        <span className="font-semibold text-gray-400 uppercase text-[10px] block mb-1">Cover Note:</span>
                                        "{candidate.cover_letter}"
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredApplications.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-lg font-bold mb-1">No matching candidates found</h4>
                        <p className="text-sm text-gray-500">Try adjusting your search query or role/status filters.</p>
                    </div>
                )}
            </div>

            {/* Email Notification Preview & Confirmation Modal */}
            {emailModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
                        {/* Header */}
                        <div className={`p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between ${
                            emailModal.type === 'shortlist' ? 'bg-emerald-500/5' : 'bg-rose-500/5'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    emailModal.type === 'shortlist' 
                                        ? 'bg-emerald-500/10 text-emerald-600' 
                                        : 'bg-rose-500/10 text-rose-600'
                                }`}>
                                    {emailModal.type === 'shortlist' ? <Sparkles className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground">
                                        {emailModal.type === 'shortlist' ? 'Send Shortlist Email' : 'Send Rejection Email'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        To: <span className="font-semibold text-foreground">{emailModal.candidate.name}</span> ({emailModal.candidate.email})
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setEmailModal(null)}
                                className="p-1.5 text-gray-400 hover:text-foreground rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body / Editor */}
                        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                            <div className="p-3 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 text-xs text-gray-500 flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary shrink-0" />
                                <span>This email will be delivered from <strong>prince@mutanttechnologies.com</strong> directly to the candidate.</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Email Subject</label>
                                <input
                                    type="text"
                                    value={emailModal.subject}
                                    onChange={(e) => setEmailModal(prev => prev ? { ...prev, subject: e.target.value } : null)}
                                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                    Message Body (You can personalize this before sending)
                                </label>
                                <textarea
                                    rows={8}
                                    value={emailModal.message}
                                    onChange={(e) => setEmailModal(prev => prev ? { ...prev, message: e.target.value } : null)}
                                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-primary font-sans"
                                />
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleUpdateStatusWithoutEmail}
                                className="text-xs text-gray-500 hover:text-foreground"
                            >
                                Update Status Only (Skip Email)
                            </Button>

                            <div className="flex items-center gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEmailModal(null)}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSendEmailAndChangeStatus}
                                    disabled={emailModal.sending}
                                    className={`text-xs font-bold ${
                                        emailModal.type === 'shortlist'
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                                    }`}
                                >
                                    {emailModal.sending ? (
                                        <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sending...</>
                                    ) : (
                                        <><Send className="w-3.5 h-3.5 mr-1.5" /> Send Email & Update Status</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Candidate Details Modal */}
            {selectedCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold font-oswald uppercase text-foreground">{selectedCandidate.name}</h2>
                                <p className="text-xs sm:text-sm text-primary font-medium">{selectedCandidate.job_title}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCandidate(null)}
                                className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
                            {/* Contact Badges */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3.5 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                                    <div className="min-w-0 pr-2">
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Email Address</div>
                                        <a href={`mailto:${selectedCandidate.email}`} className="text-sm font-semibold truncate hover:text-primary block">
                                            {selectedCandidate.email}
                                        </a>
                                    </div>
                                    <button 
                                        onClick={() => copyToClipboard(selectedCandidate.email, 'email')}
                                        className="p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg"
                                        title="Copy Email"
                                    >
                                        {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="p-3.5 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                                    <div className="min-w-0 pr-2">
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Phone Number</div>
                                        <a href={`tel:${selectedCandidate.phone}`} className="text-sm font-semibold truncate hover:text-primary block">
                                            {selectedCandidate.phone || 'Not provided'}
                                        </a>
                                    </div>
                                    {selectedCandidate.phone && (
                                        <button 
                                            onClick={() => copyToClipboard(selectedCandidate.phone || '', 'phone')}
                                            className="p-1.5 text-gray-400 hover:text-foreground hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg"
                                            title="Copy Phone"
                                        >
                                            {copiedField === 'phone' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Email Action Buttons */}
                            <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-3">
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Automated Email Actions</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => initiateStatusChange(selectedCandidate, 'shortlisted')}
                                        className="h-10 text-xs font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 justify-start"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2 text-emerald-500" /> Send Shortlist Email
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => initiateStatusChange(selectedCandidate, 'rejected')}
                                        className="h-10 text-xs font-bold border-rose-500/30 text-rose-600 hover:bg-rose-500/10 justify-start"
                                    >
                                        <Mail className="w-4 h-4 mr-2 text-rose-500" /> Send Rejection Email
                                    </Button>
                                </div>
                            </div>

                            {/* Status, Date, Resume */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800">
                                <div>
                                    <div className="text-xs text-gray-400 font-medium mb-1">Application Status</div>
                                    <select
                                        value={selectedCandidate.status || 'new'}
                                        onChange={(e) => initiateStatusChange(selectedCandidate, e.target.value as any)}
                                        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-sm font-bold text-primary focus:outline-none focus:border-primary cursor-pointer"
                                    >
                                        <option value="new">New Applicant</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-400 font-medium mb-1">Date Submitted</div>
                                    <div className="text-sm font-medium text-foreground">
                                        {new Date(selectedCandidate.created_at).toLocaleString()}
                                    </div>
                                </div>

                                {selectedCandidate.resume_url && (
                                    <a
                                        href={selectedCandidate.resume_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-xs hover:shadow-primary/30"
                                    >
                                        <FileText className="w-4 h-4" /> Open Resume PDF
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>

                            {/* Cover Letter */}
                            {selectedCandidate.cover_letter ? (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Cover Letter / Candidate Note</h4>
                                    <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-zinc-300">
                                        {selectedCandidate.cover_letter}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No cover letter submitted by candidate.</p>
                            )}

                            {/* Internal HR Notes */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Internal HR / Interview Notes</h4>
                                    <Button 
                                        size="sm" 
                                        onClick={handleSaveNotes} 
                                        disabled={savingNotes}
                                        className="h-7 text-xs px-3"
                                    >
                                        {savingNotes ? 'Saving...' : 'Save Notes'}
                                    </Button>
                                </div>
                                <textarea
                                    rows={3}
                                    placeholder="Add private evaluation notes, interview feedback, or next steps..."
                                    value={candidateNotes}
                                    onChange={(e) => setCandidateNotes(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex justify-between items-center">
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDelete(selectedCandidate.id)}
                                className="text-xs"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Application
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedCandidate(null)}
                                className="text-xs"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
