
import React from 'react';
import Layout from '@/components/layout/Layout';
import QueueManagementContainer from '@/components/queue/management/QueueManagementContainer';

const QueueManagement = () => {
  return (
    <Layout className="overflow-hidden p-0">
      <QueueManagementContainer />
    </Layout>
  );
};

export default QueueManagement;
