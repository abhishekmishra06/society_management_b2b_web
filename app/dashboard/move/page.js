'use client';
import { useState } from 'react';
import { Truck, Plus, RefreshCw, Search, Edit, Trash2, ArrowUpRight, ArrowDownRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useMoveRequests, useCreateMoveRequest, useUpdateMoveRequest, useDeleteMoveRequest } from '@/lib/api/queries';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function MovePage() {
  const queryClient = useQueryClient();
  const { data: moveRequests, isLoading } = useMoveRequests();
  const createMove = useCreateMoveRequest();
  const updateMove = useUpdateMoveRequest();
  const deleteMove = useDeleteMoveRequest();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    type: 'move_in', residentName: '', flatNumber: '', scheduledDate: '', scheduledTime: '',
    vehicleDetails: '', contactNumber: '', items: '', specialInstructions: '', securityCheck: false
  });
  const [errors, setErrors] = useState({});

  const requests = moveRequests || [];

  const stats = {
    total: requests.length,
    moveIn: requests.filter(r => r.type === 'move_in').length,
    moveOut: requests.filter(r => r.type === 'move_out').length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  const filtered = requests.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (r.residentName || '').toLowerCase().includes(q) || (r.flatNumber || '').toLowerCase().includes(q) || (r.vehicleDetails || '').toLowerCase().includes(q) || (r.contactNumber || '').toLowerCase().includes(q);
    const matchesType = filterType === 'all' || r.type === filterType;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const resetForm = () => {
    setFormData({ type: 'move_in', residentName: '', flatNumber: '', scheduledDate: '', scheduledTime: '', vehicleDetails: '', contactNumber: '', items: '', specialInstructions: '', securityCheck: false });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.residentName.trim()) newErrors.residentName = 'Resident name is required';
    if (!formData.flatNumber.trim()) newErrors.flatNumber = 'Flat number is required';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Date is required';
    return newErrors;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await createMove.mutateAsync(formData);
      toast.success(`${formData.type === 'move_in' ? 'Move-In' : 'Move-Out'} request created!`);
      setAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create request');
    }
  };

  const handleEdit = (req) => {
    setSelectedRequest(req);
    setFormData({
      type: req.type || 'move_in', residentName: req.residentName || '', flatNumber: req.flatNumber || '',
      scheduledDate: req.scheduledDate ? new Date(req.scheduledDate).toISOString().split('T')[0] : '',
      scheduledTime: req.scheduledTime || '', vehicleDetails: req.vehicleDetails || '',
      contactNumber: req.contactNumber || '', items: req.items || '',
      specialInstructions: req.specialInstructions || '', securityCheck: req.securityCheck || false
    });
    setErrors({});
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await updateMove.mutateAsync({ id: selectedRequest.id, ...formData });
      toast.success('Request updated!');
      setEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const handleStatusChange = (req) => {
    setSelectedRequest(req);
    setStatusDialogOpen(true);
  };

  const updateStatus = async (newStatus) => {
    try {
      await updateMove.mutateAsync({ id: selectedRequest.id, status: newStatus });
      toast.success(`Request marked as ${newStatus}`);
      setStatusDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteConfirm = (req) => {
    setSelectedRequest(req);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteMove.mutateAsync(selectedRequest.id);
      toast.success('Request deleted!');
      setDeleteDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'approved': return '#3b82f6';
      case 'completed': return COLORS.success;
      case 'rejected': case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const MoveForm = ({ onSubmit, submitLabel, isPending }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type *</Label>
          <select className="w-full p-2 border rounded-md" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
            <option value="move_in">Move-In</option>
            <option value="move_out">Move-Out</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Resident Name *</Label>
          <Input placeholder="Full name" value={formData.residentName} onChange={(e) => { setFormData({...formData, residentName: e.target.value}); setErrors({...errors, residentName: null}); }} className={errors.residentName ? 'border-red-500' : ''} />
          {errors.residentName && <p className="text-xs text-red-500">{errors.residentName}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Flat Number *</Label>
          <Input placeholder="e.g., A-101" value={formData.flatNumber} onChange={(e) => { setFormData({...formData, flatNumber: e.target.value}); setErrors({...errors, flatNumber: null}); }} className={errors.flatNumber ? 'border-red-500' : ''} />
          {errors.flatNumber && <p className="text-xs text-red-500">{errors.flatNumber}</p>}
        </div>
        <div className="space-y-2">
          <Label>Contact Number</Label>
          <Input placeholder="Phone number" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Scheduled Date *</Label>
          <Input type="date" value={formData.scheduledDate} onChange={(e) => { setFormData({...formData, scheduledDate: e.target.value}); setErrors({...errors, scheduledDate: null}); }} className={errors.scheduledDate ? 'border-red-500' : ''} />
          {errors.scheduledDate && <p className="text-xs text-red-500">{errors.scheduledDate}</p>}
        </div>
        <div className="space-y-2">
          <Label>Scheduled Time</Label>
          <select className="w-full p-2 border rounded-md" value={formData.scheduledTime} onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}>
            <option value="">Select time</option>
            <option value="6:00 AM - 9:00 AM">6:00 AM - 9:00 AM</option>
            <option value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM</option>
            <option value="12:00 PM - 3:00 PM">12:00 PM - 3:00 PM</option>
            <option value="3:00 PM - 6:00 PM">3:00 PM - 6:00 PM</option>
            <option value="6:00 PM - 9:00 PM">6:00 PM - 9:00 PM</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Vehicle Details</Label>
        <Input placeholder="e.g., Tempo, truck number" value={formData.vehicleDetails} onChange={(e) => setFormData({...formData, vehicleDetails: e.target.value})} />
      </div>
      <div className="space-y-2">
        <Label>Items Description</Label>
        <Input placeholder="List major items being moved" value={formData.items} onChange={(e) => setFormData({...formData, items: e.target.value})} />
      </div>
      <div className="space-y-2">
        <Label>Special Instructions</Label>
        <Input placeholder="Any special requirements" value={formData.specialInstructions} onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="securityCheck" checked={formData.securityCheck} onChange={(e) => setFormData({...formData, securityCheck: e.target.checked})} className="h-4 w-4" />
        <Label htmlFor="securityCheck" className="text-sm">Security check required</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => { setAddDialogOpen(false); setEditDialogOpen(false); }}>Cancel</Button>
        <Button type="submit" disabled={isPending} style={{ backgroundColor: COLORS.primary }} className="text-white">{isPending ? 'Saving...' : submitLabel}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Move-In / Move-Out</h1>
          <p className="text-muted-foreground mt-1">Manage move requests, scheduling, and security checks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={addDialogOpen} onOpenChange={(o) => { setAddDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />New Request</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Move Request</DialogTitle></DialogHeader>
              <MoveForm onSubmit={handleAdd} submitLabel="Create Request" isPending={createMove.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><ArrowDownRight className="h-3 w-3 text-green-500" />Move-In</p><p className="text-2xl font-bold" style={{color: COLORS.success}}>{stats.moveIn}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><ArrowUpRight className="h-3 w-3 text-red-500" />Move-Out</p><p className="text-2xl font-bold" style={{color: COLORS.error}}>{stats.moveOut}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold" style={{color: COLORS.warning}}>{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Approved</p><p className="text-2xl font-bold" style={{color: '#3b82f6'}}>{stats.approved}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold" style={{color: COLORS.success}}>{stats.completed}</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, flat, vehicle, phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <select className="p-2 border rounded-md text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="move_in">Move-In</option>
          <option value="move_out">Move-Out</option>
        </select>
        <select className="p-2 border rounded-md text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setFilterType('all'); setFilterStatus('all'); }}>Clear</Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Move Requests ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{requests.length === 0 ? 'No move requests yet' : 'No requests match your filters'}</p>
              {requests.length === 0 && <p className="text-sm text-muted-foreground mt-1">Click "New Request" to create your first move request</p>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Badge variant={request.type === 'move_in' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                        {request.type === 'move_in' ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {request.type === 'move_in' ? 'Move-In' : 'Move-Out'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{request.residentName}</TableCell>
                    <TableCell>{request.flatNumber}</TableCell>
                    <TableCell>{request.scheduledDate ? new Date(request.scheduledDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="text-xs">{request.scheduledTime || '-'}</TableCell>
                    <TableCell className="text-xs">{request.vehicleDetails || '-'}</TableCell>
                    <TableCell className="text-xs">{request.contactNumber || '-'}</TableCell>
                    <TableCell>{request.securityCheck ? <CheckCircle className="h-4 w-4 text-green-500" /> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: statusColor(request.status), color: 'white' }}>{request.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(request)} title="Update Status"><Clock className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(request)} title="Edit"><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDeleteConfirm(request)} title="Delete"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Move Request</DialogTitle></DialogHeader>
          <MoveForm onSubmit={handleUpdate} submitLabel="Update" isPending={updateMove.isPending} />
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Status: {selectedRequest?.residentName}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Current: <Badge style={{ backgroundColor: statusColor(selectedRequest?.status), color: 'white' }}>{selectedRequest?.status}</Badge></p>
            <div className="grid grid-cols-2 gap-2">
              {['pending', 'approved', 'completed', 'rejected', 'cancelled'].filter(s => s !== selectedRequest?.status).map(status => (
                <Button key={status} variant="outline" className="capitalize" onClick={() => updateStatus(status)} disabled={updateMove.isPending}>
                  {status === 'approved' && <CheckCircle className="h-4 w-4 mr-1 text-blue-500" />}
                  {status === 'completed' && <CheckCircle className="h-4 w-4 mr-1 text-green-500" />}
                  {status === 'rejected' && <XCircle className="h-4 w-4 mr-1 text-red-500" />}
                  {status === 'cancelled' && <XCircle className="h-4 w-4 mr-1 text-gray-500" />}
                  {status === 'pending' && <Clock className="h-4 w-4 mr-1 text-yellow-500" />}
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Move Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete the {selectedRequest?.type === 'move_in' ? 'Move-In' : 'Move-Out'} request for <strong>{selectedRequest?.residentName}</strong> (Flat {selectedRequest?.flatNumber})?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMove.isPending}>{deleteMove.isPending ? 'Deleting...' : 'Delete'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
