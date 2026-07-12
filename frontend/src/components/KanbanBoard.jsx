import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Typography, Paper, Chip, Menu, MenuItem, Divider, useTheme, alpha, CircularProgress } from '@mui/material';
import CandidateCard from './CandidateCard';
import { useUpdateStatus } from '../hooks/useApplications';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'applied',   label: 'Applied',   color: '#3B82F6' },
  { id: 'screening', label: 'Review',    color: '#8B5CF6' },
  { id: 'interview', label: 'Interview', color: '#5B4FCF' },
  { id: 'offered',   label: 'Offered',   color: '#059669' },
  { id: 'hired',     label: 'Hired',     color: '#047857' },
];

function groupByStatus(applications) {
  return COLUMNS.reduce((acc, col) => {
    acc[col.id] = applications.filter(a => a.status === col.id);
    return acc;
  }, {});
}

export default function KanbanBoard({ applications = [], jobId, onRefetch }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mutateAsync: updateStatus } = useUpdateStatus();

  const [groups, setGroups] = useState(() => groupByStatus(applications));
  const [menuState, setMenuState] = useState({ anchor: null, app: null });

  React.useEffect(() => {
    setGroups(groupByStatus(applications));
  }, [applications]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    const newGroups = { ...groups };
    const srcItems = [...newGroups[source.droppableId]];
    const destItems = source.droppableId === destination.droppableId ? srcItems : [...newGroups[destination.droppableId]];

    const [moved] = srcItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, moved);

    newGroups[source.droppableId] = srcItems;
    newGroups[destination.droppableId] = destItems;
    setGroups(newGroups);

    try {
      await updateStatus({ id: draggableId, status: destination.droppableId, jobId });
      toast.success(`Moved to ${destination.droppableId}`);
      onRefetch?.();
    } catch {
      setGroups(groupByStatus(applications));
      toast.error('Failed to update status');
    }
  };

  const handleMenuAction = async (action) => {
    const app = menuState.app;
    setMenuState({ anchor: null, app: null });
    if (!app) return;
    try {
      await updateStatus({ id: app._id, status: action, jobId });
      toast.success(`Status updated to ${action}`);
      onRefetch?.();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, minHeight: 500 }}>
          {COLUMNS.map((col) => {
            const items = groups[col.id] || [];
            return (
              <Box key={col.id} sx={{ minWidth: 260, flex: '0 0 260px', display: 'flex', flexDirection: 'column' }}>
                {/* Column header */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  mb: 1.5, px: 0.5,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: col.color,
                      boxShadow: isDark ? `0 0 6px ${alpha(col.color, 0.6)}` : 'none' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>{col.label}</Typography>
                  </Box>
                  <Chip
                    label={items.length}
                    size="small"
                    sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700, minWidth: 24,
                      bgcolor: alpha(col.color, isDark ? 0.2 : 0.12), color: col.color }}
                  />
                </Box>

                {/* Droppable area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        flex: 1, p: 1.5, borderRadius: 3, minHeight: 120,
                        bgcolor: snapshot.isDraggingOver
                          ? alpha(col.color, isDark ? 0.1 : 0.05)
                          : isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                        border: `1px dashed ${snapshot.isDraggingOver ? col.color : theme.palette.divider}`,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {items.map((app, idx) => (
                        <Draggable key={app._id} draggableId={app._id} index={idx}>
                          {(drag, dragSnapshot) => (
                            <Box
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              sx={{
                                opacity: dragSnapshot.isDragging ? 0.85 : 1,
                                transform: dragSnapshot.isDragging ? 'rotate(2deg)' : 'none',
                                transition: 'opacity 0.15s, transform 0.15s',
                                boxShadow: dragSnapshot.isDragging
                                  ? `0 12px 32px ${alpha(col.color, 0.3)}, 0 0 0 2px ${col.color}`
                                  : 'none',
                                borderRadius: 2,
                              }}
                            >
                              <CandidateCard
                                application={app}
                                index={idx}
                                onMenuClick={(e, a) => setMenuState({ anchor: e.currentTarget, app: a })}
                              />
                            </Box>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {items.length === 0 && !snapshot.isDraggingOver && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="caption" color="text.disabled">Drop candidates here</Typography>
                        </Box>
                      )}
                    </Paper>
                  )}
                </Droppable>
              </Box>
            );
          })}
        </Box>
      </DragDropContext>

      {/* Context menu */}
      <Menu
        anchorEl={menuState.anchor}
        open={Boolean(menuState.anchor)}
        onClose={() => setMenuState({ anchor: null, app: null })}
        PaperProps={{ sx: { minWidth: 180, borderRadius: 2 } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.disabled" fontWeight={600}>MOVE TO</Typography>
        </Box>
        <Divider />
        {COLUMNS.map(col => (
          <MenuItem key={col.id} onClick={() => handleMenuAction(col.id)} sx={{ gap: 1.5, py: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: col.color }} />
            {col.label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => handleMenuAction('rejected')} sx={{ color: 'error.main', py: 1 }}>
          Reject Candidate
        </MenuItem>
      </Menu>
    </>
  );
}
