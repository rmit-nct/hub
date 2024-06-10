import React from 'react';
import Image from 'next/image';

const FinanceCard = () => {
  return (
    <div className="mt-[100px] text-white ">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8 whitespace-nowrap">Welcome Finance Department!</h1>
        <div className="p-6 rounded-lg inline-block">
          <table className="min-w-full  border-collapse border border-white">
            <tbody>
              <tr className="border border-white">
                <td className="px-4 py-2 flex items-center ">
                  <Image src="/finance/income_finance.png" alt="Income Icon" width={32} height={32} className="inline-block mr-2" />
                  <div className="border-l border-white pl-2 ml-2 text-left">
                    <div className="font-bold">Income:</div>
                    <div className="font-bold">-1,333,333 VND</div>
                  </div>
                </td>
              </tr>
              <tr className="border border-white">
                <td className="px-4 py-2 flex items-center">
                  <Image src="/finance/expense_finance.png" alt="Expense Icon" width={32} height={32} className="inline-block mr-2" />
                  <div className="border-l border-white pl-2 ml-2 text-left w-[250px]">
                    <div className="font-bold">Expense:</div>
                    <div className="font-bold">1,333,333 VND</div>
                  </div>
                </td>
              </tr>
              <tr className="border border-white">
                <td className="px-4 py-2 flex items-center ">
                  <Image src="/finance/balance_finance.png" alt="Balance Icon" width={32} height={32} className="inline-block mr-2" />
                  <div className="border-l border-white pl-2 ml-2 text-left">
                    <div className='font-bold'>Total Balance:</div>
                    <div className="font-bold">8,888,888 VND</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <button className="mt-4 px-4 py-2 w-[200px] bg-blue-900 hover:bg-blue-600 text-white rounded-2xl">Adjust Amount</button>
        </div>
      </div>
    </div>
  );
};

export default FinanceCard;
