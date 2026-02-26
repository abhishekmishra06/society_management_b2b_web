'use client';
import { useState } from 'react';
import { FileStack, Plus, RefreshCw, Search, Eye, Download, Trash2, CheckCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument } from '@/lib/api/queries';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const DOC_TYPES = ['Aadhaar Card', 'PAN Card', 'Passport', 'Rent Agreement', 'Sale Deed', 'NOC', 'Police Verification', 'Electricity Bill', 'Society Registration', 'Other'];
const DOC_STATUSES = ['pending', 'verified', 'rejected'];

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const { data: documents, isLoading } = useDocuments();
  const createDoc = useCreateDocument();
  const updateDoc = useUpdateDocument();
  const deleteDoc = useDeleteDocument();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    documentType: 'Aadhaar Card', fileName: '', flatNumber: '', uploadedBy: '', description: '', status: 'pending'
  });
  const [errors, setErrors] = useState({});

  const docs = documents || [];

  const stats = {
    total: docs.length,
    verified: docs.filter(d => d.status === 'verified').length,
    pending: docs.filter(d => d.status === 'pending').length,
    rejected: docs.filter(d => d.status === 'rejected').length,
  };

  const filtered = docs.filter(d => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (d.fileName || '').toLowerCase().includes(q) || (d.flatNumber || '').toLowerCase().includes(q) || (d.uploadedBy || '').toLowerCase().includes(q) || (d.documentType || '').toLowerCase().includes(q);
    const matchesType = filterType === 'all' || d.documentType === filterType;
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const resetForm = () => {
    setFormData({ documentType: 'Aadhaar Card', fileName: '', flatNumber: '', uploadedBy: '', description: '', status: 'pending' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fileName.trim()) newErrors.fileName = 'File name is required';
    if (!formData.flatNumber.trim()) newErrors.flatNumber = 'Flat number is required';
    if (!formData.uploadedBy.trim()) newErrors.uploadedBy = 'Uploader name is required';
    return newErrors;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await createDoc.mutateAsync(formData);
      toast.success('Document uploaded successfully!');
      setAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };

  const handleEdit = (doc) => {
    setSelectedDoc(doc);
    setFormData({
      documentType: doc.documentType || 'Aadhaar Card', fileName: doc.fileName || '',
      flatNumber: doc.flatNumber || '', uploadedBy: doc.uploadedBy || '',
      description: doc.description || '', status: doc.status || 'pending'
    });
    setErrors({});
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await updateDoc.mutateAsync({ id: selectedDoc.id, ...formData });
      toast.success('Document updated!');
      setEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to update document');
    }
  };

  const handleVerify = async (doc) => {
    try {
      await updateDoc.mutateAsync({ id: doc.id, status: 'verified' });
      toast.success(`${doc.fileName} verified!`);
    } catch (error) {
      toast.error('Failed to verify document');
    }
  };

  const handleReject = async (doc) => {
    try {
      await updateDoc.mutateAsync({ id: doc.id, status: 'rejected' });
      toast.success(`${doc.fileName} rejected`);
    } catch (error) {
      toast.error('Failed to reject document');
    }
  };

  const handleView = (doc) => {
    setSelectedDoc(doc);
    setViewDialogOpen(true);
  };

  const handleDeleteConfirm = (doc) => {
    setSelectedDoc(doc);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteDoc.mutateAsync(selectedDoc.id);
      toast.success('Document deleted!');
      setDeleteDialogOpen(false);
      setSelectedDoc(null);
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'verified': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'rejected': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const DocForm = ({ onSubmit, submitLabel, isPending }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Document Type *</Label>
          <select className="w-full p-2 border rounded-md" value={formData.documentType} onChange={(e) => setFormData({...formData, documentType: e.target.value})}>
            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>File Name *</Label>
          <Input placeholder="e.g., aadhaar_john.pdf" value={formData.fileName} onChange={(e) => { setFormData({...formData, fileName: e.target.value}); setErrors({...errors, fileName: null}); }} className={errors.fileName ? 'border-red-500' : ''} />
          {errors.fileName && <p className="text-xs text-red-500">{errors.fileName}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Flat Number *</Label>
          <Input placeholder="e.g., A-101" value={formData.flatNumber} onChange={(e) => { setFormData({...formData, flatNumber: e.target.value}); setErrors({...errors, flatNumber: null}); }} className={errors.flatNumber ? 'border-red-500' : ''} />
          {errors.flatNumber && <p className="text-xs text-red-500">{errors.flatNumber}</p>}
        </div>
        <div className="space-y-2">
          <Label>Uploaded By *</Label>
          <Input placeholder="Name of uploader" value={formData.uploadedBy} onChange={(e) => { setFormData({...formData, uploadedBy: e.target.value}); setErrors({...errors, uploadedBy: null}); }} className={errors.uploadedBy ? 'border-red-500' : ''} />
          {errors.uploadedBy && <p className="text-xs text-red-500">{errors.uploadedBy}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <select className="w-full p-2 border rounded-md" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
          <option value="pending">Pending Verification</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>Description / Notes</Label>
        <Input placeholder="Additional notes" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => { setAddDialogOpen(false); setEditDialogOpen(false); }}>Cancel</Button>
        <Button type="submit" disabled={isPending} style={{ backgroundColor: COLORS.primary }} className="text-white">{isPending ? 'Saving...' : submitLabel}</Button>
      </div>
    </form>
  );

  // Count documents by type
  const typeCounts = {};
  docs.forEach(d => { typeCounts[d.documentType] = (typeCounts[d.documentType] || 0) + 1; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Document Management</h1>
          <p className="text-muted-foreground mt-1">Upload, verify, and manage society documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={addDialogOpen} onOpenChange={(o) => { setAddDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />Upload Document</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Upload New Document</DialogTitle></DialogHeader>
              <DocForm onSubmit={handleAdd} submitLabel="Upload" isPending={createDoc.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Documents</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Verified</p><p className="text-2xl font-bold" style={{color: COLORS.success}}>{stats.verified}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold" style={{color: COLORS.warning}}>{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Rejected</p><p className="text-2xl font-bold" style={{color: COLORS.error}}>{stats.rejected}</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by file, flat, uploader, type..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <select className="p-2 border rounded-md text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="p-2 border rounded-md text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setFilterType('all'); setFilterStatus('all'); }}>Clear</Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>All Documents ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileStack className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{docs.length === 0 ? 'No documents uploaded yet' : 'No documents match your filters'}</p>
              {docs.length === 0 && <p className="text-sm text-muted-foreground mt-1">Click "Upload Document" to add your first document</p>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell><Badge variant="outline">{doc.documentType}</Badge></TableCell>
                    <TableCell className="font-mono text-xs max-w-[150px] truncate">{doc.fileName}</TableCell>
                    <TableCell>{doc.flatNumber}</TableCell>
                    <TableCell>{doc.uploadedBy}</TableCell>
                    <TableCell className="text-xs">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell><Badge style={{ backgroundColor: statusColor(doc.status), color: 'white' }}>{doc.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleView(doc)} title="View"><Eye className="h-3 w-3" /></Button>
                        {doc.status === 'pending' && (
                          <Button size="sm" style={{ backgroundColor: COLORS.success }} className="text-white" onClick={() => handleVerify(doc)} title="Verify"><CheckCircle className="h-3 w-3" /></Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleEdit(doc)} title="Edit"><Edit className="h-3 w-3" /></Button>
                        <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteConfirm(doc)} title="Delete"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Document Type Breakdown */}
      {Object.keys(typeCounts).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Documents by Type</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm truncate">{type}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Document</DialogTitle></DialogHeader>
          <DocForm onSubmit={handleUpdate} submitLabel="Update" isPending={updateDoc.isPending} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Document Details</DialogTitle></DialogHeader>
          {selectedDoc && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Type:</span><p className="font-medium">{selectedDoc.documentType}</p></div>
                <div><span className="text-muted-foreground">Status:</span><p><Badge style={{ backgroundColor: statusColor(selectedDoc.status), color: 'white' }}>{selectedDoc.status}</Badge></p></div>
                <div><span className="text-muted-foreground">File Name:</span><p className="font-mono text-xs">{selectedDoc.fileName}</p></div>
                <div><span className="text-muted-foreground">Flat:</span><p className="font-medium">{selectedDoc.flatNumber}</p></div>
                <div><span className="text-muted-foreground">Uploaded By:</span><p>{selectedDoc.uploadedBy}</p></div>
                <div><span className="text-muted-foreground">Date:</span><p>{selectedDoc.uploadedAt ? new Date(selectedDoc.uploadedAt).toLocaleDateString() : '-'}</p></div>
              </div>
              {selectedDoc.description && (
                <div><span className="text-sm text-muted-foreground">Notes:</span><p className="text-sm">{selectedDoc.description}</p></div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                {selectedDoc.status === 'pending' && (
                  <>
                    <Button size="sm" variant="destructive" onClick={() => { handleReject(selectedDoc); setViewDialogOpen(false); }}>Reject</Button>
                    <Button size="sm" style={{ backgroundColor: COLORS.success }} className="text-white" onClick={() => { handleVerify(selectedDoc); setViewDialogOpen(false); }}>Verify</Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete <strong>{selectedDoc?.fileName}</strong>?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteDoc.isPending}>{deleteDoc.isPending ? 'Deleting...' : 'Delete'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
