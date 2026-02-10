import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Clock, FileText } from 'lucide-react';
import { caseService } from '../services/case.service';
import { evidenceService } from '../services/evidence.service';
import { Case, Evidence as EvidenceType, CreateEvidenceRequest, UpdateEvidenceRequest, EvidenceHistory, ApiError } from '../types';
import { Modal } from './Modal';

export const Evidence = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [evidence, setEvidence] = useState<EvidenceType[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceType | null>(null);
  const [evidenceHistory, setEvidenceHistory] = useState<EvidenceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [newEvidence, setNewEvidence] = useState<CreateEvidenceRequest>({
    type: '',
    description: '',
    collectedAt: new Date().toISOString().slice(0, 16),
  });

  const [editEvidence, setEditEvidence] = useState<UpdateEvidenceRequest>({});

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadEvidence();
    }
  }, [selectedCaseId]);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const data = await caseService.getAllCases();
      setCases(data);
      if (data.length > 0) {
        setSelectedCaseId(data[0].id);
      }
      setError('');
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvidence = async () => {
    if (!selectedCaseId) return;
    try {
      setIsLoading(true);
      const data = await evidenceService.getEvidenceByCase(selectedCaseId);
      setEvidence(data);
      setError('');
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvidenceHistory = async (evidenceId: string) => {
    if (!selectedCaseId) return;
    try {
      const history = await evidenceService.getEvidenceHistory(selectedCaseId, evidenceId);
      setEvidenceHistory(history);
      setIsHistoryModalOpen(true);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    }
  };

  const handleCreateEvidence = async () => {
    if (!selectedCaseId) return;
    try {
      await evidenceService.createEvidence(selectedCaseId, newEvidence);
      setIsCreateModalOpen(false);
      setNewEvidence({
        type: '',
        description: '',
        collectedAt: new Date().toISOString().slice(0, 16),
      });
      loadEvidence();
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    }
  };

  const handleUpdateEvidence = async () => {
    if (!selectedCaseId || !selectedEvidence) return;
    try {
      await evidenceService.updateEvidence(selectedCaseId, selectedEvidence.id, editEvidence);
      setIsEditModalOpen(false);
      setEditEvidence({});
      setSelectedEvidence(null);
      loadEvidence();
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!selectedCaseId) return;
    if (!confirm('Are you sure you want to delete this evidence?')) return;
    try {
      await evidenceService.deleteEvidence(selectedCaseId, evidenceId);
      loadEvidence();
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    }
  };

  const filteredEvidence = evidence.filter(
    (e) =>
      e.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Evidence Management</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedCaseId}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          Add Evidence
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Case</label>
        <select
          value={selectedCaseId}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.caseNumber} - {c.title}
            </option>
          ))}
        </select>
        {selectedCase && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{selectedCase.description}</p>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search evidence..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading evidence...</p>
        </div>
      ) : filteredEvidence.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No evidence found for this case</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvidence.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.type}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ID: {item.id.slice(0, 8)}...</p>
                  </div>
                </div>
                {item.ipfsHash && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded">
                    File Attached
                  </span>
                )}
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{item.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Collected At:</span>
                  <span className="text-gray-900 dark:text-white">{new Date(item.collectedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Collected By:</span>
                  <span className="text-gray-900 dark:text-white">{item.collectedBy}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedEvidence(item);
                    setEditEvidence({
                      type: item.type,
                      description: item.description,
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => loadEvidenceHistory(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  <Clock size={16} />
                  History
                </button>
                <button
                  onClick={() => handleDeleteEvidence(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add New Evidence">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Evidence Type</label>
            <input
              type="text"
              value={newEvidence.type}
              onChange={(e) => setNewEvidence({ ...newEvidence, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Physical, Digital, Witness Statement"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={newEvidence.description}
              onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Detailed description of the evidence"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Collected At</label>
            <input
              type="datetime-local"
              value={newEvidence.collectedAt}
              onChange={(e) => setNewEvidence({ ...newEvidence, collectedAt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IPFS Hash (Optional)</label>
            <input
              type="text"
              value={newEvidence.ipfsHash || ''}
              onChange={(e) => setNewEvidence({ ...newEvidence, ipfsHash: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="IPFS hash of related file"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button onClick={handleCreateEvidence} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Evidence
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Evidence">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Evidence Type</label>
            <input
              type="text"
              value={editEvidence.type || ''}
              onChange={(e) => setEditEvidence({ ...editEvidence, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={editEvidence.description || ''}
              onChange={(e) => setEditEvidence({ ...editEvidence, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IPFS Hash (Optional)</label>
            <input
              type="text"
              value={editEvidence.ipfsHash || ''}
              onChange={(e) => setEditEvidence({ ...editEvidence, ipfsHash: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button onClick={handleUpdateEvidence} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Update Evidence
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Evidence History" size="lg">
        <div className="space-y-3">
          {evidenceHistory.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No history found</p>
          ) : (
            evidenceHistory.map((history) => (
              <div key={history.id} className="border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-r">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-gray-900 dark:text-white">{history.action}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(history.performedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">By: {history.performedBy}</p>
                {history.changes && Object.keys(history.changes).length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded p-3 mt-2">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Changes:</p>
                    <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-auto">
                      {JSON.stringify(history.changes, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
