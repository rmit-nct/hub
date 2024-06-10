import React from 'react';
import FinanceCard from '@/components/finance_component/financeCard';
import ToDoTasks from '@/components/finance_component/toDoCard';
const FinanceDashboard = () => {
  return (
    <div className="flex space-x-[270px]">
    <FinanceCard />
    <ToDoTasks />
  </div>
  );
}

export default FinanceDashboard;
