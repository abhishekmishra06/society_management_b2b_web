'use client';
import { Plus, FileCheck, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { useKYCRequests, useResidents } from '@/lib/api/queries';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function KYCPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    residentId: '',
    residentName: '',
    flatNumber: '',
    aadhaarNumber: '',
    panNumber: '',
    documents: '',
  });

  const { data: kycRequests, refetch } = useKYCRequests();
  const { data: residents } = useResidents();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(API_ENDPOINTS.SUBMIT_KYC, formData);
      toast.success('KYC submitted successfully!');
      setDialogOpen(false);
      setFormData({
        residentId: '',
        residentName: '',
        flatNumber: '',
        aadhaarNumber: '',
        panNumber: '',
        documents: '',
      });
      refetch();
    } catch (error) {
      toast.error('Failed to submit KYC');
    }
  };

  const handleApprove = async (id) => {
    const remarks = prompt('Enter approval remarks (optional):');
    try {
      await apiClient.post(API_ENDPOINTS.APPROVE_KYC(id), { remarks });
      toast.success('KYC approved!');
      refetch();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const remarks = prompt('Enter rejection reason:');
    if (!remarks) return;
    try {
      await apiClient.post(API_ENDPOINTS.REJECT_KYC(id), { remarks });
      toast.success('KYC rejected');
      refetch();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const handleResidentSelect = (e) => {
    const residentId = e.target.value;
    const resident = residents?.find(r => r.id === residentId);
    if (resident) {
      setFormData({
        ...formData,
        residentId,
        residentName: resident.name,
        flatNumber: resident.flatNumber,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>KYC Verification</h1>
          <p className="text-muted-foreground mt-1">Aadhaar/PAN upload, Approve/Reject with remarks</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: COLORS.primary }}>
              <Plus className="h-4 w-4 mr-2" />
              Submit KYC
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit KYC Documents</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Resident *</Label>
                <select className="w-full p-2 border rounded-md" onChange={handleResidentSelect} required>
                  <option value="">-- Select Resident --</option>
                  {residents?.map(r => (
                    <option key={r.id} value={r.id}>{r.name} - {r.flatNumber}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aadhaar Number *</Label>
                  <Input value={formData.aadhaarNumber} onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})} required placeholder="XXXX-XXXX-XXXX" />
                </div>
                <div className="space-y-2">
                  <Label>PAN Number *</Label>
                  <Input value={formData.panNumber} onChange={(e) => setFormData({...formData, panNumber: e.target.value})} required placeholder="ABCDE1234F" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Document URLs (comma separated)</Label>
                <Textarea value={formData.documents} onChange={(e) => setFormData({...formData, documents: e.target.value})} placeholder="http://example.com/aadhaar.pdf, http://example.com/pan.pdf" />
              </div>
              <Button type="submit">Submit KYC</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kycRequests?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.warning }}>{kycRequests?.filter(k => k.status === 'pending').length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>{kycRequests?.filter(k => k.status === 'approved').length || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KYC Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {!kycRequests || kycRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No KYC requests yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resident</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Aadhaar</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.residentName}</TableCell>
                    <TableCell>{request.flatNumber}</TableCell>
                    <TableCell className="font-mono text-xs">{request.aadhaarNumber}</TableCell>
                    <TableCell className="font-mono text-xs">{request.panNumber}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" style={{ backgroundColor: COLORS.success }} onClick={() => handleApprove(request.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)}>
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
