'use client';
import { FileStack, Upload, Eye, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { useDocuments } from '@/lib/api/queries';
import { toast } from 'sonner';

export default function DocumentsPage() {
  const dummyDocuments = [
    { id: 'DOC-001', flatNumber: 'A-101', documentType: 'Aadhaar Card', fileName: 'aadhaar_john_doe.pdf', uploadedBy: 'John Doe', uploadDate: '2026-02-15', status: 'verified', size: '245 KB' },
    { id: 'DOC-002', flatNumber: 'A-101', documentType: 'Rent Agreement', fileName: 'rent_agreement_a101.pdf', uploadedBy: 'John Doe', uploadDate: '2026-02-15', status: 'verified', size: '1.2 MB' },
    { id: 'DOC-003', flatNumber: 'A-102', documentType: 'PAN Card', fileName: 'pan_jane_smith.pdf', uploadedBy: 'Jane Smith', uploadDate: '2026-02-18', status: 'pending', size: '180 KB' },
    { id: 'DOC-004', flatNumber: 'B-201', documentType: 'NOC', fileName: 'noc_b201.pdf', uploadedBy: 'Bob Wilson', uploadDate: '2026-02-20', status: 'verified', size: '320 KB' },
    { id: 'DOC-005', flatNumber: 'A-103', documentType: 'Police Verification', fileName: 'police_verify_a103.pdf', uploadedBy: 'Mike Brown', uploadDate: '2026-02-22', status: 'pending', size: '450 KB' },
  ];

  const handleView = (doc) => {
    toast.info(`Opening ${doc.fileName}`);
  };

  const handleDownload = (doc) => {
    toast.success(`Downloaded ${doc.fileName}`);
  };

  const handleVerify = (doc) => {
    toast.success(`Document ${doc.id} verified!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Document Management</h1>
          <p className="text-muted-foreground mt-1">Upload/verify ID proofs, rent agreements, NOCs</p>
        </div>
        <Button style={{ backgroundColor: COLORS.primary }}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dummyDocuments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>{dummyDocuments.filter(d => d.status === 'verified').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.warning }}>{dummyDocuments.filter(d => d.status === 'pending').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2.4 MB</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document ID</TableHead>
                <TableHead>Flat</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-mono text-xs">{doc.id}</TableCell>
                  <TableCell>{doc.flatNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.documentType}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-xs truncate">{doc.fileName}</TableCell>
                  <TableCell>{doc.uploadedBy}</TableCell>
                  <TableCell>{new Date(doc.uploadDate).toLocaleDateString()}</TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>
                    <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(doc)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                        <Download className="h-3 w-3" />
                      </Button>
                      {doc.status === 'pending' && (
                        <Button size="sm" style={{ backgroundColor: COLORS.success }} onClick={() => handleVerify(doc)}>
                          Verify
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Document Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Aadhaar Card</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span>PAN Card</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span>Rent Agreement</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span>NOC</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span>Police Verification</span>
                <span className="font-medium">1</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {dummyDocuments.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex justify-between items-center">
                  <span className="truncate">{doc.fileName.substring(0, 20)}...</span>
                  <Badge variant="outline" className="text-xs">{doc.size}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Supported Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>PDF</Badge>
              <Badge>JPG</Badge>
              <Badge>PNG</Badge>
              <Badge>JPEG</Badge>
              <Badge>DOC</Badge>
              <Badge>DOCX</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
