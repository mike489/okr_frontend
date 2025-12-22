import React, { useEffect, useState } from 'react';
import { Box, Divider, Button } from '@mui/material';
import ReportHeader from './components/ReportHeader';
import ReportTable from './components/ReportTable';
import ReportDetailModal from './components/ReportDetailModal';
import { useReportPagination } from 'hooks/useReportPagination';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';

const ReportMonitoring = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [filters, setFilters] = useState({
    month: '',
    unit: '',
    scale: '',
  });

  const {
    pagination,
    updatePagination,
    handlePageChange,
    handlePerPageChange,
  } = useReportPagination();

  const handleFetchReports = async () => {
    setLoading(true);
    try {
      const token = await GetToken();
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        per_page: pagination.per_page.toString(),
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      if (filters.month) {
        params.append('month', filters.month);
      }
      if (filters.unit) {
        params.append('unit', filters.unit);
      }
      if (filters.scale) {
        params.append('scale', filters.scale);
      }

      const res = await fetch(
        `${Backend.pmsUrl(Backend.monitoringUpdate)}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setReports(data.data || []);
        if (data.pagination) {
          updatePagination((prev) => ({
            ...prev,
            total: data.pagination.total,
            total_pages:
              data.pagination.total_pages ||
              Math.ceil(data.pagination.total / prev.per_page),
          }));
        } else {
          updatePagination((prev) => ({
            ...prev,
            total: data.data?.length || 0,
            total_pages: Math.ceil((data.data?.length || 0) / prev.per_page),
          }));
        }
      } else {
        toast.error(data.message || 'Failed to load reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error(err.message || 'An error occurred while fetching reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchReports();
  }, [pagination.page, pagination.per_page]);

  // Reset page when filters change
  useEffect(() => {
    updatePagination({ page: 1 });
    handleFetchReports();
  }, [filters.month, filters.unit, filters.scale]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    updatePagination({ page: 1 });
    handleFetchReports();
  };

  const handleRefresh = () => {
    setSearch('');
    setFilters({
      month: '',
      unit: '',
      scale: '',
    });
    updatePagination({ page: 1 });
    handleFetchReports();
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleRowClick = (report) => {
    setSelectedReport(report);
    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedReport(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <ReportHeader
        title="Report Monitoring Dashboard"
        search={search}
        onSearch={handleSearch}
        onSearchSubmit={handleSearchSubmit}
        onRefresh={handleRefresh}
        loading={loading}
        onPerPageChange={handlePerPageChange}
        // New filter props
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <Divider sx={{ mb: 3 }} />

      <ReportTable
        reports={reports}
        loading={loading}
        search={search}
        pagination={pagination}
        onRowClick={handleRowClick}
        onPageChange={handlePageChange}
      />

      <ReportDetailModal
        open={openDetailModal}
        report={selectedReport}
        onClose={handleCloseDetailModal}
      />
    </Box>
  );
};

export default ReportMonitoring;
