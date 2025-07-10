import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, Mail, Phone, Building, Users, Download, FileText, Eye } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { useProjects } from '../hooks/useProjects';
import Button from '../components/UI/Button';
import { ClientModal } from '../components/Clients/ClientModal';
import { Client } from '../types';
import { exportToCSV, exportToPDF, formatDataForExport } from '../utils/exportUtils';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const { projects } = useProjects();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Check for action parameter to auto-open add modal
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      console.log('🚀 Auto-opening add client modal from dashboard');
      setShowAddModal(true);
      // Remove the action parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || client.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    'Web Development',
    'Mobile App',
    'E-commerce',
    'Consulting',
    'UI/UX Design',
    'Digital Marketing',
    'Other'
  ];

  const handleAddClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      console.log('🚀 Adding new client:', clientData);
      await addClient(clientData);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add client:', error);
    }
  };

  const handleUpdateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      await updateClient(id, clientData);
      setEditingClient(null);
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteClient(id);
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  const handleViewProjects = (clientId: string) => {
    console.log('🔍 Viewing projects for client:', clientId);
    navigate(`/projects?client=${clientId}`);
  };

  const getClientProjects = (clientId: string) => {
    return projects.filter(project => project.clientId === clientId);
  };

  const handleExportCSV = () => {
    const exportData = formatDataForExport(filteredClients, 'clients');
    exportToCSV(exportData, 'clients');
  };

  const handleExportPDF = () => {
    const exportData = formatDataForExport(filteredClients, 'clients');
    exportToPDF(exportData, 'clients', 'Client List Report');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary text-shadow-sm">Clients</h1>
          <p className="text-secondary mt-2">
            Manage your client relationships and contacts
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              icon={FileText}
            >
              Export CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              icon={Download}
            >
              Export PDF
            </Button>
          </div>
          <Button
            onClick={() => {
              console.log('🚀 Opening add client modal');
              setShowAddModal(true);
            }}
            icon={Plus}
            className="bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
          >
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Clients</p>
              <p className="text-xl font-bold text-primary">{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted">Active Clients</p>
              <p className="text-xl font-bold text-primary">
                {clients.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted">Companies</p>
              <p className="text-xl font-bold text-primary">
                {new Set(clients.map(c => c.company)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted">Categories</p>
              <p className="text-xl font-bold text-primary">
                {new Set(clients.map(c => c.category)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client, index) => {
          const clientProjects = getClientProjects(client.id);
          return (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-lg text-shadow-sm">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">
                      {client.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingClient(client)}
                    className="p-2 text-muted hover:text-link transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    aria-label="Edit client"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-2 text-muted hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                    aria-label="Delete client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-secondary">
                  <Building className="w-4 h-4" />
                  <span>{client.company}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary">
                  <Mail className="w-4 h-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">
                    Category: {client.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted">
                      {clientProjects.length} project{clientProjects.length !== 1 ? 's' : ''}
                    </span>
                    <button 
                      onClick={() => handleViewProjects(client.id)}
                      className="flex items-center space-x-1 text-link hover:text-link-hover text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Projects</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium text-primary">
              No clients found
            </h3>
            <p className="text-secondary max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first client'
              }
            </p>
            <Button
              onClick={() => {
                console.log('🚀 Opening add client modal from empty state');
                setShowAddModal(true);
              }}
              icon={Plus}
              className="bg-blue-600 hover:bg-blue-700 text-white text-shadow-sm"
            >
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                ? 'Add New Client' 
                : 'Add First Client'
              }
            </Button>
          </motion.div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <ClientModal
          isOpen={showAddModal}
          onClose={() => {
            console.log('🔄 Closing add client modal');
            setShowAddModal(false);
          }}
          onSubmit={handleAddClient}
        />
      )}

      {editingClient && (
        <ClientModal
          isOpen={!!editingClient}
          onClose={() => setEditingClient(null)}
          onSubmit={(data) => handleUpdateClient(editingClient.id, data)}
          client={editingClient}
        />
      )}
    </div>
  );
};

export default Clients;