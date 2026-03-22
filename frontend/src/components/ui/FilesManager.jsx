import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Download, Trash2, FileText, Image, Archive, File, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import useAuthStore from '../../context/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const FILE_ICONS = {
  pdf:  { icon: FileText, color: 'text-red-500',   bg: 'bg-red-50'   },
  doc:  { icon: FileText, color: 'text-blue-500',  bg: 'bg-blue-50'  },
  docx: { icon: FileText, color: 'text-blue-500',  bg: 'bg-blue-50'  },
  xls:  { icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
  xlsx: { icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
  png:  { icon: Image,    color: 'text-purple-500',bg: 'bg-purple-50'},
  jpg:  { icon: Image,    color: 'text-purple-500',bg: 'bg-purple-50'},
  jpeg: { icon: Image,    color: 'text-purple-500',bg: 'bg-purple-50'},
  zip:  { icon: Archive,  color: 'text-amber-500', bg: 'bg-amber-50' },
};

const getFileIcon = (ext) => FILE_ICONS[ext?.toLowerCase()] || { icon: File, color: 'text-gray-500', bg: 'bg-gray-50' };

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function FilesManager({ projectId, taskId, compact = false }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const fileInputRef = useRef(null);
  const { canUpload } = useAuthStore();
  const qc = useQueryClient();

  const queryKey = ['files', projectId, taskId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => api.get('/files', { params: { projectId, taskId } }).then(r => r.data),
    enabled: !!(projectId || taskId)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/files/${id}`),
    onSuccess: () => { qc.invalidateQueries(queryKey); toast.success('File deleted'); }
  });

  const handleUpload = async (file) => {
    if (!file) return;
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) { toast.error('File too large. Max 20MB.'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) formData.append('projectId', projectId);
      if (taskId)    formData.append('taskId', taskId);

      await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      qc.invalidateQueries(queryKey);
      toast.success(`${file.name} uploaded!`);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const files = data?.files || [];

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Files ({files.length})</span>
          {canUpload() && (
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 font-medium">
              {uploading ? <Loader2 size={12} className="animate-spin"/> : <Upload size={12}/>}
              Upload
            </button>
          )}
        </div>
        {files.slice(0,5).map(f => <CompactFileRow key={f._id} file={f} onDelete={() => deleteMutation.mutate(f._id)} canUpload={canUpload()}/>)}
        <input ref={fileInputRef} type="file" className="hidden" onChange={e => handleUpload(e.target.files[0])}/>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-900">Files</h2>
          <p className="text-sm text-gray-400 mt-0.5">{files.length} file{files.length !== 1 ? 's' : ''}</p>
        </div>
        {canUpload() && (
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-primary text-sm">
            {uploading ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14}/>}
            Upload File
          </button>
        )}
      </div>

      {/* Drop zone */}
      {canUpload() && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-5',
            dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-brand-400"/>
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={24} className={dragOver ? 'text-brand-400' : 'text-gray-300'}/>
              <p className="text-sm font-medium text-gray-500">Drop files here or click to upload</p>
              <p className="text-xs text-gray-300">PDF, DOC, XLS, PNG, JPG, ZIP — Max 20MB</p>
            </div>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.zip,.txt,.csv"
        onChange={e => handleUpload(e.target.files[0])}
      />

      {/* Files grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-3">
          {[...Array(4)].map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12">
          <File size={32} className="text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-400 text-sm">No files yet</p>
          {canUpload() && <p className="text-gray-300 text-xs mt-1">Upload project documents above</p>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          <AnimatePresence>
            {files.map((file, i) => {
              const { icon: FileIcon, color, bg } = getFileIcon(file.extension);
              return (
                <motion.div key={file._id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ delay:i*0.05 }}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-all group">
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
                    <FileIcon size={18} className={color}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.originalName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatSize(file.size)} · {file.uploadedBy?.name} · {format(new Date(file.createdAt), 'MMM d')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a href={`/api/files/${file._id}/download`} target="_blank" rel="noreferrer"
                      onClick={() => {}} // increment download count
                      className="p-2 hover:bg-brand-50 rounded-lg text-gray-400 hover:text-brand-500 transition-all" title="Download">
                      <Download size={14}/>
                    </a>
                    {canUpload() && (
                      <button onClick={() => { if (window.confirm('Delete file?')) deleteMutation.mutate(file._id); }}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100" title="Delete">
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function CompactFileRow({ file, onDelete, canUpload }) {
  const { icon: FileIcon, color, bg } = getFileIcon(file.extension);
  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors">
      <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
        <FileIcon size={13} className={color}/>
      </div>
      <span className="text-xs text-gray-700 flex-1 truncate">{file.originalName}</span>
      <div className="flex items-center gap-1">
        <a href={`/api/files/${file._id}/download`} target="_blank" rel="noreferrer"
          className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-brand-500 transition-all">
          <Download size={12}/>
        </a>
        {canUpload && (
          <button onClick={onDelete} className="p-1.5 hover:bg-white rounded-lg text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
            <X size={12}/>
          </button>
        )}
      </div>
    </div>
  );
}
