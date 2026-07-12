import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, LinearProgress, IconButton, useTheme, alpha } from '@mui/material';
import { CloudUpload, InsertDriveFile, Close, CheckCircle } from '@mui/icons-material';

export default function ResumeUploader({ file, onFileChange, uploading = false, error }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) onFileChange(accepted[0]);
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: uploading,
  });

  return (
    <Box>
      {!file ? (
        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${isDragActive ? theme.palette.primary.main : error ? theme.palette.error.main : theme.palette.divider}`,
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            backgroundColor: isDragActive
              ? alpha(theme.palette.primary.main, 0.06)
              : alpha(theme.palette.background.default, 0.5),
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
        >
          <input {...getInputProps()} />
          <Box sx={{
            width: 64, height: 64, borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.light, 0.1)})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2,
            transition: 'transform 0.2s ease',
            transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
          }}>
            <CloudUpload sx={{ fontSize: 30, color: 'primary.main' }} />
          </Box>
          <Typography variant="h5" sx={{ mb: 0.75, fontWeight: 600 }}>
            {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Supports PDF and DOCX — max 10 MB
          </Typography>
          <Button variant="outlined" size="small" sx={{ borderRadius: 2, px: 3 }}>Browse files</Button>
          {error && <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1.5 }}>{error}</Typography>}
        </Box>
      ) : (
        <Box sx={{
          border: `1px solid ${uploading ? theme.palette.primary.main : theme.palette.success.main}`,
          borderRadius: 3, p: 2.5, display: 'flex', alignItems: 'center', gap: 2,
          bgcolor: alpha(theme.palette.success.main, 0.04),
        }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <InsertDriveFile sx={{ color: 'primary.main', fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>{file.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
            {uploading && <LinearProgress sx={{ mt: 0.75, borderRadius: 99, height: 4 }} />}
          </Box>
          {!uploading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
              <IconButton size="small" onClick={() => onFileChange(null)}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
