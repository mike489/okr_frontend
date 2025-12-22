import { useState } from 'react';

export const useReportPagination = (initialPage = 1, initialPerPage = 10) => {
  const [pagination, setPagination] = useState({
    page: initialPage,
    per_page: initialPerPage,
    total: 0,
    total_pages: 1,
  });

  const updatePagination = (updates = {}, dataLength = 0) => {
    setPagination((prev) => {
      const newPagination = { ...prev, ...updates };

      // If API doesn't provide pagination data, calculate client-side
      if (!updates.pagination && !updates.total && !updates.total_pages) {
        return {
          ...newPagination,
          total: dataLength,
          total_pages: Math.ceil(dataLength / newPagination.per_page),
        };
      }

      return newPagination;
    });
  };

  const handlePageChange = (event, value) => {
    updatePagination({ page: value });
  };

  const handlePerPageChange = (event) => {
    updatePagination({
      per_page: parseInt(event.target.value),
      page: 1,
    });
  };

  return {
    pagination,
    updatePagination,
    handlePageChange,
    handlePerPageChange,
  };
};
