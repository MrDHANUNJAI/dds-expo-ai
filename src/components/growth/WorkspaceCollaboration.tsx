import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Folder,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { growthApi, TaskItem, ActivityItem, WorkspaceFileItem } from '../../services/growthApi';
import { useAuth } from '../../context/AuthContext';

interface WorkspaceCollaborationProps {
  projectId: string;
  contractId?: string;
  projectTitle?: string;
}

export const WorkspaceCollaboration: React.FC<WorkspaceCollaborationProps> = ({
  projectId,
  contractId,
  projectTitle = 'Project Workspace',
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'activity' | 'files'>('tasks');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [files, setFiles] = useState<WorkspaceFileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Task form modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    dueDate: '',
  });

  // File upload state
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileFolder, setNewFileFolder] = useState('Designs');
  const [showFileModal, setShowFileModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      const [taskList, actList, fileList] = await Promise.all([
        growthApi.getTasks(projectId, contractId),
        growthApi.getActivities(projectId, contractId),
        growthApi.getFiles(projectId),
      ]);
      setTasks(taskList);
      setActivities(actList);
      setFiles(fileList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadWorkspaceData();
    }
  }, [projectId, contractId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    setSubmitting(true);
    try {
      await growthApi.createTask(projectId, {
        ...taskForm,
        contractId: contractId || '',
        assigneeName: user ? `${user.firstName} ${user.lastName}` : 'Contributor',
      });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
      await loadWorkspaceData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskItem['status']) => {
    try {
      await growthApi.updateTask(taskId, { status: newStatus });
      await loadWorkspaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await growthApi.deleteTask(taskId);
      await loadWorkspaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName || !newFileUrl) return;
    setSubmitting(true);
    try {
      await growthApi.uploadFile(projectId, {
        name: newFileName,
        url: newFileUrl,
        folder: newFileFolder,
        size: 1024 * 1024 * 2.5, // sample 2.5MB
      });
      setShowFileModal(false);
      setNewFileName('');
      setNewFileUrl('');
      await loadWorkspaceData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await growthApi.deleteFile(fileId);
      await loadWorkspaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: { id: TaskItem['status']; label: string; bg: string }[] = [
    { id: 'TODO', label: 'To Do', bg: 'bg-slate-100' },
    { id: 'IN_PROGRESS', label: 'In Progress', bg: 'bg-indigo-50' },
    { id: 'IN_REVIEW', label: 'In Review', bg: 'bg-amber-50' },
    { id: 'COMPLETED', label: 'Completed', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Workspace Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Collaboration Suite
          </div>
          <h3 className="text-xl font-bold text-slate-900">{projectTitle}</h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'tasks' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'activity' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Activity Stream
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'files' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Shared Files ({files.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading workspace deliverables...</div>
      ) : activeTab === 'tasks' ? (
        /* KANBAN BOARD */
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Project Task Board
            </h4>
            <button
              onClick={() => setShowTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div key={col.id} className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {col.label}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[140px]">
                    {colTasks.length === 0 ? (
                      <div className="h-24 flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                        No tasks
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-semibold text-slate-900 text-xs leading-snug">{task.title}</h5>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-slate-300 hover:text-rose-500 transition-colors p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>
                          )}

                          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                            <span
                              className={`px-1.5 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                                task.priority === 'URGENT'
                                  ? 'bg-rose-100 text-rose-700'
                                  : task.priority === 'HIGH'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {task.priority}
                            </span>

                            {/* Move status dropdown */}
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as any)}
                              className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-700"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="IN_REVIEW">In Review</option>
                              <option value="COMPLETED">Done</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'activity' ? (
        /* ACTIVITY STREAM */
        <div className="p-6">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Recent Workspace Activity
          </h4>

          {activities.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No activity recorded yet.</div>
          ) : (
            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {act.actorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{act.actorName}</span>
                      <span className="text-slate-400 text-[11px]">{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{act.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* SHARED FILES */
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Project Assets & Deliverables
            </h4>
            <button
              onClick={() => setShowFileModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all"
            >
              <UploadCloud className="w-4 h-4" /> Share File
            </button>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-xs">
              <Folder className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              No shared deliverables yet. Click "Share File" to attach specifications or source code.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs truncate max-w-[160px]">{file.name}</h5>
                      <p className="text-[11px] text-slate-500">{file.folder} • {(file.size / 1024 / 1024).toFixed(1)} MB</p>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-600 font-semibold hover:underline mt-1 inline-block"
                      >
                        Download Asset →
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Project Task</h3>
            <p className="text-xs text-slate-500 mb-4">Add a milestone deliverable or sprint ticket.</p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement OAuth login provider"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Task specifications and acceptance criteria..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Share Deliverable Asset</h3>
            <p className="text-xs text-slate-500 mb-4">Record a shared file URL or repository link for this workspace.</p>

            <form onSubmit={handleAddFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">File or Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design-System-Figma-v2.fig"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Download / Cloud URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... or https://github.com/..."
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Folder Category</label>
                <select
                  value={newFileFolder}
                  onChange={(e) => setNewFileFolder(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Designs">Designs & Mockups</option>
                  <option value="SourceCode">Source Code & Repositories</option>
                  <option value="Documents">Contracts & Specifications</option>
                  <option value="Releases">Final Deliverables & Builds</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFileModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs"
                >
                  {submitting ? 'Recording...' : 'Attach File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
